import { describe, it, expect, vi, afterEach } from "vitest";

import { readConfig, DEFAULTS, CDN_BASE, getScriptEl } from "../src/core/config.js";

const makeScript = (attrs) => {
  const el = document.createElement("script");
  if (attrs) {
    Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
  }
  return el;
};

describe("config readConfig", () => {
  it("returns defaults for empty script tag", () => {
    const cfg = readConfig(makeScript());
    expect(cfg.locale).toBe(DEFAULTS.locale);
    expect(cfg.policyUrl).toBe(DEFAULTS.policyUrl);
    expect(cfg.policyVersion).toBe(DEFAULTS.policyVersion);
    expect(cfg.position).toBe(DEFAULTS.position);
    expect(cfg.theme).toBe(DEFAULTS.theme);
    expect(cfg.accent).toBe(DEFAULTS.accent);
    expect(cfg.statusEnabled).toBe(true);
  });

  it("overrides defaults with data-blakfy-* attributes", () => {
    const cfg = readConfig(
      makeScript({
        "data-blakfy-locale": "en",
        "data-blakfy-policy-url": "/privacy",
        "data-blakfy-version": "2.5",
        "data-blakfy-position": "top-left",
        "data-blakfy-theme": "dark",
        "data-blakfy-accent": "#ff0000",
        "data-blakfy-tcf": "true",
        "data-blakfy-cmp-id": "42",
        "data-blakfy-ccpa": "always",
        "data-blakfy-gpc": "ignore",
        "data-blakfy-presets": "ga4,ads",
      })
    );
    expect(cfg.locale).toBe("en");
    expect(cfg.policyUrl).toBe("/privacy");
    expect(cfg.policyVersion).toBe("2.5");
    expect(cfg.position).toBe("top-left");
    expect(cfg.theme).toBe("dark");
    expect(cfg.accent).toBe("#ff0000");
    expect(cfg.tcf).toBe("true");
    expect(cfg.cmpId).toBe("42");
    expect(cfg.ccpa).toBe("always");
    expect(cfg.gpc).toBe("ignore");
    expect(cfg.presets).toBe("ga4,ads");
  });

  it("parses data-blakfy-status='false' as statusEnabled: false", () => {
    const cfg = readConfig(makeScript({ "data-blakfy-status": "false" }));
    expect(cfg.statusEnabled).toBe(false);
  });

  it("parses data-blakfy-status='true' as statusEnabled: true", () => {
    const cfg = readConfig(makeScript({ "data-blakfy-status": "true" }));
    expect(cfg.statusEnabled).toBe(true);
  });

  it("CDN_BASE points to npm @2 major, NOT @latest, NOT jsDelivr GH", () => {
    expect(CDN_BASE).toContain("@blakfy/cookie@2");
    expect(CDN_BASE).not.toContain("@latest");
    expect(CDN_BASE).not.toContain("/gh/");
    expect(DEFAULTS.statusUrl).toContain("@blakfy/cookie@2");
    expect(DEFAULTS.statusUrl).toMatch(/\/status\.json$/);
  });
});

describe("getScriptEl (#22 regression)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("captures the owning script tag even after currentScript goes null (async caller)", async () => {
    // Simulate: our loader script is the one executing (currentScript set) while
    // the module is first evaluated — the real-world case for a classic <script> tag.
    const own = document.createElement("script");
    own.setAttribute("data-blakfy-locale", "tr");
    document.body.appendChild(own);
    Object.defineProperty(document, "currentScript", { value: own, configurable: true });

    vi.resetModules();
    const fresh = await import("../src/core/config.js?case=own-current");

    // Now simulate the real bug trigger: by the time bootstrap() runs (e.g. from a
    // DOMContentLoaded callback), currentScript is null again AND another, unrelated
    // script has since been appended to the page.
    Object.defineProperty(document, "currentScript", { value: null, configurable: true });
    const unrelated = document.createElement("script");
    document.body.appendChild(unrelated);

    expect(fresh.getScriptEl()).toBe(own);
    expect(fresh.getScriptEl()).not.toBe(unrelated);
  });

  it("falls back to the last <script> on the page when nothing was ever captured", () => {
    document.body.innerHTML = "";
    const s1 = document.createElement("script");
    const s2 = document.createElement("script");
    document.body.appendChild(s1);
    document.body.appendChild(s2);
    // no currentScript ever set in this environment for this call path
    Object.defineProperty(document, "currentScript", { value: null, configurable: true });
    expect(getScriptEl()).toBe(s2);
  });
});
