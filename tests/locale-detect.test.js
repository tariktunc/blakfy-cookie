import { describe, it, expect } from "vitest";
import { normalizeLocale, detectLocale, RTL_LOCALES, SUPPORTED_LOCALES } from "../src/i18n/detect.js";

describe("normalizeLocale", () => {
  it("returns exact match: zh-TW", () => {
    expect(normalizeLocale("zh-TW", SUPPORTED_LOCALES)).toBe("zh-TW");
  });

  it("returns prefix fallback: zh-CN -> zh", () => {
    expect(normalizeLocale("zh-CN", SUPPORTED_LOCALES)).toBe("zh");
  });

  it("returns null for unsupported locale", () => {
    expect(normalizeLocale("xx", SUPPORTED_LOCALES)).toBeNull();
  });

  it("handles case-insensitive matching", () => {
    expect(normalizeLocale("EN", SUPPORTED_LOCALES)).toBe("en");
    expect(normalizeLocale("zh-tw", SUPPORTED_LOCALES)).toBe("zh-TW");
  });

  it("returns null for empty/null input", () => {
    expect(normalizeLocale("", SUPPORTED_LOCALES)).toBeNull();
    expect(normalizeLocale(null, SUPPORTED_LOCALES)).toBeNull();
  });
});

describe("detectLocale", () => {
  it("returns configLocale when explicit (not 'auto')", () => {
    expect(detectLocale({ configLocale: "ar" })).toBe("ar");
  });

  it("respects ?lang query > html lang > navigator when configLocale='auto'", () => {
    const origHref = window.location.href;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, href: "https://example.test/?lang=fr", search: "?lang=fr" }
    });
    document.documentElement.lang = "de";
    Object.defineProperty(navigator, "language", { configurable: true, value: "es" });

    expect(detectLocale({ configLocale: "auto" })).toBe("fr");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, href: origHref, search: "" }
    });
  });

  it("falls back to html lang when no query param", () => {
    document.documentElement.lang = "de";
    Object.defineProperty(navigator, "language", { configurable: true, value: "es" });
    expect(detectLocale({ configLocale: "auto" })).toBe("de");
  });

  it("falls back to navigator when no html lang", () => {
    document.documentElement.removeAttribute("lang");
    Object.defineProperty(navigator, "language", { configurable: true, value: "it" });
    expect(detectLocale({ configLocale: "auto" })).toBe("it");
  });

  it("falls back to defaultLocale when nothing matches", () => {
    document.documentElement.removeAttribute("lang");
    Object.defineProperty(navigator, "language", { configurable: true, value: "xx-XX" });
    expect(detectLocale({ configLocale: "auto", defaultLocale: "tr" })).toBe("tr");
  });
});

describe("RTL_LOCALES", () => {
  it("contains ar, he, fa, ur", () => {
    expect(RTL_LOCALES).toContain("ar");
    expect(RTL_LOCALES).toContain("he");
    expect(RTL_LOCALES).toContain("fa");
    expect(RTL_LOCALES).toContain("ur");
  });
});
