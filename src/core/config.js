// blakfy-cookie/src/core/config.js — script tag attribute reader and v2 defaults

export const CDN_BASE = "https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@2";

export const DEFAULTS = {
  locale: "auto",
  mainLang: null,
  policyUrl: "/cerez-politikasi",
  policyVersion: "1.0",
  auditEndpoint: null,
  position: "bottom-center",
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

export const getScriptEl = () => {
  if (document.currentScript) return document.currentScript;
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
