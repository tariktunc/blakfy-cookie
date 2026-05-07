// tests/presets/registry.test.js — 18 preset için ortak şema validasyonu

import { describe, it, expect, vi } from "vitest";

import { PRESETS, applyPreset } from "../../src/presets/_registry.js";

const VALID_CATEGORIES = ["essential", "analytics", "marketing", "functional", "recording"];

const EXPECTED_PRESETS = [
  // Google ekosistemi
  { id: "ga4", name: "Google Analytics 4", category: "analytics" },
  { id: "gtm", name: "Google Tag Manager", category: "analytics" },
  { id: "maps", name: "Google Maps", category: "functional" },
  { id: "recaptcha", name: "Google reCAPTCHA", category: "functional" },

  // Meta + Video
  { id: "facebook", name: "Facebook Pixel", category: "marketing" },
  { id: "youtube", name: "YouTube", category: "marketing" },
  { id: "vimeo", name: "Vimeo", category: "marketing" },

  // Analytics + recording
  { id: "hotjar", name: "Hotjar", category: "analytics" },
  { id: "clarity", name: "Microsoft Clarity", category: "analytics" },
  { id: "linkedin", name: "LinkedIn Insight", category: "marketing" },
  { id: "yandex", name: "Yandex Metrica", category: "analytics", subCategory: "recording" },

  // Ads
  { id: "bing", name: "Bing Ads", category: "marketing" },
  { id: "tiktok", name: "TikTok Pixel", category: "marketing" },
  { id: "pinterest", name: "Pinterest Tag", category: "marketing" },

  // Chat / CRM
  { id: "tawkto", name: "Tawk.to", category: "functional" },
  { id: "intercom", name: "Intercom", category: "functional" },
  { id: "hubspot", name: "HubSpot", category: "marketing" },
  { id: "mailchimp", name: "Mailchimp", category: "marketing" },
];

describe("PRESETS registry — 18 preset varlığı + şema parity", () => {
  it("exposes exactly 18 presets", () => {
    expect(Object.keys(PRESETS)).toHaveLength(EXPECTED_PRESETS.length);
  });

  it("all expected preset IDs are registered", () => {
    const registeredIds = Object.keys(PRESETS).sort();
    const expectedIds = EXPECTED_PRESETS.map((p) => p.id).sort();
    expect(registeredIds).toEqual(expectedIds);
  });
});

// Parametrize edilmiş per-preset testler
describe.each(EXPECTED_PRESETS)("preset $id", ({ id, category, subCategory }) => {
  const preset = PRESETS[id];

  it(`exists in registry`, () => {
    expect(preset).toBeDefined();
  });

  it(`has correct category: ${category}`, () => {
    expect(VALID_CATEGORIES).toContain(preset.category);
    expect(preset.category).toBe(category);
  });

  if (subCategory) {
    it(`has subCategory: ${subCategory}`, () => {
      expect(preset.subCategory).toBe(subCategory);
    });
  }

  it("has 'cookies' array (string|RegExp entries)", () => {
    expect(Array.isArray(preset.cookies)).toBe(true);
    for (const c of preset.cookies) {
      expect(typeof c === "string" || c instanceof RegExp).toBe(true);
    }
  });

  it("has 'storage' array (string entries)", () => {
    expect(Array.isArray(preset.storage)).toBe(true);
    for (const s of preset.storage) {
      expect(typeof s).toBe("string");
    }
  });

  it("has 'name' string for display", () => {
    expect(typeof preset.name).toBe("string");
    expect(preset.name.length).toBeGreaterThan(0);
  });
});

describe("applyPreset()", () => {
  it("unknown preset name → returns null", () => {
    const cleanup = vi.fn();
    expect(applyPreset("nonexistent", { registerCleanup: cleanup })).toBe(null);
    expect(cleanup).not.toHaveBeenCalled();
  });

  it.each(EXPECTED_PRESETS)("$id → registerCleanup çağrılır", ({ id, category, subCategory }) => {
    const cleanup = vi.fn();
    const result = applyPreset(id, { registerCleanup: cleanup });
    expect(result).toBeTruthy();
    expect(cleanup).toHaveBeenCalled();

    const firstCall = cleanup.mock.calls[0][0];
    expect(firstCall.category).toBe(category);
    expect(Array.isArray(firstCall.cookies)).toBe(true);
    expect(Array.isArray(firstCall.storage)).toBe(true);

    if (subCategory) {
      expect(cleanup).toHaveBeenCalledTimes(2);
      const secondCall = cleanup.mock.calls[1][0];
      expect(secondCall.category).toBe(subCategory);
    } else {
      expect(cleanup).toHaveBeenCalledTimes(1);
    }
  });

  it("registerCleanup function değilse silent skip", () => {
    expect(() => applyPreset("ga4", {})).not.toThrow();
    expect(() => applyPreset("ga4", { registerCleanup: null })).not.toThrow();
  });
});
