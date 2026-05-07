// blakfy-cookie/src/core/consent-store.js — cookie I/O and state shape (v2 schema, no lib-version re-consent)

export const COOKIE_NAME = "blakfy_consent";
export const COOKIE_TTL_DAYS = 365;

export const readCookie = (policyVersion) => {
  const match = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));
  if (!match) return null;
  try {
    const s = JSON.parse(decodeURIComponent(match[2]));
    if (s.version !== policyVersion) return null;
    return s;
  } catch (e) {
    return null;
  }
};

export const writeCookie = (state) => {
  const expires = new Date(Date.now() + COOKIE_TTL_DAYS * 86400000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    COOKIE_NAME +
    "=" +
    encodeURIComponent(JSON.stringify(state)) +
    "; expires=" +
    expires +
    "; path=/; SameSite=Strict" +
    secure;
};

const newId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const buildState = ({
  prefs,
  currentLocale,
  mainLang,
  policyVersion,
  jurisdiction,
  tcString,
  uspString,
  prevId,
}) => ({
  id: prevId || newId(),
  essential: true,
  analytics: !!(prefs && prefs.analytics),
  marketing: !!(prefs && prefs.marketing),
  functional: !!(prefs && prefs.functional),
  recording: !!(prefs && prefs.recording),
  timestamp: new Date().toISOString(),
  version: policyVersion,
  locale: currentLocale,
  mainLang: mainLang,
  jurisdiction: jurisdiction || "default",
  tcString: tcString || null,
  uspString: uspString || null,
});
