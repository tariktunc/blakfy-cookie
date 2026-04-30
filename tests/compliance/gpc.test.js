import { describe, it, expect, vi, afterEach } from "vitest";
import { getGPC, applyGPC } from "../../src/compliance/gpc.js";

const setNavGPC = (val) => {
  Object.defineProperty(navigator, "globalPrivacyControl", { configurable: true, value: val });
};

afterEach(() => {
  try { delete navigator.globalPrivacyControl; } catch (e) { /* ignore */ }
});

describe("getGPC", () => {
  it("returns true when navigator.globalPrivacyControl === true", () => {
    setNavGPC(true);
    expect(getGPC()).toBe(true);
  });

  it("returns false when not set", () => {
    try { delete navigator.globalPrivacyControl; } catch (e) { /* ignore */ }
    expect(getGPC()).toBe(false);
  });

  it("returns true when documentElement.dataset.gpc === '1'", () => {
    document.documentElement.dataset.gpc = "1";
    expect(getGPC()).toBe(true);
    delete document.documentElement.dataset.gpc;
  });
});

describe("applyGPC", () => {
  it("with mode='respect' and GPC active calls setPrefs with analytics:false, marketing:false", () => {
    setNavGPC(true);
    const setPrefs = vi.fn();
    const result = applyGPC({ mode: "respect", currentState: null, setPrefs });
    expect(result.applied).toBe(true);
    expect(setPrefs).toHaveBeenCalledWith({ analytics: false, marketing: false });
  });

  it("with mode='ignore' does nothing", () => {
    setNavGPC(true);
    const setPrefs = vi.fn();
    const result = applyGPC({ mode: "ignore", currentState: null, setPrefs });
    expect(result.applied).toBe(false);
    expect(setPrefs).not.toHaveBeenCalled();
  });

  it("with currentState.explicit === true (user already decided) does nothing", () => {
    setNavGPC(true);
    const setPrefs = vi.fn();
    const result = applyGPC({ mode: "respect", currentState: { explicit: true }, setPrefs });
    expect(result.applied).toBe(false);
    expect(setPrefs).not.toHaveBeenCalled();
  });

  it("does nothing when GPC signal is not present", () => {
    try { delete navigator.globalPrivacyControl; } catch (e) { /* ignore */ }
    const setPrefs = vi.fn();
    const result = applyGPC({ mode: "respect", currentState: null, setPrefs });
    expect(result.applied).toBe(false);
    expect(setPrefs).not.toHaveBeenCalled();
  });
});
