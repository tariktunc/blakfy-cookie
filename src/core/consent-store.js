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

// #30 (scale readiness): `domain` is opt-in (data-blakfy-cookie-domain), host-only by
// default — unchanged behaviour for every existing install. Passing ".example.com"
// lets one consent decision carry across apex + subdomains instead of asking again
// on each one.
// #30 (item 2) — SameSite=Strict confirmed intentional, not changed to Lax:
// SameSite governs whether the cookie is attached to the *HTTP request* on a cross-site
// top-level navigation (e.g. a visitor clicking in from Google/an email/another site).
// This widget never reads consent server-side from that request header — it reads
// `document.cookie` client-side, after the page has loaded (see readCookie above), which is
// unaffected by SameSite: the cookie is still in the jar and still visible to JS on the same
// origin regardless of how the visitor arrived. So Strict causes no "banner re-shows after an
// external link click" defect — there is nothing here for Lax to fix, and Strict is strictly
// safer (blocks the record from ever being attached to a cross-site request at all, which
// matters more for a consent cookie than for a session cookie). Covered by
// tests/consent-store.test.js "#30 item 2: SameSite=Strict".
export const writeCookie = (state, domain) => {
  const expires = new Date(Date.now() + COOKIE_TTL_DAYS * 86400000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domainPart = domain ? "; domain=" + domain : "";
  document.cookie =
    COOKIE_NAME +
    "=" +
    encodeURIComponent(JSON.stringify(state)) +
    "; expires=" +
    expires +
    "; path=/; SameSite=Strict" +
    domainPart +
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
  source,
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
  // #32: who produced this record — "click" (default, user interacted with the banner/modal)
  // or "gpc" (Global Privacy Control signal auto-applied the decision, CCPA/CPRA jurisdictions).
  source: source || "click",
});
