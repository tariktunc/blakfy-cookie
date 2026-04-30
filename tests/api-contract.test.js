import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAPI } from "../src/api.js";
import { createEmitter } from "../src/core/events.js";

const makeCtx = (overrides = {}) => {
  const emitter = createEmitter();
  const deps = {
    pushGCM: vi.fn(),
    pushUET: vi.fn(),
    applyYandex: vi.fn(),
    unblockScripts: vi.fn(),
    unblockIframes: vi.fn(),
    runCleanup: vi.fn(),
    registerCleanup: vi.fn(),
    getTCString: vi.fn(() => "TCSTRING"),
    optOutCCPA: vi.fn(),
    isOptedOutCCPA: vi.fn(() => false),
    applyPreset: vi.fn(),
    openModal: vi.fn(),
    removeFocusTrap: vi.fn(),
    ...(overrides.deps || {})
  };
  return {
    config: { policyVersion: "1.0", auditEndpoint: null, ...(overrides.config || {}) },
    emitter,
    deps,
    state: overrides.state || null,
    locale: "en",
    mainLang: "en",
    jurisdiction: "EEA"
  };
};

describe("API v1 ↔ v2 backwards-compat surface", () => {
  let api, ctx;

  beforeEach(() => {
    ctx = makeCtx();
    api = createAPI(ctx);
  });

  it("exposes all v1 properties", () => {
    expect(typeof api.version).toBe("string");
    expect(typeof api.open).toBe("function");
    expect(typeof api.acceptAll).toBe("function");
    expect(typeof api.rejectAll).toBe("function");
    expect(typeof api.getConsent).toBe("function");
    expect(typeof api.getState).toBe("function");
    expect(typeof api.onChange).toBe("function");
    expect(typeof api.setLocale).toBe("function");
    expect(typeof api.getMainLang).toBe("function");
  });

  it("exposes v2 additions", () => {
    expect(typeof api.onConsent).toBe("function");
    expect(typeof api.registerCleanup).toBe("function");
    expect(typeof api.unblock).toBe("function");
    expect(typeof api.scan).toBe("function");
    expect(typeof api.usePreset).toBe("function");
    expect(typeof api.getJurisdiction).toBe("function");
    expect(typeof api.tcf.getTCString).toBe("function");
    expect(typeof api.ccpa.optOut).toBe("function");
    expect(typeof api.ccpa.isOptedOut).toBe("function");
  });
});

describe("API behavior", () => {
  it("acceptAll grants all categories and calls pushGCM, pushUET", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    api.acceptAll();
    const s = api.getState();
    expect(s.analytics).toBe(true);
    expect(s.marketing).toBe(true);
    expect(s.functional).toBe(true);
    expect(s.recording).toBe(true);
    expect(ctx.deps.pushGCM).toHaveBeenCalled();
    expect(ctx.deps.pushUET).toHaveBeenCalled();
  });

  it("rejectAll denies all categories", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    api.rejectAll();
    const s = api.getState();
    expect(s.analytics).toBe(false);
    expect(s.marketing).toBe(false);
    expect(s.functional).toBe(false);
    expect(s.recording).toBe(false);
  });

  it("getConsent('essential') always returns true regardless of state", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    expect(api.getConsent("essential")).toBe(true);
    api.rejectAll();
    expect(api.getConsent("essential")).toBe(true);
  });

  it("onChange(fn) is called when state changes", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    const fn = vi.fn();
    api.onChange(fn);
    api.acceptAll();
    expect(fn).toHaveBeenCalled();
    const s = fn.mock.calls[0][0];
    expect(s.analytics).toBe(true);
  });

  it("onConsent('marketing', fn) fires when marketing transitions denied -> granted", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    const fn = vi.fn();
    api.onConsent("marketing", fn);
    fn.mockClear();
    api.acceptAll();
    expect(fn).toHaveBeenCalledWith(true);
  });

  it("getJurisdiction returns the configured jurisdiction", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    expect(api.getJurisdiction()).toBe("EEA");
  });

  it("tcf.getTCString delegates to deps.getTCString", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    expect(api.tcf.getTCString()).toBe("TCSTRING");
    expect(ctx.deps.getTCString).toHaveBeenCalled();
  });

  it("ccpa.optOut delegates to deps.optOutCCPA", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    api.ccpa.optOut();
    expect(ctx.deps.optOutCCPA).toHaveBeenCalled();
  });

  it("unblock(category) calls unblockScripts and unblockIframes", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    api.unblock("marketing");
    expect(ctx.deps.unblockScripts).toHaveBeenCalledWith("marketing");
    expect(ctx.deps.unblockIframes).toHaveBeenCalledWith("marketing");
  });

  it("registerCleanup delegates to deps.registerCleanup", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    const opts = { category: "analytics", cookies: ["_ga"] };
    api.registerCleanup(opts);
    expect(ctx.deps.registerCleanup).toHaveBeenCalledWith(opts);
  });

  it("usePreset delegates to deps.applyPreset", () => {
    const ctx = makeCtx();
    const api = createAPI(ctx);
    api.usePreset("ga4");
    expect(ctx.deps.applyPreset).toHaveBeenCalled();
  });
});
