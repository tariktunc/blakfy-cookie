// blakfy-cookie/src/index.js — bootstrap entry; wires modules and assigns window.BlakfyCookie

import { getScriptEl, readConfig } from "./core/config.js";
import { readCookie } from "./core/consent-store.js";
import { createEmitter } from "./core/events.js";
import { detectLocale, detectMainLang, RTL_LOCALES } from "./i18n/detect.js";
import { getTranslation } from "./i18n/index.js";
import { injectStyles } from "./ui/styles.js";
import { createBanner } from "./ui/banner.js";
import { createModal } from "./ui/modal.js";
import { mountBadges, installAntiTamper } from "./ui/badge.js";
import { installFocusTrap, removeFocusTrap } from "./ui/focus-trap.js";
import { fetchStatus, renderStatus } from "./ui/status-bar.js";
import { unblockScripts } from "./gating/script-unblocker.js";
import { unblockIframes, installPlaceholders } from "./gating/iframe-unblocker.js";
import { startObserver, scanAll } from "./gating/observer.js";
import { runCleanup, registerCleanup } from "./gating/cleaner.js";
import { applyPreset } from "./presets/_registry.js";
import {
  installDefaults as installGCMDefaults,
  pushGCM
} from "./compliance/google-cmv2.js";
import {
  installDefaults as installUETDefaults,
  pushUET
} from "./compliance/microsoft-uet.js";
import {
  installDefaults as installYandexDefaults,
  applyYandex
} from "./compliance/yandex-metrica.js";
import { installTCFAPI, getTCString } from "./compliance/tcf-v2.js";
import { installUSP, installDoNotSellLink, optOut as optOutCCPA, isOptedOut as isOptedOutCCPA } from "./compliance/ccpa.js";
import { getGPC, applyGPC } from "./compliance/gpc.js";
import { getDNT, applyDNT } from "./compliance/dnt.js";
import { detectJurisdiction } from "./geo/jurisdiction.js";
import { createAPI } from "./api.js";

const ROOT_OVERLAY_CLASS = "blakfy-overlay";

const bootstrap = async () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.BlakfyCookie && window.BlakfyCookie.__bootstrapped) return;

  // 1. config
  const scriptEl = getScriptEl();
  const config = readConfig(scriptEl);

  // 2. locale + translations
  const currentLocale = detectLocale({ configLocale: config.locale });
  const mainLang = detectMainLang({ configMainLang: config.mainLang });
  let t = getTranslation(currentLocale);
  let isRTL = RTL_LOCALES.indexOf(currentLocale) > -1;

  // 2b. resolve theme: auto → light/dark via matchMedia; aliases white→light, black→dark
  const resolveTheme = (raw) => {
    if (raw === "auto") {
      try { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } catch (e) { return "light"; }
    }
    if (raw === "black") return "dark";
    if (raw === "white") return "light";
    return raw || "light";
  };
  const theme = resolveTheme(config.theme);

  // 3. styles
  injectStyles();

  // 4. emitter
  const emitter = createEmitter();

  // 5. jurisdiction
  let jurisdiction = "default";
  try { jurisdiction = await detectJurisdiction({}); } catch (e) { jurisdiction = "default"; }

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
      on: emitter.on
    });
  }

  // 8. CCPA
  const ccpaOn = config.ccpa === "true" || (config.ccpa === "auto" && jurisdiction === "CCPA");
  if (ccpaOn) {
    installUSP({});
    installDoNotSellLink({ t: t });
  }

  // 10. DNT
  if (getDNT() && config.dnt === "auto-deny" && !state) {
    applyDNT({ mode: "auto-deny", setPrefs: () => { /* applied at banner default */ } });
  }

  // 11. GPC — only mutate defaults if user has not yet decided
  if (getGPC() && config.gpc === "respect" && !state) {
    applyGPC({ mode: "respect", currentState: null, setPrefs: () => { /* defaults remain denied */ } });
  }

  // 12. Apply presets (list kept in closure for Services tab)
  let activePresetList = [];
  if (config.presets) {
    activePresetList = String(config.presets).split(",").map((s) => s.trim()).filter(Boolean);
    for (let i = 0; i < activePresetList.length; i++) {
      try { applyPreset(activePresetList[i], { registerCleanup: registerCleanup }); } catch (e) { /* ignore */ }
    }
  }

  // 13. createAPI + window guard
  const api = createAPI({
    state: state,
    config: config,
    emitter: emitter,
    locale: currentLocale,
    mainLang: mainLang,
    jurisdiction: jurisdiction,
    deps: {
      unblockScripts: unblockScripts,
      unblockIframes: unblockIframes,
      runCleanup: runCleanup,
      registerCleanup: registerCleanup,
      applyPreset: applyPreset,
      pushGCM: pushGCM,
      pushUET: pushUET,
      applyYandex: applyYandex,
      getTCString: getTCString,
      optOutCCPA: optOutCCPA,
      isOptedOutCCPA: isOptedOutCCPA,
      removeFocusTrap: removeFocusTrap,
      openModal: (opts) => mountModal(opts)
    }
  });

  api.__bootstrapped = true;

  // Keep API state in sync after each commit
  emitter.on("change", (s) => { state = s; });

  // Locale switching: re-render visible UI
  emitter.on("locale", (info) => {
    t = info.t;
    isRTL = info.isRTL;
  });

  if (!window.BlakfyCookie) {
    window.BlakfyCookie = api;
    try {
      window.dispatchEvent(new CustomEvent("blakfy:ready", { detail: { version: api.version } }));
    } catch (e) { /* CustomEvent unsupported in very old browsers */ }
  }

  // Helper: mount banner overlay
  const mountBanner = () => {
    const overlay = document.createElement("div");
    overlay.className = ROOT_OVERLAY_CLASS + " widget " + (config.position || "bottom-right");
    const card = createBanner({
      t: t,
      isRTL: isRTL,
      accent: config.accent,
      theme: theme,
      policyUrl: config.policyUrl,
      onAccept: () => api.acceptAll(),
      onReject: () => api.rejectAll(),
      onPrefs: () => mountModal({ commit: api.__internal.commit, t: t, currentLocale: currentLocale, state: state })
    });
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    api.__internal.setUI("banner", overlay);
    mountBadges(card);
    installAntiTamper(card);
    installFocusTrap(card, { onEscape: () => { /* banner non-dismissible via ESC */ } });
    return overlay;
  };

  // Helper: mount modal overlay
  function mountModal(opts) {
    const existing = document.querySelectorAll("." + ROOT_OVERLAY_CLASS + ".modal");
    for (let i = 0; i < existing.length; i++) {
      if (existing[i].parentNode) existing[i].parentNode.removeChild(existing[i]);
    }
    const overlay = document.createElement("div");
    overlay.className = ROOT_OVERLAY_CLASS + " modal";
    overlay.addEventListener("click", (ev) => { if (ev.target === overlay) api.__internal.closeUI(); });
    const card = createModal({
      t: (opts && opts.t) || t,
      isRTL: isRTL,
      accent: config.accent,
      theme: theme,
      currentState: state,
      presets: activePresetList,
      version: api.version,
      onSave: (prefs) => api.__internal.commit(prefs, "save"),
      onAccept: () => api.acceptAll(),
      onClose: () => api.__internal.closeUI()
    });
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    api.__internal.setUI("modal", overlay);
    mountBadges(card);
    installAntiTamper(card);
    installFocusTrap(card, { onEscape: () => api.__internal.closeUI() });
    return overlay;
  }

  // 14./15. Branch on existing state
  if (state) {
    pushGCM(state);
    pushUET(state);
    applyYandex(state, {
      unblock: (cat) => { unblockScripts(cat); unblockIframes(cat); },
      runCleanup: runCleanup
    });
    const granted = scanAll({ getConsent: api.getConsent });
    for (let i = 0; i < granted.length; i++) {
      unblockScripts(granted[i]);
      unblockIframes(granted[i]);
    }
    installPlaceholders(t, (cat) => {
      mountModal({ commit: api.__internal.commit, t: t, currentLocale: currentLocale, state: state });
    });
  } else {
    mountBanner();
    installPlaceholders(t, () => {
      mountModal({ commit: api.__internal.commit, t: t, currentLocale: currentLocale, state: state });
    });
  }

  // 16. SPA observer
  startObserver({
    getConsent: api.getConsent,
    onScan: (cat) => {
      unblockScripts(cat);
      unblockIframes(cat);
    }
  });

  // 17. status bar
  if (config.statusEnabled && config.statusUrl) {
    fetchStatus(config.statusUrl).then((data) => {
      if (data) renderStatus({ data: data, currentLocale: currentLocale, mainLang: mainLang });
    });
  }
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { bootstrap(); });
  } else {
    bootstrap();
  }
}

export default bootstrap;
