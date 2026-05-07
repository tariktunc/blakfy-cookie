// blakfy-cookie/src/compliance/google-cmv2.js — Google Consent Mode v2 signals (gtag)

let defaultsInstalled = false;

export const installDefaults = () => {
  if (typeof window === "undefined") return;
  if (defaultsInstalled) return;
  defaultsInstalled = true;

  window.dataLayer = window.dataLayer || [];
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
