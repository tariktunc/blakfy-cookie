import { describe, it, expect } from "vitest";
import { readConfig, DEFAULTS, CDN_BASE } from "../src/core/config.js";

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
    const cfg = readConfig(makeScript({
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
      "data-blakfy-presets": "ga4,ads"
    }));
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

  it("CDN_BASE points to @v2, NOT @latest", () => {
    expect(CDN_BASE).toContain("@v2");
    expect(CDN_BASE).not.toContain("@latest");
    expect(DEFAULTS.statusUrl).toContain("@v2");
  });
});
