// tests/geo/jurisdiction.test.js — country/region → jurisdiction map'leme

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { mapCountryToJurisdiction, detectJurisdiction } from "../../src/geo/jurisdiction.js";

describe("mapCountryToJurisdiction", () => {
  it("TR → GDPR (KVKK Türkiye için GDPR muamelesi alır)", () => {
    expect(mapCountryToJurisdiction("TR")).toBe("GDPR");
  });

  it("DE (Germany) → GDPR", () => {
    expect(mapCountryToJurisdiction("DE")).toBe("GDPR");
  });

  it("FR / IT / ES / NL / GB → GDPR", () => {
    expect(mapCountryToJurisdiction("FR")).toBe("GDPR");
    expect(mapCountryToJurisdiction("IT")).toBe("GDPR");
    expect(mapCountryToJurisdiction("ES")).toBe("GDPR");
    expect(mapCountryToJurisdiction("NL")).toBe("GDPR");
    expect(mapCountryToJurisdiction("GB")).toBe("GDPR");
  });

  it("US-CA → CCPA (sadece Kaliforniya)", () => {
    expect(mapCountryToJurisdiction("US", "CA")).toBe("CCPA");
  });

  it("US-NY → default (Kaliforniya değil)", () => {
    expect(mapCountryToJurisdiction("US", "NY")).toBe("default");
  });

  it("US-TX → default", () => {
    expect(mapCountryToJurisdiction("US", "TX")).toBe("default");
  });

  it("US (region yok) → default", () => {
    expect(mapCountryToJurisdiction("US")).toBe("default");
  });

  it("BR → LGPD (Brezilya)", () => {
    expect(mapCountryToJurisdiction("BR")).toBe("LGPD");
  });

  it("JP → default", () => {
    expect(mapCountryToJurisdiction("JP")).toBe("default");
  });

  it("unknown country → default", () => {
    expect(mapCountryToJurisdiction("ZZ")).toBe("default");
    expect(mapCountryToJurisdiction("XX", "YY")).toBe("default");
  });

  it("empty / null / undefined → default", () => {
    expect(mapCountryToJurisdiction("")).toBe("default");
    expect(mapCountryToJurisdiction(null)).toBe("default");
    expect(mapCountryToJurisdiction(undefined)).toBe("default");
  });

  it("küçük harf country code OK (case insensitive)", () => {
    expect(mapCountryToJurisdiction("de")).toBe("GDPR");
    expect(mapCountryToJurisdiction("us", "ca")).toBe("CCPA");
  });
});

describe("detectJurisdiction (fetch + tz fallback)", () => {
  let origFetch;
  let origTz;

  beforeEach(() => {
    origFetch = globalThis.fetch;
    if (document?.documentElement?.dataset) {
      delete document.documentElement.dataset.jurisdiction;
    }
    origTz = Intl.DateTimeFormat;
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
    Intl.DateTimeFormat = origTz;
  });

  it("data-jurisdiction attr önceliklidir (override)", async () => {
    document.documentElement.dataset.jurisdiction = "CCPA";
    const result = await detectJurisdiction({ geoEndpoint: "https://example.test/geo" });
    expect(result).toBe("CCPA");
  });

  it("invalid data-jurisdiction (örn. 'INVALID') ignore edilir", async () => {
    document.documentElement.dataset.jurisdiction = "INVALID";
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "DE" }),
    });
    const result = await detectJurisdiction({ geoEndpoint: "https://example.test/geo" });
    expect(result).toBe("GDPR");
  });

  it("geoEndpoint başarılı response → country'den çevirir", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "BR" }),
    });
    const result = await detectJurisdiction({ geoEndpoint: "https://geo.test/" });
    expect(result).toBe("LGPD");
  });

  it("geoEndpoint US + CA region → CCPA", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "US", region: "CA" }),
    });
    const result = await detectJurisdiction({ geoEndpoint: "https://geo.test/" });
    expect(result).toBe("CCPA");
  });

  it("geoEndpoint fetch fail → tz fallback", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("net err"));
    // tz mock — Europe/Istanbul → GDPR
    Intl.DateTimeFormat = function () {
      return { resolvedOptions: () => ({ timeZone: "Europe/Istanbul" }) };
    };
    const result = await detectJurisdiction({ geoEndpoint: "https://geo.test/" });
    expect(result).toBe("GDPR");
  });

  it("geoEndpoint yok → tz fallback (America/Los_Angeles → CCPA)", async () => {
    Intl.DateTimeFormat = function () {
      return { resolvedOptions: () => ({ timeZone: "America/Los_Angeles" }) };
    };
    const result = await detectJurisdiction({});
    expect(result).toBe("CCPA");
  });

  it("Tokyo timezone → default", async () => {
    Intl.DateTimeFormat = function () {
      return { resolvedOptions: () => ({ timeZone: "Asia/Tokyo" }) };
    };
    const result = await detectJurisdiction({});
    expect(result).toBe("default");
  });
});
