// blakfy-cookie/src/core/config.js — script tag attribute reader and v2 defaults

export const CDN_BASE = "https://cdn.jsdelivr.net/npm/@blakfy/cookie@2";

export const DEFAULTS = {
  locale: "auto",
  mainLang: null,
  policyUrl: "/cerez-politikasi",
  policyVersion: "1.0",
  auditEndpoint: null,
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
