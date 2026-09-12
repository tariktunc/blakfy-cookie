import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const importFresh = async () => {
  const mod = await import("../../src/adapters/host-adapters.js?t=" + Math.random());
  return mod;
};

const STATE = { analytics: true, marketing: false, functional: true };

describe("host-adapters detectHost", () => {
  afterEach(() => {
    delete window.Shopify;
    delete window.Static;
    delete window.wp_set_consent;
    delete window.wp_has_consent;
  });

  it("returns null when no platform marker is present", async () => {
    const { detectHost } = await importFresh();
    expect(detectHost(null)).toBe(null);
  });

  it("detects Shopify via window.Shopify", async () => {
    window.Shopify = {};
    const { detectHost } = await importFresh();
    expect(detectHost(null)).toBe("shopify");
  });

  it("detects Squarespace via window.Static.SQUARESPACE_CONTEXT", async () => {
    window.Static = { SQUARESPACE_CONTEXT: {} };
    const { detectHost } = await importFresh();
    expect(detectHost(null)).toBe("squarespace");
  });

  it("detects WordPress via WP Consent API global", async () => {
    window.wp_set_consent = () => {};
    const { detectHost } = await importFresh();
    expect(detectHost(null)).toBe("wordpress");
  });

  it("an explicit data-blakfy-host override wins over auto-detection", async () => {
    window.Shopify = {};
    const scriptEl = { getAttribute: () => "wordpress" };
    const { detectHost } = await importFresh();
    expect(detectHost(scriptEl)).toBe("wordpress");
  });

  it("ignores an unrecognized override value", async () => {
    const scriptEl = { getAttribute: () => "magento" };
    const { detectHost } = await importFresh();
    expect(detectHost(scriptEl)).toBe(null);
  });
});

describe("host-adapters bridgeShopify", () => {
  afterEach(() => {
    delete window.Shopify;
  });

  it("calls Shopify's Customer Privacy API with the mapped consent shape", async () => {
    const setTrackingConsent = vi.fn((_payload, cb) => cb && cb());
    window.Shopify = { customerPrivacy: { setTrackingConsent: setTrackingConsent } };
    const { bridgeShopify } = await importFresh();
    const ok = bridgeShopify(STATE);
    expect(ok).toBe(true);
    expect(setTrackingConsent).toHaveBeenCalledTimes(1);
    const payload = setTrackingConsent.mock.calls[0][0];
    expect(payload).toEqual({ analytics: true, marketing: false, preferences: true });
  });

  it("returns false and warns once when Shopify is present but customerPrivacy is not loaded yet", async () => {
    window.Shopify = {};
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const { bridgeShopify } = await importFresh();
    expect(bridgeShopify(STATE)).toBe(false);
    expect(bridgeShopify(STATE)).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe("host-adapters bridgeWordPress", () => {
  afterEach(() => {
    delete window.wp_set_consent;
  });

  it("maps state onto the WP Consent API categories, keeping statistics-anonymous allowed", async () => {
    const wp_set_consent = vi.fn();
    window.wp_set_consent = wp_set_consent;
    const { bridgeWordPress } = await importFresh();
    const ok = bridgeWordPress(STATE);
    expect(ok).toBe(true);
    const calls = Object.fromEntries(wp_set_consent.mock.calls);
    expect(calls.functional).toBe("allow");
    expect(calls.preferences).toBe("allow");
    expect(calls.statistics).toBe("allow");
    expect(calls["statistics-anonymous"]).toBe("allow");
    expect(calls.marketing).toBe("deny");
  });

  it("returns false and warns once with no WP Consent API present", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const { bridgeWordPress } = await importFresh();
    expect(bridgeWordPress(STATE)).toBe(false);
    expect(bridgeWordPress(STATE)).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe("host-adapters bridgeSquarespace", () => {
  it("never claims a bridge (no documented API) and warns once", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const { bridgeSquarespace } = await importFresh();
    expect(bridgeSquarespace()).toBe(false);
    expect(bridgeSquarespace()).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe("host-adapters installHostAdapter", () => {
  afterEach(() => {
    delete window.Shopify;
    delete window.Static;
    delete window.wp_set_consent;
  });

  it("returns {host: null, bridged: false} on a plain host", async () => {
    const { installHostAdapter } = await importFresh();
    expect(installHostAdapter(STATE, null)).toEqual({ host: null, bridged: false });
  });

  it("bridges Shopify end to end through installHostAdapter", async () => {
    const setTrackingConsent = vi.fn((_p, cb) => cb && cb());
    window.Shopify = { customerPrivacy: { setTrackingConsent: setTrackingConsent } };
    const { installHostAdapter } = await importFresh();
    expect(installHostAdapter(STATE, null)).toEqual({ host: "shopify", bridged: true });
  });

  it("reports Squarespace as detected but not bridged", async () => {
    window.Static = { SQUARESPACE_CONTEXT: {} };
    vi.spyOn(console, "info").mockImplementation(() => {});
    const { installHostAdapter } = await importFresh();
    expect(installHostAdapter(STATE, null)).toEqual({ host: "squarespace", bridged: false });
  });
});
