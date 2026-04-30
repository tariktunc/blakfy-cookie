import { describe, it, expect, vi } from "vitest";

const importFresh = async () => {
  const mod = await import("../../src/compliance/tcf-v2.js?t=" + Math.random());
  return mod;
};

const makeEmitter = () => {
  const handlers = {};
  const on = vi.fn((evt, fn) => { (handlers[evt] = handlers[evt] || []).push(fn); });
  const fire = (evt, ...args) => (handlers[evt] || []).forEach((fn) => fn(...args));
  return { on, fire };
};

describe("tcf-v2 installTCFAPI", () => {
  it("installs window.__tcfapi", async () => {
    const { installTCFAPI } = await importFresh();
    const emitter = makeEmitter();
    installTCFAPI({ cmpId: 0, cmpVersion: 1, getConsent: () => ({}), on: emitter.on });
    expect(typeof window.__tcfapi).toBe("function");
  });

  it("ping returns expected shape", async () => {
    const { installTCFAPI } = await importFresh();
    installTCFAPI({ cmpId: 7, cmpVersion: 1, getConsent: () => ({}) });
    const cb = vi.fn();
    window.__tcfapi("ping", 2, cb);
    expect(cb).toHaveBeenCalled();
    const arg = cb.mock.calls[0][0];
    expect(arg.cmpLoaded).toBe(true);
    expect(arg.apiVersion).toBe("2.2");
    expect(arg.tcfPolicyVersion).toBe(4);
    expect(arg.cmpId).toBe(7);
  });

  it("getTCData returns expected fields", async () => {
    const { installTCFAPI } = await importFresh();
    installTCFAPI({ cmpId: 5, cmpVersion: 1, getConsent: () => ({ analytics: true }) });
    const cb = vi.fn();
    window.__tcfapi("getTCData", 2, cb);
    const data = cb.mock.calls[0][0];
    expect(typeof data.tcString).toBe("string");
    expect(data.tcString.length).toBeGreaterThan(0);
    expect(data.eventStatus).toBeDefined();
    expect(data.cmpId).toBe(5);
    expect(data.gdprApplies).toBe(true);
    expect(data.listenerId).toBeNull();
  });

  it("addEventListener registers a listener and fires immediately", async () => {
    const { installTCFAPI } = await importFresh();
    installTCFAPI({ cmpId: 0, cmpVersion: 1, getConsent: () => ({}) });
    const cb = vi.fn();
    window.__tcfapi("addEventListener", 2, cb);
    expect(cb).toHaveBeenCalledTimes(1);
    const data = cb.mock.calls[0][0];
    expect(typeof data.listenerId).toBe("number");
  });

  it("removeEventListener removes the listener", async () => {
    const { installTCFAPI } = await importFresh();
    installTCFAPI({ cmpId: 0, cmpVersion: 1, getConsent: () => ({}) });
    const cb = vi.fn();
    window.__tcfapi("addEventListener", 2, cb);
    const listenerId = cb.mock.calls[0][0].listenerId;

    const removeCb = vi.fn();
    window.__tcfapi("removeEventListener", 2, removeCb, listenerId);
    expect(removeCb).toHaveBeenCalledWith(true, true);
  });

  it("TC string is non-empty Base64URL", async () => {
    const { buildTCString } = await importFresh();
    const tc = buildTCString({ cmpId: 1, cmpVersion: 1, state: { analytics: true } });
    expect(typeof tc).toBe("string");
    expect(tc.length).toBeGreaterThan(0);
    expect(/^[A-Za-z0-9_-]+$/.test(tc)).toBe(true);
  });

  it("hidden iframe[name='__tcfapiLocator'] exists in DOM", async () => {
    const { installTCFAPI } = await importFresh();
    installTCFAPI({ cmpId: 0, cmpVersion: 1, getConsent: () => ({}) });
    const ifr = document.querySelector('iframe[name="__tcfapiLocator"]');
    expect(ifr).not.toBeNull();
    expect(ifr.style.display).toBe("none");
  });
});
