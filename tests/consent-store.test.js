import { describe, it, expect } from "vitest";

import { readCookie, writeCookie, buildState, COOKIE_NAME } from "../src/core/consent-store.js";

describe("consent-store readCookie", () => {
  it("returns null on missing cookie", () => {
    expect(readCookie("1.0")).toBeNull();
  });

  it("returns null on policy version mismatch (RE-CONSENT)", () => {
    const stored = JSON.stringify({ version: "0.9", essential: true });
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(stored) + "; path=/";
    expect(readCookie("1.0")).toBeNull();
  });

  it("returns parsed state when policy version matches", () => {
    const stored = JSON.stringify({ version: "1.0", essential: true, analytics: false });
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(stored) + "; path=/";
    const r = readCookie("1.0");
    expect(r).not.toBeNull();
    expect(r.essential).toBe(true);
  });

  it("does NOT check library version (v1 bug fix — v2 ignores libVersion)", () => {
    const stored = JSON.stringify({ version: "1.0", libVersion: "1.0.0", essential: true });
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(stored) + "; path=/";
    const r = readCookie("1.0");
    expect(r).not.toBeNull();
    expect(r.libVersion).toBe("1.0.0");
  });

  it("returns null when cookie body is malformed JSON", () => {
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent("{not-json") + "; path=/";
    expect(readCookie("1.0")).toBeNull();
  });
});

describe("consent-store writeCookie", () => {
  it("sets SameSite=Strict (visible only via document.cookie attrs would be hidden in jsdom — assert via spy)", () => {
    let captured = "";
    const orig = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return "";
      },
      set(v) {
        captured = v;
      },
    });
    writeCookie({ version: "1.0", essential: true });
    if (orig) Object.defineProperty(document, "cookie", orig);
    expect(captured).toContain("SameSite=Strict");
  });

  it("sets Secure only on https", () => {
    let captured = "";
    const orig = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return "";
      },
      set(v) {
        captured = v;
      },
    });

    const origLoc = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...origLoc, protocol: "http:" },
    });
    writeCookie({ version: "1.0", essential: true });
    expect(captured).not.toContain("Secure");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...origLoc, protocol: "https:" },
    });
    writeCookie({ version: "1.0", essential: true });
    expect(captured).toContain("Secure");

    if (orig) Object.defineProperty(document, "cookie", orig);
    Object.defineProperty(window, "location", { configurable: true, value: origLoc });
  });
});

describe("consent-store buildState", () => {
  it("produces UUID id when no prevId", () => {
    const s = buildState({ prefs: {}, currentLocale: "en", mainLang: "en", policyVersion: "1.0" });
    expect(s.id).toMatch(/^[0-9a-f-]+$/);
    expect(s.id.length).toBeGreaterThan(8);
  });

  it("preserves prevId when provided", () => {
    const s = buildState({
      prefs: {},
      currentLocale: "en",
      mainLang: "en",
      policyVersion: "1.0",
      prevId: "keep-this-id",
    });
    expect(s.id).toBe("keep-this-id");
  });

  it("includes jurisdiction, tcString, uspString, recording fields", () => {
    const s = buildState({
      prefs: { recording: true },
      currentLocale: "en",
      mainLang: "en",
      policyVersion: "1.0",
      jurisdiction: "EEA",
      tcString: "abc",
      uspString: "1YNN",
    });
    expect(s.jurisdiction).toBe("EEA");
    expect(s.tcString).toBe("abc");
    expect(s.uspString).toBe("1YNN");
    expect(s.recording).toBe(true);
  });

  it("essential is always true", () => {
    const s1 = buildState({ prefs: {}, policyVersion: "1.0" });
    const s2 = buildState({ prefs: { essential: false }, policyVersion: "1.0" });
    expect(s1.essential).toBe(true);
    expect(s2.essential).toBe(true);
  });

  it("defaults jurisdiction to 'default' when not provided", () => {
    const s = buildState({ prefs: {}, policyVersion: "1.0" });
    expect(s.jurisdiction).toBe("default");
    expect(s.tcString).toBeNull();
    expect(s.uspString).toBeNull();
  });
});
