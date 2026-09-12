// tests/policy-text.test.js — in-widget policy notice generation (#49)

import { describe, it, expect } from "vitest";

import { buildPolicyText, isAutoPolicy } from "../src/compliance/policy-text.js";

describe("isAutoPolicy", () => {
  it("treats undefined, null, empty string and 'auto' as auto", () => {
    expect(isAutoPolicy(undefined)).toBe(true);
    expect(isAutoPolicy(null)).toBe(true);
    expect(isAutoPolicy("")).toBe(true);
    expect(isAutoPolicy("auto")).toBe(true);
  });

  it("treats a real path/URL as NOT auto", () => {
    expect(isAutoPolicy("/cerez-politikasi")).toBe(false);
    expect(isAutoPolicy("https://example.com/privacy")).toBe(false);
  });
});

describe("buildPolicyText", () => {
  it("marks the notice incomplete when operator/operatorContact are missing", () => {
    const result = buildPolicyText({ locale: "en", enrichedPresets: [] });
    expect(result.incomplete).toBe(true);
    expect(result.controller.name).toBeNull();
  });

  it("marks the notice complete when both operator and operatorContact are set", () => {
    const result = buildPolicyText({
      locale: "en",
      operator: "Acme A.S.",
      operatorContact: "privacy@acme.test",
      enrichedPresets: [],
    });
    expect(result.incomplete).toBe(false);
    expect(result.controller.name).toBe("Acme A.S.");
    expect(result.controller.contact).toBe("privacy@acme.test");
  });

  it("stays incomplete when only operator is set (contact still missing)", () => {
    const result = buildPolicyText({ locale: "en", operator: "Acme A.S.", enrichedPresets: [] });
    expect(result.incomplete).toBe(true);
  });

  it("summarizes enriched presets into the services list", () => {
    const result = buildPolicyText({
      locale: "en",
      operator: "Acme",
      operatorContact: "a@b.test",
      enrichedPresets: [
        {
          key: "ga4",
          meta: {
            displayName: "Google Analytics 4",
            category: "analytics",
            purposes: ["Analytics"],
            legalBasis: "consent",
            retention: "14 months",
          },
        },
      ],
    });
    expect(result.services).toHaveLength(1);
    expect(result.services[0].displayName).toBe("Google Analytics 4");
    expect(result.services[0].retention).toBe("14 months");
  });

  it("selects jurisdiction-specific rights text", () => {
    const gdpr = buildPolicyText({
      locale: "en",
      operator: "A",
      operatorContact: "b",
      jurisdiction: "GDPR",
      enrichedPresets: [],
    });
    const kvkk = buildPolicyText({
      locale: "en",
      operator: "A",
      operatorContact: "b",
      jurisdiction: "KVKK",
      enrichedPresets: [],
    });
    expect(gdpr.rightsText).not.toBe(kvkk.rightsText);
  });

  it("falls back to English strings for an unsupported locale", () => {
    const result = buildPolicyText({ locale: "zz", operator: "A", operatorContact: "b" });
    expect(result.strings.tabLabel).toBe("Policy");
  });

  it("uses Turkish strings for locale 'tr'", () => {
    const result = buildPolicyText({ locale: "tr", operator: "A", operatorContact: "b" });
    expect(result.strings.tabLabel).toBe("Politika");
  });
});
