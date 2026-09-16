/*!
 * Blakfy Cookie Widget v2.4.6
 * https://github.com/tariktunc/blakfy-cookie
 * MIT License | (c) Blakfy Studio
 *
 * KVKK + GDPR + CCPA + Google CMv2 + Microsoft UET + Yandex + TCF v2.2 + GPC + DNT
 * 23 languages | 18 presets | Tag-gating | Powered by Blakfy Studio
 */
(() => {
  // src/compliance/google-cmv2.js
  var defaultsInstalled = false;
  var warnedForeignDefault = false;
  var STORAGE_KEYS = [
    "ad_storage",
    "ad_user_data",
    "ad_personalization",
    "analytics_storage",
    "functionality_storage",
    "personalization_storage"
  ];
  var warnIfForeignGrantedDefaultExists = (dataLayer) => {
    if (warnedForeignDefault) return;
    if (!Array.isArray(dataLayer) || dataLayer.length === 0) return;
    if (typeof console === "undefined" || !console.warn) return;
    for (const entry of dataLayer) {
      if (!entry || typeof entry.length !== "number") continue;
      if (entry[0] !== "consent" || entry[1] !== "default") continue;
      const params = entry[2];
      if (!params || typeof params !== "object") continue;
      const grantedKeys = STORAGE_KEYS.filter((k) => params[k] === "granted");
      if (grantedKeys.length === 0) continue;
      warnedForeignDefault = true;
      console.warn(
        `[Blakfy Cookie] A gtag('consent','default', ...) call already in dataLayer grants [${grantedKeys.join(", ")}] before this widget's own denied-by-default signal. This usually means the host platform (Wix, Shopify, Squarespace, a WordPress consent plugin, ...) pushed its own default consent state ahead of ours \u2014 on Wix specifically this happens whenever the site's consentPolicy is left unset. Tags bound to that foreign default can fire before the visitor answers. Check the platform's own consent/privacy settings and confirm it is not shipping a conflicting default (see tariktunc/blakfy-cookie#24).`
      );
      return;
    }
  };
  var installDefaults = () => {
    if (typeof window === "undefined") return;
    if (defaultsInstalled) return;
    defaultsInstalled = true;
    window.dataLayer = window.dataLayer || [];
    warnIfForeignGrantedDefaultExists(window.dataLayer);
    if (typeof window.gtag !== "function") {
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
    }
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500
    });
  };

  // src/compliance/microsoft-uet.js
  var defaultsInstalled2 = false;
  var installDefaults2 = () => {
    if (typeof window === "undefined") return;
    if (defaultsInstalled2) return;
    defaultsInstalled2 = true;
    window.uetq = window.uetq || [];
    window.uetq.push("consent", "default", { ad_storage: "denied" });
  };

  // src/compliance/yandex-metrica.js
  var defaultsInstalled3 = false;
  var installDefaults3 = () => {
    if (typeof window === "undefined") return;
    if (defaultsInstalled3) return;
    defaultsInstalled3 = true;
    if (typeof window.ym !== "function") {
      window.ym = function() {
      };
      window.ym.__blakfyStub = true;
    }
  };

  // src/cookie-defaults.js
  (function() {
    if (typeof window === "undefined") return;
    if (window.__blakfyConsentDefaultsLoaded) return;
    window.__blakfyConsentDefaultsLoaded = true;
    try {
      installDefaults();
    } catch (e) {
    }
    try {
      installDefaults2();
    } catch (e) {
    }
    try {
      installDefaults3();
    } catch (e) {
    }
  })();
})();
