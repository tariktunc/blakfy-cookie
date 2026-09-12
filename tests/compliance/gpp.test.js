// tests/compliance/gpp.test.js — #32: minimal GPP (__gpp) CMP API stub
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { installGPPAPI } from "../../src/compliance/gpp.js";

afterEach(() => {
  delete window.__gpp;
  document.querySelectorAll('iframe[name="__gppLocator"]').forEach((n) => n.remove());
});

describe("installGPPAPI", () => {
  beforeEach(() => {
    delete window.__gpp;
  });

  it("installs window.__gpp as a callable command dispatcher", () => {
    installGPPAPI({ getConsent: () => ({}), getGpc: () => false });
    expect(typeof window.__gpp).toBe("function");
  });

  it("ping reports cmpStatus loaded and usnat in supportedAPIs", () => {
    installGPPAPI({ getConsent: () => ({}), getGpc: () => false, cmpId: 42 });
    let result = null;
    window.__gpp("ping", (data) => (result = data), null);
    expect(result.cmpStatus).toBe("loaded");
    expect(result.supportedAPIs).toContain("7:usnat");
    expect(result.cmpId).toBe(42);
  });

  it("getGPPData reflects opt-out state from consent + GPC", () => {
    installGPPAPI({ getConsent: () => ({ marketing: false }), getGpc: () => true });
    let result = null;
    window.__gpp("getGPPData", (data) => (result = data), null);
    expect(result.parsedSections.usnat.SaleOptOut).toBe(1); // opted out
    expect(result.parsedSections.usnat.Gpc).toBe(true);
  });

  it("getGPPData reports no opt-out when marketing is granted and GPC is off", () => {
    installGPPAPI({ getConsent: () => ({ marketing: true }), getGpc: () => false });
    let result = null;
    window.__gpp("getGPPData", (data) => (result = data), null);
    expect(result.parsedSections.usnat.SaleOptOut).toBe(2); // did not opt out
    expect(result.parsedSections.usnat.Gpc).toBe(false);
  });

  it("addEventListener registers a listener and fires it immediately", () => {
    installGPPAPI({ getConsent: () => ({}), getGpc: () => false });
    let calls = 0;
    window.__gpp("addEventListener", () => calls++, null);
    expect(calls).toBe(1);
  });

  it("removeEventListener reports success for a known id, failure otherwise", () => {
    installGPPAPI({ getConsent: () => ({}), getGpc: () => false });
    let listenerId = null;
    window.__gpp("addEventListener", (data) => (listenerId = data.listenerId), null);
    let removedOk = null;
    window.__gpp("removeEventListener", (data) => (removedOk = data.success), listenerId);
    expect(removedOk).toBe(true);

    let removedBad = null;
    window.__gpp("removeEventListener", (data) => (removedBad = data.success), 9999);
    expect(removedBad).toBe(false);
  });

  it("drains a pre-existing __gpp.queue (stub-loader shape) on install", () => {
    let seen = null;
    window.__gpp = { queue: [["ping", (d) => (seen = d), null]] };
    installGPPAPI({ getConsent: () => ({}), getGpc: () => false });
    expect(seen).not.toBeNull();
    expect(seen.cmpStatus).toBe("loaded");
  });

  it("creates the __gppLocator iframe once", () => {
    installGPPAPI({ getConsent: () => ({}), getGpc: () => false });
    installGPPAPI({ getConsent: () => ({}), getGpc: () => false });
    expect(document.querySelectorAll('iframe[name="__gppLocator"]').length).toBe(1);
  });
});
