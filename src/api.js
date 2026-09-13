// blakfy-cookie/src/api.js — public window.BlakfyCookie surface (v1 contract preserved + v2 additions)

import { postAudit } from "./core/audit.js";
import { RUNTIME_VERSION } from "./core/config.js";
import { writeCookie, buildState } from "./core/consent-store.js";
import { scanAll } from "./gating/observer.js";
import { normalizeLocale, RTL_LOCALES } from "./i18n/detect.js";
import { getTranslation, loadTranslation, DEFAULT_LOCALE } from "./i18n/index.js";

// #60: this used to be a hand-written literal that nobody updated across
// 2.2.1/2.3.0/2.3.1/2.4.0 — window.BlakfyCookie.version and the About panel kept
// reporting 2.2.0. RUNTIME_VERSION is the same build-time-injected value #41
// already pins the status endpoint to, so there is only one source of truth now.
const VERSION = RUNTIME_VERSION;
const CATEGORIES = ["analytics", "marketing", "functional", "recording"];

export const createAPI = (ctx) => {
  const { config, emitter, deps } = ctx;
  const baseHref = ctx.baseHref;
  let state = ctx.state || null;
  let currentLocale = ctx.locale;
  const mainLang = ctx.mainLang;
  const jurisdiction = ctx.jurisdiction || "default";
  let t = getTranslation(currentLocale);

  let modalRoot = null;
  let warnedNoAuditEndpoint = false;
  let bannerRoot = null;

  const setUI = (which, root) => {
    if (which === "modal") modalRoot = root;
    if (which === "banner") bannerRoot = root;
  };

  // closeUI(force): dismissing the preferences modal (backdrop click, Escape, the X
  // button) all route through here. Before any decision exists (state === null), a
  // dismissal must never be allowed to stand in for a real choice — and closeUI()
  // removes EVERY ".blakfy-overlay" node, which also deletes the banner behind the
  // modal, not just the modal itself. Without a decision, the FAB never mounts
  // either (#34), so that combination was a dead end: no banner, no modal, no way to
  // ever open cookie preferences again on this pageload. commit() (the only path
  // that produces a real decision) passes force:true to still close normally.
  const closeUI = (force) => {
    if (!force && !state) return;
    // #35: overlays render inside the widget's shadow root now, not directly under
    // document — document.querySelectorAll never sees into a shadow tree, so the
    // mount root (shadow root, or its non-Shadow-DOM fallback) is required here.
    const queryRoot = ctx.shadowRoot || (typeof document !== "undefined" ? document : null);
    if (queryRoot) {
      const overlays = queryRoot.querySelectorAll(".blakfy-overlay");
      for (let i = 0; i < overlays.length; i++) {
        const o = overlays[i];
        if (o && o.parentNode) o.parentNode.removeChild(o);
      }
    }
    modalRoot = null;
    bannerRoot = null;
    if (deps && typeof deps.removeFocusTrap === "function") deps.removeFocusTrap();
  };

  let warnedNoCategoryArg = false;

  // #43 (comment): getConsent() called with no category silently reads state[undefined]
  // -> false, which looks exactly like "visitor rejected everything" even when they
  // accepted everything. Warn once so a wrong call is caught instead of trusted.
  const getConsent = (cat) => {
    if (cat === "essential") return true;
    if (cat === undefined && !warnedNoCategoryArg) {
      warnedNoCategoryArg = true;
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "[Blakfy Cookie] getConsent() called with no category argument — this always " +
            "returns false, which reads as 'consent denied' even for a visitor who accepted " +
            "everything. Pass a category ('analytics', 'marketing', 'functional', " +
            "'recording'), or use hasDecided() to check whether the visitor has answered at all."
        );
      }
    }
    return state ? !!state[cat] : false;
  };

  // #43 (comment): what a no-argument getConsent() call almost certainly wants —
  // "has this visitor made ANY choice yet", not "did they grant this specific category".
  const hasDecided = () => !!state;

  const grantedCategories = (s) => {
    const out = [];
    if (!s) return out;
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (s[CATEGORIES[i]]) out.push(CATEGORIES[i]);
    }
    return out;
  };

  const commit = (prefs, action, opts) => {
    const prevState = state;
    const prevGranted = grantedCategories(prevState);
    const o = opts || {};

    const next = buildState({
      prefs: prefs || {},
      currentLocale: currentLocale,
      mainLang: mainLang,
      policyVersion: config.policyVersion,
      jurisdiction: jurisdiction,
      tcString: deps && typeof deps.getTCString === "function" ? deps.getTCString() : null,
      uspString: null,
      prevId: prevState && prevState.id,
      source: o.source,
    });

    state = next;

    try {
      writeCookie(state, config.cookieDomain);
    } catch (e) {
      /* ignore */
    }

    if (config.auditEndpoint) {
      postAudit(config.auditEndpoint, {
        id: state.id,
        action: action || "save",
        timestamp: state.timestamp,
        version: state.version,
        jurisdiction: state.jurisdiction,
        locale: state.locale,
        consent: {
          analytics: state.analytics,
          marketing: state.marketing,
          functional: state.functional,
          recording: state.recording,
        },
      });
    } else if (!warnedNoAuditEndpoint && typeof console !== "undefined" && console.warn) {
      // #28: with no data-blakfy-audit-endpoint, consent changes are recorded only in
      // this browser's own cookie — there is no server-side record to show as proof
      // of consent under GDPR Art. 7(1)/KVKK Md.12. That may be a deliberate choice
      // (small site, no DPO requirement) but it must not be an unnoticed default.
      warnedNoAuditEndpoint = true;
      console.warn(
        "[Blakfy Cookie] No data-blakfy-audit-endpoint configured — consent changes are not " +
          "being recorded server-side. This means there is no proof-of-consent record " +
          "(GDPR Art. 7(1) / KVKK Md.12) if ever challenged. See docs/compliance.md §10 " +
          "for the payload shape and a reference endpoint, or set " +
          "data-blakfy-audit-endpoint if you have already built one."
      );
    }

    if (deps && typeof deps.pushGCM === "function") deps.pushGCM(state);
    if (deps && typeof deps.pushUET === "function") deps.pushUET(state);
    if (deps && typeof deps.installHostAdapter === "function") deps.installHostAdapter(state);
    if (deps && typeof deps.applyYandex === "function") {
      deps.applyYandex(state, {
        unblock: (cat) => {
          if (deps.unblockScripts) deps.unblockScripts(cat);
          if (deps.unblockIframes) deps.unblockIframes(cat);
        },
        runCleanup: deps.runCleanup,
      });
    }

    const nowGranted = grantedCategories(state);
    for (let i = 0; i < nowGranted.length; i++) {
      const cat = nowGranted[i];
      if (deps && deps.unblockScripts) deps.unblockScripts(cat);
      if (deps && deps.unblockIframes) deps.unblockIframes(cat);
    }

    for (let j = 0; j < prevGranted.length; j++) {
      const c = prevGranted[j];
      if (nowGranted.indexOf(c) === -1) {
        if (deps && typeof deps.runCleanup === "function") deps.runCleanup(c);
      }
    }

    emitter.emit("change", state);
    for (let k = 0; k < CATEGORIES.length; k++) {
      const cat = CATEGORIES[k];
      const wasGranted = prevGranted.indexOf(cat) > -1;
      const isGranted = nowGranted.indexOf(cat) > -1;
      if (!wasGranted && isGranted) emitter.emit("consent:" + cat, true);
      if (wasGranted && !isGranted) emitter.emit("consent:" + cat, false);
    }

    closeUI(true);
  };

  const acceptAll = () =>
    commit({ analytics: true, marketing: true, functional: true, recording: true }, "accept_all");
  const rejectAll = () =>
    commit(
      { analytics: false, marketing: false, functional: false, recording: false },
      "reject_all"
    );

  const open = () => {
    if (deps && typeof deps.openModal === "function")
      deps.openModal({ commit: commit, t: t, currentLocale: currentLocale, state: state });
  };

  // #49: BlakfyCookie.openPolicy() — the issue asks for a footer link to reach the
  // in-widget notice too, not only the banner's own link.
  const openPolicy = () => {
    if (deps && typeof deps.openModal === "function")
      deps.openModal({
        commit: commit,
        t: t,
        currentLocale: currentLocale,
        state: state,
        tab: "policy",
      });
  };

  // #45: return an unsubscribe function. Without it, a caller that subscribes on every
  // mount (e.g. the Next wrapper's useBlakfyConsent() hook, remounted on every App
  // Router route that renders it) has no way to detach the old listener — listeners
  // accumulate for the life of the page.
  const onChange = (fn) => {
    emitter.on("change", fn);
    return () => emitter.off("change", fn);
  };

  const onConsent = (category, fn) => {
    if (typeof fn !== "function") return;
    if (getConsent(category)) {
      try {
        fn(true);
      } catch (e) {
        /* swallow */
      }
    }
    emitter.on("consent:" + category, fn);
  };

  // #38: setLocale() stays a synchronous public contract (types.d.ts: void return) — it
  // must not become a Promise callers are expected to await. It applies whichever
  // translation is already available immediately (bundled tr/en, or an already-loaded
  // remote chunk), then — for a remote locale not yet fetched — kicks off the
  // code-split dist/i18n/{locale}.min.js load in the background and re-emits "locale"
  // a second time once it lands, so any UI already re-rendered from the first emit
  // (with DEFAULT_LOCALE text as an interim fallback) gets corrected in place.
  const setLocale = (loc) => {
    const resolved = normalizeLocale(loc);
    if (!resolved) return;
    currentLocale = resolved;
    t = getTranslation(resolved) || getTranslation(DEFAULT_LOCALE);
    emitter.emit("locale", { locale: resolved, t: t, isRTL: RTL_LOCALES.indexOf(resolved) > -1 });

    loadTranslation(resolved, baseHref).then((loaded) => {
      if (currentLocale !== resolved || !loaded || loaded === t) return;
      t = loaded;
      emitter.emit("locale", { locale: resolved, t: t, isRTL: RTL_LOCALES.indexOf(resolved) > -1 });
    });
  };

  const getMainLang = () => mainLang;
  const getState = () => state;
  const getJurisdiction = () => jurisdiction;

  const unblock = (category) => {
    if (!deps) return;
    if (typeof deps.unblockScripts === "function") deps.unblockScripts(category);
    if (typeof deps.unblockIframes === "function") deps.unblockIframes(category);
  };

  const scan = () => {
    const granted = scanAll({ getConsent: getConsent });
    for (let i = 0; i < granted.length; i++) unblock(granted[i]);
    return granted;
  };

  const usePreset = (name) => {
    if (!deps || typeof deps.applyPreset !== "function") return null;
    return deps.applyPreset(name, { registerCleanup: deps.registerCleanup });
  };

  const registerCleanup = (opts) => {
    if (deps && typeof deps.registerCleanup === "function") deps.registerCleanup(opts);
  };

  const tcf = {
    getTCString: () => (deps && typeof deps.getTCString === "function" ? deps.getTCString() : ""),
  };

  const ccpa = {
    optOut: () => {
      if (deps && typeof deps.optOutCCPA === "function") deps.optOutCCPA();
    },
    isOptedOut: () =>
      deps && typeof deps.isOptedOutCCPA === "function" ? !!deps.isOptedOutCCPA() : false,
  };

  // #43: BlakfyCookie.diagnose() — one call instead of a manual browser session to
  // answer "is this install actually working". Filled in by index.js bootstrap via
  // deps.getDiagnostics, which has access to placement/defaults/preset/cookie state
  // this module does not hold directly.
  const diagnose = () => {
    if (deps && typeof deps.getDiagnostics === "function") {
      return deps.getDiagnostics({ state: state, jurisdiction: jurisdiction });
    }
    return {
      placementOk: null,
      defaultsFired: null,
      presetsRegistered: [],
      unrecognizedCookies: [],
      googleConsentState: null,
      note: "diagnostics unavailable — deps.getDiagnostics was not wired by bootstrap",
    };
  };

  return {
    version: VERSION,
    open: open,
    openPolicy: openPolicy,
    acceptAll: acceptAll,
    rejectAll: rejectAll,
    getConsent: getConsent,
    hasDecided: hasDecided,
    getState: getState,
    onChange: onChange,
    setLocale: setLocale,
    getMainLang: getMainLang,
    onConsent: onConsent,
    registerCleanup: registerCleanup,
    unblock: unblock,
    scan: scan,
    usePreset: usePreset,
    tcf: tcf,
    ccpa: ccpa,
    getJurisdiction: getJurisdiction,
    diagnose: diagnose,
    __internal: { commit: commit, setUI: setUI, closeUI: closeUI },
  };
};
