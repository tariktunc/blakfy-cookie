// blakfy-cookie/src/index.js — bootstrap entry; wires modules and assigns window.BlakfyCookie

import { installHostAdapter } from "./adapters/host-adapters.js";
import { createAPI } from "./api.js";
import {
  installUSP,
  installDoNotSellLink,
  optOut as optOutCCPA,
  isOptedOut as isOptedOutCCPA,
} from "./compliance/ccpa.js";
import { getDNT, applyDNT } from "./compliance/dnt.js";
import {
  installDefaults as installGCMDefaults,
  pushGCM,
  isDefaultsInstalled as isGCMDefaultsInstalled,
} from "./compliance/google-cmv2.js";
import { getGPC, applyGPC } from "./compliance/gpc.js";
import { installGPPAPI } from "./compliance/gpp.js";
import { installDefaults as installUETDefaults, pushUET } from "./compliance/microsoft-uet.js";
import { installTCFAPI, getTCString } from "./compliance/tcf-v2.js";
import {
  installDefaults as installYandexDefaults,
  applyYandex,
} from "./compliance/yandex-metrica.js";
import { getScriptEl, readConfig, detectPlacementIssue } from "./core/config.js";
import { readCookie, writeCookie, buildState } from "./core/consent-store.js";
import { createEmitter } from "./core/events.js";
import { listObservedCookies, deleteObservedCookie } from "./data/cookie-inspector.js";
import {
  runCleanup,
  registerCleanup,
  warnUnregisteredCookies,
  warnPreConsentCookies,
} from "./gating/cleaner.js";
import { unblockIframes, installPlaceholders } from "./gating/iframe-unblocker.js";
import { scanForLeaks, warnLeaks } from "./gating/leak-detector.js";
import { startObserver, scanAll } from "./gating/observer.js";
import { unblockScripts } from "./gating/script-unblocker.js";
import { detectJurisdiction } from "./geo/jurisdiction.js";
import { detectLocale, detectMainLang, RTL_LOCALES } from "./i18n/detect.js";
import { getTranslation, loadTranslation } from "./i18n/index.js";
import { applyPreset, PRESETS } from "./presets/_registry.js";
import { mountBadges, installAntiTamper } from "./ui/badge.js";
import { createBanner } from "./ui/banner.js";
import { createFab, resolveFabConfig, applyFabTokens } from "./ui/fab.js";
import { installFocusTrap, removeFocusTrap } from "./ui/focus-trap.js";
import { createModal } from "./ui/modal.js";
import { getShadowRoot, getShadowHost } from "./ui/shadow-root.js";
import { fetchStatus, renderStatus } from "./ui/status-bar.js";
import { injectStyles } from "./ui/styles.js";
import {
  detectSiteTheme,
  watchSiteTheme,
  applyThemeToCard,
  normalizeThemeValue,
} from "./ui/theme-bridge.js";

const ROOT_OVERLAY_CLASS = "blakfy-overlay";

const VALID_POSITIONS = {
  "bottom-center": 1,
  "bottom-right": 1,
  "bottom-left": 1,
  "top-center": 1,
  "top-right": 1,
  "top-left": 1,
  center: 1,
};

const resolvePosition = (raw) => {
  if (raw && Object.prototype.hasOwnProperty.call(VALID_POSITIONS, raw)) return raw;
  return "bottom-center";
};

const MIN_MARGIN_PX = 5;

const resolveMargin = (raw) => {
  const n = parseInt(raw, 10);
  if (isNaN(n)) return 16;
  return Math.max(MIN_MARGIN_PX, n);
};

const bootstrap = async () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.BlakfyCookie && window.BlakfyCookie.__bootstrapped) return;

  // 1. config
  const scriptEl = getScriptEl();
  const config = readConfig(scriptEl);

  // #43: an inert widget with no error is the worst failure shape for a compliance
  // product. Catch the two placement mistakes found in the field (async attribute,
  // <head> placement) before anything else runs.
  const placementIssue = detectPlacementIssue(scriptEl);
  if (placementIssue && typeof console !== "undefined" && console.error) {
    console.error("[Blakfy Cookie] Installation problem: " + placementIssue);
  }

  // #43: was window.__blakfyConsentDefaultsLoaded (cookie-defaults.min.js) set BEFORE
  // this main bundle ran? If not, any tag that fired between page load and this point
  // never saw a "denied" Consent Mode default — the file that "makes the whole thing
  // lawful for Google tags" (issue #43) silently never loaded.
  const defaultsFileRanFirst =
    typeof window !== "undefined" && !!window.__blakfyConsentDefaultsLoaded;
  if (!defaultsFileRanFirst && typeof console !== "undefined" && console.warn) {
    console.warn(
      "[Blakfy Cookie] cookie-defaults.min.js did not run before this bundle initialised " +
        "(window.__blakfyConsentDefaultsLoaded was not set). Consent Mode denied-by-default " +
        "signals are being installed late by this bundle instead of at head-load time — any " +
        "tag that fired before now had no default to respect. Add cookie-defaults.min.js in " +
        "<head>, loaded first, per the install docs."
    );
  }

  // 2. locale + translations
  const currentLocale = detectLocale({ configLocale: config.locale });
  const mainLang = detectMainLang({ configMainLang: config.mainLang });
  // #38: tr/en are bundled inline; every other locale is a separate dist/i18n/{locale}.min.js
  // chunk fetched here as a sibling of this script's own src. Nothing has rendered yet at
  // this point in init(), so awaiting it costs one extra network round trip on first paint
  // for non-tr/en sites only, and never touches tr/en sites (getTranslation resolves them
  // synchronously without going through loadTranslation's script-injection path).
  let t = await loadTranslation(currentLocale, scriptEl && scriptEl.src);
  let isRTL = RTL_LOCALES.indexOf(currentLocale) > -1;

  // 2b. resolve theme via bridge: explicit (light/dark/gray) bypasses bridge;
  // "auto" reads host site's class/data-theme contract, watches for changes.
  const normalized = normalizeThemeValue(config.theme);
  const isExplicit = normalized === "light" || normalized === "dark" || normalized === "gray";
  let theme = isExplicit ? normalized : detectSiteTheme();
  const trackedCards = new Set();
  let unwatchTheme = null;

  if (!isExplicit) {
    unwatchTheme = watchSiteTheme((next) => {
      theme = next;
      trackedCards.forEach((card) => {
        // #35: card lives inside the widget's shadow root — document.body.contains()
        // does not pierce shadow boundaries, so isConnected is the correct liveness
        // check regardless of which tree the node is attached in.
        if (!card || !card.isConnected) {
          trackedCards.delete(card);
          return;
        }
        applyThemeToCard(card, next);
      });
    });
  }

  // 3. styles — #35: mount root is a shadow root (single host `#blakfy-cookie-root`);
  // banner/modal/FAB and their stylesheet all live inside it, isolated from host CSS.
  const shadowRoot = getShadowRoot();
  injectStyles(shadowRoot);

  // 4. emitter
  const emitter = createEmitter();

  // 5. jurisdiction
  let jurisdiction = "default";
  try {
    jurisdiction = await detectJurisdiction({});
  } catch (e) {
    jurisdiction = "default";
  }

  // 6. install compliance defaults (idempotent — cookie-defaults bundle may have already run)
  installGCMDefaults();
  installUETDefaults();
  installYandexDefaults();

  // 9. read cookie BEFORE TCF setup so getConsent reads accurate state
  let state = readCookie(config.policyVersion);

  // 7. TCF
  if (config.tcf === "true") {
    installTCFAPI({
      cmpId: parseInt(config.cmpId, 10) || 0,
      cmpVersion: 1,
      getConsent: () => state || {},
      on: emitter.on,
    });
  }

  // 8. CCPA (+ GPP, #32 — kept alongside __uspapi for backwards compatibility during the
  // industry's USP -> GPP transition; see compliance/gpp.js for scope limits)
  const ccpaOn = config.ccpa === "true" || (config.ccpa === "auto" && jurisdiction === "CCPA");
  if (ccpaOn) {
    installUSP({});
    installDoNotSellLink({ t: t });
    installGPPAPI({
      getConsent: () => state || {},
      getGpc: getGPC,
      applicableSections: [7],
      on: emitter.on,
    });
  }

  // 10. DNT
  if (getDNT() && config.dnt === "auto-deny" && !state) {
    applyDNT({
      mode: "auto-deny",
      setPrefs: () => {
        /* applied at banner default */
      },
    });
  }

  // 11. GPC (#32) — only act if the user has not yet made an explicit decision.
  // CCPA/CPRA jurisdictions: GPC is a legally binding opt-out signal and must be
  // enforced without presenting it as a choice — persist a denied consent record
  // now (source: "gpc") and flip the CCPA opt-out flag, rather than just leaving
  // in-memory defaults denied. GDPR/default jurisdictions: opt-in already denies
  // analytics/marketing by default, so GPC has no additional effect there — this
  // is a deliberate decision (EDPB treats automated signals favourably but does
  // not require CCPA-style enforcement under GDPR), not an oversight.
  if (getGPC() && config.gpc === "respect" && !state) {
    const gpcResult = applyGPC({
      mode: "respect",
      currentState: null,
      setPrefs: () => {
        /* defaults remain denied for non-CCPA jurisdictions */
      },
    });
    if (gpcResult.applied && jurisdiction === "CCPA") {
      state = buildState({
        prefs: { analytics: false, marketing: false, functional: false, recording: false },
        currentLocale: currentLocale,
        mainLang: mainLang,
        policyVersion: config.policyVersion,
        jurisdiction: jurisdiction,
        source: "gpc",
      });
      try {
        writeCookie(state, config.cookieDomain);
      } catch (e) {
        /* ignore */
      }
      optOutCCPA();
    }
  }

  // 12. Apply presets (list kept in closure for Services tab)
  let activePresetList = [];
  if (config.presets) {
    activePresetList = String(config.presets)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (let i = 0; i < activePresetList.length; i++) {
      try {
        applyPreset(activePresetList[i], { registerCleanup: registerCleanup });
      } catch (e) {
        /* ignore */
      }
    }
  }

  // 13. createAPI + window guard
  const api = createAPI({
    state: state,
    config: config,
    emitter: emitter,
    locale: currentLocale,
    baseHref: scriptEl && scriptEl.src,
    mainLang: mainLang,
    jurisdiction: jurisdiction,
    // #35: closeUI() needs to query overlays inside the shadow root, not document —
    // document.querySelectorAll cannot see across the shadow boundary.
    shadowRoot: shadowRoot,
    deps: {
      unblockScripts: unblockScripts,
      unblockIframes: unblockIframes,
      runCleanup: runCleanup,
      registerCleanup: registerCleanup,
      applyPreset: applyPreset,
      pushGCM: pushGCM,
      pushUET: pushUET,
      applyYandex: applyYandex,
      // #24 (item 3): auto-bridge to a documented host-platform consent API when one
      // exists (Shopify Customer Privacy API, WP Consent API); detection-only warning
      // otherwise. `scriptEl` carries the optional data-blakfy-host override.
      installHostAdapter: (s) => installHostAdapter(s, scriptEl),
      getTCString: getTCString,
      optOutCCPA: optOutCCPA,
      isOptedOutCCPA: isOptedOutCCPA,
      removeFocusTrap: removeFocusTrap,
      openModal: (opts) => mountModal(opts),
      // #43: BlakfyCookie.diagnose() — the self-check the issue asks for, one call
      // instead of a manual browser session.
      getDiagnostics: ({ jurisdiction: jur }) => ({
        placementOk: !placementIssue,
        placementIssue: placementIssue,
        defaultsFileRanFirst: defaultsFileRanFirst,
        gcmDefaultsFired: isGCMDefaultsInstalled(),
        presetsRegistered: activePresetList.slice(),
        unrecognizedCookies: warnUnregisteredCookies(PRESETS).map((f) => f.cookie),
        preConsentCookies: warnPreConsentCookies(PRESETS, api.getConsent).map((f) => f.cookie),
        jurisdiction: jur,
      }),
    },
  });

  api.__bootstrapped = true;

  // Keep API state in sync after each commit
  emitter.on("change", (s) => {
    state = s;
    // #34: first-ever decision (accept/reject/save) — the banner just closed
    // and never returns on its own, so this is the only remaining way back in.
    mountFab();
  });

  // Locale switching: re-render visible UI
  emitter.on("locale", (info) => {
    t = info.t;
    isRTL = info.isRTL;
  });

  // getLeaks(): finds known tracker scripts (from active presets) running outside
  // Blakfy's own type="text/plain" gate — e.g. a platform-native integration
  // (Wix Marketing Tags, Shopify Preferences) loading the same tool unmanaged.
  api.getLeaks = () =>
    scanForLeaks({
      activePresetNames: activePresetList,
      presets: PRESETS,
      getConsent: api.getConsent,
    });

  if (!window.BlakfyCookie) {
    window.BlakfyCookie = api;
    try {
      window.dispatchEvent(new CustomEvent("blakfy:ready", { detail: { version: api.version } }));
    } catch (e) {
      /* CustomEvent unsupported in very old browsers */
    }
  }

  // Leak scan: run once after platform-native async loaders have had a chance to
  // inject their own copy of a tracker we also manage. Delayed on purpose — scanning
  // immediately would miss scripts platforms inject asynchronously post-load.
  if (activePresetList.length && typeof window.setTimeout === "function") {
    window.setTimeout(() => {
      try {
        warnLeaks(api.getLeaks());
      } catch (e) {
        /* ignore */
      }
    }, 3000);
  }

  // #25: warn about known-tracker cookies with no registered cleanup rule (e.g. no
  // data-blakfy-presets at all, or an incomplete list) — same delayed timing as the
  // leak scan, for the same reason (host-injected cookies may arrive late).
  if (typeof window.setTimeout === "function") {
    window.setTimeout(() => {
      try {
        warnUnregisteredCookies(PRESETS);
      } catch (e) {
        /* ignore */
      }
      // #43: registered-but-already-present pre-consent cookies (platform-injected
      // tags bypassing our gate). Same delayed timing, same reason.
      try {
        warnPreConsentCookies(PRESETS, api.getConsent);
      } catch (e) {
        /* ignore */
      }
    }, 3000);
  }

  // Helper: mount banner overlay
  const mountBanner = () => {
    const overlay = document.createElement("div");
    overlay.className = ROOT_OVERLAY_CLASS + " widget " + resolvePosition(config.position);
    overlay.style.setProperty("--blakfy-margin", resolveMargin(config.margin) + "px");
    const card = createBanner({
      t: t,
      isRTL: isRTL,
      accent: config.accent,
      theme: theme,
      locale: currentLocale,
      policyUrl: config.policyUrl,
      onAccept: () => api.acceptAll(),
      onReject: () => api.rejectAll(),
      onPrefs: () =>
        mountModal({
          commit: api.__internal.commit,
          t: t,
          currentLocale: currentLocale,
          state: state,
        }),
      onOpenPolicy: () => mountModal({ t: t, tab: "policy" }),
    });
    overlay.appendChild(card);
    shadowRoot.appendChild(overlay);
    api.__internal.setUI("banner", overlay);
    if (!isExplicit) trackedCards.add(card);
    mountBadges(card);
    installAntiTamper(card, shadowRoot);
    // #27: no separate aria-live announcement region — the banner is a non-modal
    // dialog (role="dialog", no aria-modal, background stays reachable) and
    // installFocusTrap() moves focus onto it the moment it renders, which already
    // triggers the screen reader's dialog announcement (label + description) per
    // the ARIA APG. Documented here per the issue's "pick one and document why".
    installFocusTrap(card, {
      onEscape: () => {
        /* banner non-dismissible via ESC */
      },
    });
    return overlay;
  };

  // Helper: mount modal overlay
  function mountModal(opts) {
    const existing = shadowRoot.querySelectorAll("." + ROOT_OVERLAY_CLASS + ".modal");
    for (let i = 0; i < existing.length; i++) {
      if (existing[i].parentNode) existing[i].parentNode.removeChild(existing[i]);
    }
    const overlay = document.createElement("div");
    overlay.className = ROOT_OVERLAY_CLASS + " modal";
    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) api.__internal.closeUI();
    });
    const card = createModal({
      t: (opts && opts.t) || t,
      isRTL: isRTL,
      accent: config.accent,
      theme: theme,
      locale: currentLocale,
      currentState: state,
      presets: activePresetList,
      version: api.version,
      onSave: (prefs) => api.__internal.commit(prefs, "save"),
      onAccept: () => api.acceptAll(),
      onClose: () => api.__internal.closeUI(),
      // #49: in-widget policy notice — passed through regardless of tab so the
      // Policy tab is available every time the modal opens, not only via openPolicy().
      policyUrl: config.policyUrl,
      operator: config.operator,
      operatorContact: config.operatorContact,
      operatorAddress: config.operatorAddress,
      jurisdiction: jurisdiction,
      policyVersion: config.policyVersion,
      initialTab: opts && opts.tab,
      // #39: transparency panel reads against the FULL preset registry (not just the
      // active list above) so a platform-injected tracker with no matching
      // data-blakfy-presets entry still shows up correctly attributed instead of
      // falling into "unrecognised".
      cookiePanel: config.cookiePanel,
      observedCookies: config.cookiePanel ? listObservedCookies(PRESETS) : null,
      onDeleteCookie: (name) => deleteObservedCookie(name),
    });
    overlay.appendChild(card);
    shadowRoot.appendChild(overlay);
    api.__internal.setUI("modal", overlay);
    if (!isExplicit) trackedCards.add(card);
    mountBadges(card);
    installAntiTamper(card, shadowRoot);
    // #27: this IS the true modal dialog — trap background content with `inert`
    // (tabindex/aria-hidden fallback for older browsers), lock body scroll while
    // open, and return focus to whatever opened it (e.g. the banner's "Preferences"
    // button) once it closes.
    installFocusTrap(card, {
      onEscape: () => api.__internal.closeUI(),
      trapBackground: true,
      lockScroll: true,
      // #35: the light-DOM body child to leave interactive while the modal traps
      // focus is the shadow host itself — everything the widget renders (banner,
      // modal, FAB) lives inside it, in the same shadow root.
      inertSkipEl: getShadowHost(),
    });
    return overlay;
  }

  // #34: reopen control — rendered only once a consent decision exists (while
  // the banner is up, a second entry point to the same choice is redundant).
  // Mounted once; survives closeUI() because it is not a .blakfy-overlay.
  let fabMounted = false;
  const mountFab = () => {
    if (fabMounted || typeof document === "undefined") return;
    const resolved = resolveFabConfig(config);
    if (!resolved) return; // data-blakfy-fab="off"
    const fab = createFab({
      // No dedicated i18n key added (would require touching all 23 locale
      // files for one string) — reuses the existing "preferences" string,
      // which already reads correctly as a reopen-the-consent-choices label.
      ariaLabel: t.preferences,
      isRTL: isRTL,
      onOpen: () =>
        mountModal({
          commit: api.__internal.commit,
          t: t,
          currentLocale: currentLocale,
          state: state,
        }),
    });
    if (!fab) return;
    applyFabTokens(fab, resolved);
    shadowRoot.appendChild(fab);
    fabMounted = true;
  };

  // 14./15. Branch on existing state
  if (state) {
    pushGCM(state);
    pushUET(state);
    installHostAdapter(state, scriptEl);
    applyYandex(state, {
      unblock: (cat) => {
        unblockScripts(cat);
        unblockIframes(cat);
      },
      runCleanup: runCleanup,
    });
    const granted = scanAll({ getConsent: api.getConsent });
    for (let i = 0; i < granted.length; i++) {
      unblockScripts(granted[i]);
      unblockIframes(granted[i]);
    }
    installPlaceholders(t, (cat) => {
      mountModal({
        commit: api.__internal.commit,
        t: t,
        currentLocale: currentLocale,
        state: state,
      });
    });
    mountFab();
  } else {
    mountBanner();
    installPlaceholders(t, () => {
      mountModal({
        commit: api.__internal.commit,
        t: t,
        currentLocale: currentLocale,
        state: state,
      });
    });
  }

  // 16. SPA observer
  startObserver({
    getConsent: api.getConsent,
    onScan: (cat) => {
      unblockScripts(cat);
      unblockIframes(cat);
    },
  });

  // 17. status bar
  if (config.statusEnabled && config.statusUrl) {
    fetchStatus(config.statusUrl).then((data) => {
      if (data) renderStatus({ data: data, currentLocale: currentLocale, mainLang: mainLang });
    });
  }

  // 18. cleanup theme bridge on page unload (best-effort; SPAs typically never unload)
  if (unwatchTheme && typeof window.addEventListener === "function") {
    window.addEventListener(
      "pagehide",
      () => {
        try {
          unwatchTheme();
        } catch (e) {
          /* ignore */
        }
      },
      { once: true }
    );
  }
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bootstrap();
    });
  } else {
    bootstrap();
  }
}

export default bootstrap;
