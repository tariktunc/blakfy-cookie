// blakfy-cookie/src/core/config.js — script tag attribute reader and v2 defaults

export const CDN_BASE = "https://cdn.jsdelivr.net/npm/@blakfy/cookie@2";

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
  // #49: required for the generated in-widget notice (GDPR Art. 13(1)(a) / KVKK
  // Md.10 controller identity). Left unset, the notice renders but is marked
  // incomplete and says so loudly — see src/compliance/policy-text.js.
  operator: null,
  operatorContact: null,
  operatorAddress: null,
  position: "bottom-center",
  margin: "16",
  theme: "auto",
  accent: "#3E5C3A",
  presets: null,
  tcf: "false",
  cmpId: "0",
  ccpa: "auto",
  gpc: "respect",
  dnt: "respect",
  statusUrl: CDN_BASE + "/status.json",
  statusEnabled: true,
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
  };
};
