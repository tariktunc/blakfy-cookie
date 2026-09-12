// blakfy-cookie/src/adapters/host-adapters.js — host-platform consent bridge (#24, item 3)
//
// The Wix case (see #24 issue thread) showed a recurring pattern: a host platform
// pushes its OWN default consent signal before this widget's denied-by-default one,
// and — separately — the host never learns the visitor's actual decision because
// nothing bridges our state back to it. Wix's own fix was platform-side
// (window.consentPolicyManager.setConsentPolicy(), driven by our onChange) and is now
// out of scope here (tariktunc/webforge#71). This module generalizes the SAME pattern
// — detect platform, bridge to its documented native consent API when one exists —
// for Shopify, Squarespace and WordPress, opt-in and additive: if no bridge applies,
// nothing about the widget's own behavior changes.
//
// HONESTY: every bridge below targets a real, documented public API. Where no such
// API exists (Squarespace has none; WordPress has no reliable JS global of its own),
// we detect and log, we do not fabricate a call to something undocumented.
//
//   Shopify      -> window.Shopify.customerPrivacy (Shopify "Customer Privacy API",
//                   https://shopify.dev/docs/api/customer-privacy)
//   WordPress    -> WP Consent API (wp_set_consent / wp_has_consent), an open,
//                   widely-adopted WP standard: https://github.com/rlankhorst/wp-consent-level-api
//   Squarespace  -> no documented public consent API as of writing; detection only.

let warnedNoBridge = {};

const warnOnce = (key, message) => {
  if (warnedNoBridge[key]) return;
  warnedNoBridge[key] = true;
  if (typeof console !== "undefined" && console.info) console.info(message);
};

// Exposed for tests only — resets the "warn once per page load" guards.
export const __resetHostAdapterWarnings = () => {
  warnedNoBridge = {};
};

/**
 * Detects which host platform this page is running on, if any.
 * `scriptEl` is the widget's own <script> tag (see core/config.js getScriptEl) —
 * `data-blakfy-host="wordpress"` on it is an explicit override for WordPress, which
 * has no reliable JS global of its own to auto-detect.
 */
export const detectHost = (scriptEl) => {
  if (typeof window === "undefined") return null;

  const override =
    scriptEl && typeof scriptEl.getAttribute === "function"
      ? scriptEl.getAttribute("data-blakfy-host")
      : null;
  if (override === "shopify" || override === "squarespace" || override === "wordpress") {
    return override;
  }

  if (typeof window.Shopify === "object" && window.Shopify) return "shopify";
  if (window.Static && window.Static.SQUARESPACE_CONTEXT) return "squarespace";
  if (typeof window.wp_set_consent === "function" || typeof window.wp_has_consent === "function") {
    return "wordpress";
  }

  return null;
};

/**
 * Shopify: bridges to window.Shopify.customerPrivacy.setTrackingConsent(), Shopify's
 * own documented Customer Privacy API. Its consent shape is {analytics, marketing,
 * preferences, sale_of_data} — our `functional` maps to Shopify's `preferences`, and
 * we do not claim a sale_of_data opt-out signal we have no basis for, so it is left
 * out of the payload rather than guessed.
 */
export const bridgeShopify = (state) => {
  if (typeof window === "undefined") return false;
  const cp = window.Shopify && window.Shopify.customerPrivacy;
  if (!cp || typeof cp.setTrackingConsent !== "function") {
    warnOnce(
      "shopify",
      "[Blakfy Cookie] Shopify detected but window.Shopify.customerPrivacy is not " +
        "available yet (it loads after Shopify's own privacy banner script). No bridge " +
        "installed for this page load — see tariktunc/blakfy-cookie#24."
    );
    return false;
  }
  const s = state || {};
  try {
    cp.setTrackingConsent(
      {
        analytics: !!s.analytics,
        marketing: !!s.marketing,
        preferences: !!s.functional,
      },
      function () {}
    );
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * WordPress: bridges to the WP Consent API (wp_set_consent), an open standard used by
 * Complianz, Cookiebot's WP integration and others — not a Blakfy invention. Categories
 * per the WP Consent API spec: functional, statistics, statistics-anonymous, marketing,
 * preferences. "statistics-anonymous" always stays allowed — it is defined by the spec
 * as consent-free anonymous statistics, not something our widget grants or withholds.
 */
export const bridgeWordPress = (state) => {
  if (typeof window === "undefined") return false;
  if (typeof window.wp_set_consent !== "function") {
    warnOnce(
      "wordpress",
      '[Blakfy Cookie] WordPress host detected (data-blakfy-host="wordpress" or a ' +
        "consent-plugin marker) but no WP Consent API (wp_set_consent) is present on " +
        "this page. Vanilla WordPress has no native consent API to bridge to — install " +
        "a WP Consent API-compatible plugin if two-way sync is needed. See " +
        "tariktunc/blakfy-cookie#24."
    );
    return false;
  }
  const s = state || {};
  try {
    window.wp_set_consent("functional", s.functional ? "allow" : "deny");
    window.wp_set_consent("preferences", s.functional ? "allow" : "deny");
    window.wp_set_consent("statistics", s.analytics ? "allow" : "deny");
    window.wp_set_consent("statistics-anonymous", "allow");
    window.wp_set_consent("marketing", s.marketing ? "allow" : "deny");
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Squarespace: as of writing, Squarespace publishes no documented public JS consent
 * API for third-party widgets to bridge into (unlike Shopify's Customer Privacy API
 * or the WP Consent API standard). We do NOT fabricate one. Detection-only: name the
 * platform and state plainly that no native bridge exists yet.
 */
export const bridgeSquarespace = () => {
  warnOnce(
    "squarespace",
    "[Blakfy Cookie] Squarespace detected. Squarespace has no documented public " +
      "consent API for this widget to bridge into — running in detection-only mode. " +
      "If Squarespace publishes one, or the owner's own Squarespace consent settings " +
      "need coordinating by hand, see tariktunc/blakfy-cookie#24."
  );
  return false;
};

const BRIDGES = {
  shopify: bridgeShopify,
  wordpress: bridgeWordPress,
  squarespace: bridgeSquarespace,
};

/**
 * Detects the host platform and, when a real documented bridge exists for it, syncs
 * `state` into it. Safe to call on every consent commit (bootstrap + every change) —
 * bridging is idempotent and cheap. Returns {host, bridged} for diagnostics/tests.
 */
export const installHostAdapter = (state, scriptEl) => {
  const host = detectHost(scriptEl);
  if (!host) return { host: null, bridged: false };
  const bridge = BRIDGES[host];
  const bridged = typeof bridge === "function" ? !!bridge(state) : false;
  return { host: host, bridged: bridged };
};
