// blakfy-cookie/src/compliance/google-cmv2.js — Google Consent Mode v2 signals (gtag)

let defaultsInstalled = false;
let warnedForeignDefault = false;

const STORAGE_KEYS = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
  "functionality_storage",
  "personalization_storage",
];

/**
 * #24 (remaining scope): a host platform (Wix, Shopify, Squarespace, WordPress
 * consent plugins...) may push its OWN gtag('consent','default', {...granted}) into
 * dataLayer before this widget loads — e.g. Wix does this whenever the site's own
 * consentPolicy is unset. If that foreign default grants storage while our own
 * default denies it, tags can fire before the visitor ever answers, and nothing
 * about our own state looks wrong — it silently disagrees with the page. Detect
 * that conflict and warn loudly instead of letting it pass unnoticed.
 */
const warnIfForeignGrantedDefaultExists = (dataLayer) => {
  if (warnedForeignDefault) return;
  if (!Array.isArray(dataLayer) || dataLayer.length === 0) return;
  if (typeof console === "undefined" || !console.warn) return;

  for (const entry of dataLayer) {
    // gtag() pushes its `arguments` object; both a real Arguments object and a
    // plain array pushed by a shim satisfy this shape.
    if (!entry || typeof entry.length !== "number") continue;
    if (entry[0] !== "consent" || entry[1] !== "default") continue;
    const params = entry[2];
    if (!params || typeof params !== "object") continue;

    const grantedKeys = STORAGE_KEYS.filter((k) => params[k] === "granted");
    if (grantedKeys.length === 0) continue;

    warnedForeignDefault = true;
    console.warn(
      "[Blakfy Cookie] A gtag('consent','default', ...) call already in dataLayer grants " +
        `[${grantedKeys.join(", ")}] before this widget's own denied-by-default signal. ` +
        "This usually means the host platform (Wix, Shopify, Squarespace, a WordPress " +
        "consent plugin, ...) pushed its own default consent state ahead of ours — on " +
        "Wix specifically this happens whenever the site's consentPolicy is left unset. " +
        "Tags bound to that foreign default can fire before the visitor answers. Check " +
        "the platform's own consent/privacy settings and confirm it is not shipping a " +
        "conflicting default (see tariktunc/blakfy-cookie#24)."
    );
    return;
  }
};

export const installDefaults = () => {
  if (typeof window === "undefined") return;
  if (defaultsInstalled) return;
  defaultsInstalled = true;

  window.dataLayer = window.dataLayer || [];
  warnIfForeignGrantedDefaultExists(window.dataLayer);
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
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
    wait_for_update: 500,
  });
};

// #43 (diagnose()): expose whether GCM defaults have actually fired in this page.
export const isDefaultsInstalled = () => defaultsInstalled;

export const pushGCM = (state) => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  const s = state || {};
  const m = s.marketing ? "granted" : "denied";
  const a = s.analytics ? "granted" : "denied";
  const f = s.functional ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: m,
    ad_user_data: m,
    ad_personalization: m,
    analytics_storage: a,
    functionality_storage: f,
    personalization_storage: f,
    security_storage: "granted",
  });
};
