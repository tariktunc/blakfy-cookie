// blakfy-cookie/src/api.js — public window.BlakfyCookie surface (v1 contract preserved + v2 additions)

import { writeCookie, buildState } from "./core/consent-store.js";
import { postAudit } from "./core/audit.js";
import { getTranslation, DEFAULT_LOCALE } from "./i18n/index.js";
import { normalizeLocale, RTL_LOCALES } from "./i18n/detect.js";
import { scanAll } from "./gating/observer.js";

const VERSION = "2.1.0";
const CATEGORIES = ["analytics", "marketing", "functional", "recording"];

export const createAPI = (ctx) => {
  const { config, emitter, deps } = ctx;
  let state = ctx.state || null;
  let currentLocale = ctx.locale;
  let mainLang = ctx.mainLang;
  let jurisdiction = ctx.jurisdiction || "default";
  let t = getTranslation(currentLocale);

  let modalRoot = null;
  let bannerRoot = null;

  const setUI = (which, root) => {
    if (which === "modal") modalRoot = root;
    if (which === "banner") bannerRoot = root;
  };

  const closeUI = () => {
    if (typeof document !== "undefined") {
      const overlays = document.querySelectorAll(".blakfy-overlay");
      for (let i = 0; i < overlays.length; i++) {
        const o = overlays[i];
        if (o && o.parentNode) o.parentNode.removeChild(o);
      }
    }
    modalRoot = null;
    bannerRoot = null;
    if (deps && typeof deps.removeFocusTrap === "function") deps.removeFocusTrap();
  };

  const getConsent = (cat) => {
    if (cat === "essential") return true;
    return state ? !!state[cat] : false;
  };

  const grantedCategories = (s) => {
    const out = [];
    if (!s) return out;
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (s[CATEGORIES[i]]) out.push(CATEGORIES[i]);
    }
    return out;
  };

  const commit = (prefs, action) => {
    const prevState = state;
    const prevGranted = grantedCategories(prevState);

    const next = buildState({
      prefs: prefs || {},
      currentLocale: currentLocale,
      mainLang: mainLang,
      policyVersion: config.policyVersion,
      jurisdiction: jurisdiction,
      tcString: deps && typeof deps.getTCString === "function" ? deps.getTCString() : null,
      uspString: null,
      prevId: prevState && prevState.id
    });

    state = next;

    try { writeCookie(state); } catch (e) { /* ignore */ }

    if (config.auditEndpoint) {
      postAudit(config.auditEndpoint, {
        id: state.id,
        action: action || "save",
        timestamp: state.timestamp,
        version: state.version,
        jurisdiction: state.jurisdiction,
        consent: {
          analytics: state.analytics,
          marketing: state.marketing,
          functional: state.functional,
          recording: state.recording
        }
      });
    }

    if (deps && typeof deps.pushGCM === "function") deps.pushGCM(state);
    if (deps && typeof deps.pushUET === "function") deps.pushUET(state);
    if (deps && typeof deps.applyYandex === "function") {
      deps.applyYandex(state, {
        unblock: (cat) => {
          if (deps.unblockScripts) deps.unblockScripts(cat);
          if (deps.unblockIframes) deps.unblockIframes(cat);
        },
        runCleanup: deps.runCleanup
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

    closeUI();
  };

  const acceptAll = () => commit({ analytics: true, marketing: true, functional: true, recording: true }, "accept_all");
  const rejectAll = () => commit({ analytics: false, marketing: false, functional: false, recording: false }, "reject_all");

  const open = () => {
    if (deps && typeof deps.openModal === "function") deps.openModal({ commit: commit, t: t, currentLocale: currentLocale, state: state });
  };

  const onChange = (fn) => { emitter.on("change", fn); };

  const onConsent = (category, fn) => {
    if (typeof fn !== "function") return;
    if (getConsent(category)) {
      try { fn(true); } catch (e) { /* swallow */ }
    }
    emitter.on("consent:" + category, fn);
  };

  const setLocale = (loc) => {
    const resolved = normalizeLocale(loc);
    if (!resolved) return;
    currentLocale = resolved;
    t = getTranslation(resolved) || getTranslation(DEFAULT_LOCALE);
    emitter.emit("locale", { locale: resolved, t: t, isRTL: RTL_LOCALES.indexOf(resolved) > -1 });
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
    getTCString: () => (deps && typeof deps.getTCString === "function" ? deps.getTCString() : "")
  };

  const ccpa = {
    optOut: () => { if (deps && typeof deps.optOutCCPA === "function") deps.optOutCCPA(); },
    isOptedOut: () => (deps && typeof deps.isOptedOutCCPA === "function" ? !!deps.isOptedOutCCPA() : false)
  };

  return {
    version: VERSION,
    open: open,
    acceptAll: acceptAll,
    rejectAll: rejectAll,
    getConsent: getConsent,
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
    __internal: { commit: commit, setUI: setUI, closeUI: closeUI }
  };
};
