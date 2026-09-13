// blakfy-cookie/src/core/config.js — script tag attribute reader and v2 defaults

export const CDN_BASE = "https://cdn.jsdelivr.net/npm/@blakfy/cookie@2";

// #41: __BLAKFY_PKG_VERSION__ is a build-time constant — injected by esbuild's `define`
// in scripts/build.js (and by vitest.config.js's `define` for tests), both reading the
// exact version straight from package.json. Falling back to CDN_BASE's floating "@2" only
// happens if a bundle was somehow built without going through scripts/build.js at all.
export const RUNTIME_VERSION =
  typeof __BLAKFY_PKG_VERSION__ !== "undefined" && __BLAKFY_PKG_VERSION__
    ? __BLAKFY_PKG_VERSION__
    : "2";

// #41: the status endpoint is pinned to the EXACT version this bundle was built as, not
// the floating "@2" major tag CDN_BASE uses for the script itself. A site pinned to
// 2.3.0 must never be shown a status message written against a later 2.4.x release —
// that was Problem 1 in #41. (CDN_BASE's own major-tag policy for the *script* URL is a
// separate, deliberate distribution decision — see docs/architecture.md — untouched here.)
const STATUS_BASE = "https://cdn.jsdelivr.net/npm/@blakfy/cookie@" + RUNTIME_VERSION;

export const DEFAULTS = {
  locale: "auto",
  mainLang: null,
  // #49 (owner decision 2026-09-12): default to "auto" (in-widget generated notice)
  // instead of a hardcoded path most sites never created — that hardcoded default is
  // exactly what produced live 404s on suestebeauty.com and senelli.com. A site with
  // a real policy page still sets data-blakfy-policy-url explicitly and gets the old
  // off-site link behaviour.
  policyUrl: "auto",
  policyVersion: "1.0",
  auditEndpoint: null,
  // #30 (item 6): optional operator error-reporting hook. Read directly off the <script>
  // element by index.js's bootstrap-error handler (not through readConfig()'s output) so a
  // throw inside readConfig() itself still has a chance to be reported.
  errorEndpoint: null,
  // #49: required for the generated in-widget notice (GDPR Art. 13(1)(a) / KVKK
  // Md.10 controller identity). Left unset, the notice renders but is marked
  // incomplete and says so loudly — see src/compliance/policy-text.js.
  operator: null,
  operatorContact: null,
  operatorAddress: null,
  position: "bottom-center",
  margin: "16",
  theme: "auto",
  // #56: owner decision — default look is neutral, not the old brand-green. Site
  // owners who want a brand color still set data-blakfy-accent; this only changes
  // what renders when that attribute is absent. #6b7280 (neutral gray) rather than
  // pure #000/#fff because it stays legible against both the light card background
  // (#fff) and the dark theme card background (#1a1a1a) without a theme-specific fork.
  accent: "#6b7280",
  presets: null,
  tcf: "false",
  cmpId: "0",
  ccpa: "auto",
  gpc: "respect",
  dnt: "respect",
  statusUrl: STATUS_BASE + "/status.json",
  statusEnabled: true,
  // #30 (scale readiness — multi-domain/subdomain scope): host-only by default
  // (matches existing behaviour). Set data-blakfy-cookie-domain=".example.com" so a
  // decision made on www.example.com also carries to shop.example.com — otherwise a
  // visitor is asked again on every subdomain, which is a real defect for clients
  // running a shop on a subdomain. Document the apex/www implication for anyone not
  // redirecting to a canonical host: an unset value means example.com and
  // www.example.com are treated as two different sites for consent purposes.
  cookieDomain: null,
  // #34: reopen FAB — "off" disables it (a site wiring its own footer link
  // instead). Wix installs commonly already occupy the right corner with
  // chat/map buttons, so "left" is the stock default everywhere.
  fabSide: "left",
  fabOffset: null,
  fabSize: null,
  fabColor: null,
  // #39: cookie transparency panel — off by default (issue proposal: "Off by default;
  // a site opts in"). Lists cookies actually present in document.cookie, with
  // per-cookie delete. data-blakfy-cookie-panel="true" to enable.
  cookiePanel: "false",
};

// document.currentScript is only reliable DURING the synchronous execution of this
// classic script — it is null again by the time bootstrap() runs (after a
// DOMContentLoaded listener fires asynchronously, or after any await). Capture it
// once, at module-evaluation time, so later calls don't fall back to "last <script>
// on the page", which silently picks up an unrelated script if anything else was
// injected after this one loaded (fixes #22).
const CAPTURED_SCRIPT_EL = typeof document !== "undefined" ? document.currentScript : null;

export const getScriptEl = () => {
  if (CAPTURED_SCRIPT_EL) return CAPTURED_SCRIPT_EL;
  if (typeof document === "undefined") return null;
  const all = document.getElementsByTagName("script");
  return all[all.length - 1] || null;
};

// #43: "wrong placement" produces a widget that is completely inert with no error —
// the script tag is present and readable, so every surface-level integrator check
// passes. document.currentScript is null for scripts with the `async` attribute per
// spec, and the fallback (last <script> on the page) is guessing. Flag both shapes
// so a bad install is loud instead of silent.
export const detectPlacementIssue = (el) => {
  if (!el) {
    return (
      "no usable <script> element could be resolved (document.currentScript was null " +
      "and no fallback script was found) — this usually means the tag has the `async` " +
      "attribute, which is not supported. Load this script WITHOUT async/defer, placed " +
      "body-last, per the install docs."
    );
  }
  if (typeof el.hasAttribute === "function" && el.hasAttribute("async")) {
    return (
      "this script tag has the `async` attribute. document.currentScript is null for " +
      "async scripts per spec, so this install cannot reliably read its own " +
      "data-blakfy-* attributes and may silently fall back to the wrong <script> tag on " +
      "the page. Remove `async` and load this script body-last instead."
    );
  }
  if (
    typeof document !== "undefined" &&
    document.head &&
    typeof el.closest === "function" &&
    el.closest("head") === document.head
  ) {
    return (
      "this script tag is placed in <head>. The install docs call for body-last " +
      "placement; loading in <head> risks executing before the DOM the widget mounts " +
      "into exists, and commonly pairs with `async`/`defer` mistakes. Move the tag to " +
      "just before </body>."
    );
  }
  return null;
};

export const readConfig = (scriptEl) => {
  const el = scriptEl || getScriptEl();
  const attr = (name, fallback) => {
    if (!el) return fallback;
    const v = el.getAttribute(name);
    return v == null ? fallback : v;
  };
  return {
    locale: attr("data-blakfy-locale", DEFAULTS.locale),
    mainLang: attr("data-blakfy-main-lang", DEFAULTS.mainLang),
    policyUrl: attr("data-blakfy-policy-url", DEFAULTS.policyUrl),
    policyVersion: attr("data-blakfy-version", DEFAULTS.policyVersion),
    auditEndpoint: attr("data-blakfy-audit-endpoint", DEFAULTS.auditEndpoint),
    errorEndpoint: attr("data-blakfy-error-endpoint", DEFAULTS.errorEndpoint),
    operator: attr("data-blakfy-operator", DEFAULTS.operator),
    operatorContact: attr("data-blakfy-operator-contact", DEFAULTS.operatorContact),
    operatorAddress: attr("data-blakfy-operator-address", DEFAULTS.operatorAddress),
    position: attr("data-blakfy-position", DEFAULTS.position),
    margin: attr("data-blakfy-margin", DEFAULTS.margin),
    theme: attr("data-blakfy-theme", DEFAULTS.theme),
    accent: attr("data-blakfy-accent", DEFAULTS.accent),
    presets: attr("data-blakfy-presets", DEFAULTS.presets),
    tcf: attr("data-blakfy-tcf", DEFAULTS.tcf),
    cmpId: attr("data-blakfy-cmp-id", DEFAULTS.cmpId),
    ccpa: attr("data-blakfy-ccpa", DEFAULTS.ccpa),
    gpc: attr("data-blakfy-gpc", DEFAULTS.gpc),
    dnt: attr("data-blakfy-dnt", DEFAULTS.dnt),
    statusUrl: attr("data-blakfy-status-url", DEFAULTS.statusUrl),
    statusEnabled: attr("data-blakfy-status", "true") !== "false",
    cookieDomain: attr("data-blakfy-cookie-domain", DEFAULTS.cookieDomain),
    fabSide: attr("data-blakfy-fab", DEFAULTS.fabSide),
    fabOffset: attr("data-blakfy-fab-offset", DEFAULTS.fabOffset),
    fabSize: attr("data-blakfy-fab-size", DEFAULTS.fabSize),
    fabColor: attr("data-blakfy-fab-color", DEFAULTS.fabColor),
    cookiePanel: attr("data-blakfy-cookie-panel", DEFAULTS.cookiePanel) === "true",
  };
};
