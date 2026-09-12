import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  registerCleanup,
  runCleanup,
  clearAllRules,
  warnUnregisteredCookies,
  warnPreConsentCookies,
} from "../src/gating/cleaner.js";

beforeEach(() => {
  clearAllRules();
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name) document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
});

describe("cleaner registerCleanup + runCleanup", () => {
  it("clears matching cookies and storage; leaves others", () => {
    document.cookie = "_ga=1; path=/";
    document.cookie = "_ga_ABC=2; path=/";
    document.cookie = "unrelated=3; path=/";
    localStorage.setItem("ga-session", "v");
    localStorage.setItem("other", "keep");

    registerCleanup({
      category: "analytics",
      cookies: ["_ga", /^_ga_/],
      storage: ["ga-session"],
    });

    runCleanup("analytics");

    const cookies = document.cookie;
    expect(cookies).not.toContain("_ga=1");
    expect(cookies).not.toContain("_ga_ABC=2");
    expect(cookies).toContain("unrelated=3");
    expect(localStorage.getItem("ga-session")).toBeNull();
    expect(localStorage.getItem("other")).toBe("keep");
  });

  it("returns counts for cookies and storage", () => {
    document.cookie = "trackcookie=1; path=/";
    localStorage.setItem("trackls", "v");
    registerCleanup({ category: "marketing", cookies: ["trackcookie"], storage: ["trackls"] });
    const result = runCleanup("marketing");
    expect(result.cookies).toBeGreaterThanOrEqual(1);
    expect(result.storage).toBeGreaterThanOrEqual(1);
  });

  it("returns zero counts when no rules registered", () => {
    const result = runCleanup("unknown-category");
    expect(result).toEqual({ cookies: 0, storage: 0 });
  });

  it("matches regex against existing cookie names only", () => {
    document.cookie = "_ga_AAA=v1; path=/";
    document.cookie = "_ga_BBB=v2; path=/";
    registerCleanup({ category: "analytics", cookies: [/^_ga_/], storage: [] });
    runCleanup("analytics");
    expect(document.cookie).not.toContain("_ga_AAA");
    expect(document.cookie).not.toContain("_ga_BBB");
  });
});

const FAKE_PRESETS = {
  ga4: { name: "Google Analytics 4", category: "analytics", cookies: [/^_ga/] },
  facebook: { name: "Facebook Pixel", category: "marketing", cookies: [/^_fbp$/] },
};

describe("getRootDomain public-suffix handling (#25)", () => {
  it("expires cookies on the correct root for a .com.tr host, not just 'com.tr'", () => {
    const original = Object.getOwnPropertyDescriptor(window, "location");
    Object.defineProperty(window, "location", {
      value: { hostname: "shop.example.com.tr" },
      configurable: true,
    });

    document.cookie = "trackme=1; path=/";
    registerCleanup({ category: "analytics", cookies: ["trackme"], storage: [] });

    // Spy on document.cookie assignments to confirm a domain=.example.com.tr
    // deletion attempt is made (not the wrong domain=.com.tr).
    const setter = vi.spyOn(document, "cookie", "set");
    runCleanup("analytics");

    const attempts = setter.mock.calls.map((c) => c[0]);
    expect(attempts.some((a) => a.indexOf("domain=.example.com.tr") > -1)).toBe(true);
    expect(
      attempts.some((a) => a.indexOf("domain=.com.tr;") > -1 || a.endsWith("domain=.com.tr"))
    ).toBe(false);

    setter.mockRestore();
    if (original) Object.defineProperty(window, "location", original);
  });
});

describe("warnUnregisteredCookies (#25)", () => {
  it("warns when a known tracker cookie exists but its category has no registered rule", () => {
    document.cookie = "_ga=GA1.2.123; path=/";
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const found = warnUnregisteredCookies(FAKE_PRESETS);

    expect(found.length).toBe(1);
    expect(found[0].preset).toBe("ga4");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("ga4");
    spy.mockRestore();
  });

  it("does not warn once a rule for that category IS registered", () => {
    document.cookie = "_ga=GA1.2.123; path=/";
    registerCleanup({ category: "analytics", cookies: [/^_ga/], storage: [] });
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const found = warnUnregisteredCookies(FAKE_PRESETS);

    expect(found.length).toBe(0);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("returns [] when there are no cookies at all", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(warnUnregisteredCookies(FAKE_PRESETS)).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("warnPreConsentCookies (#43)", () => {
  it("warns when a registered category's cookie exists but consent is not granted", () => {
    document.cookie = "_fbp=fb.1.111; path=/";
    registerCleanup({ category: "marketing", cookies: [/^_fbp$/], storage: [] });
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const getConsent = (cat) => cat !== "marketing";

    const found = warnPreConsentCookies(FAKE_PRESETS, getConsent);

    expect(found.length).toBe(1);
    expect(found[0].preset).toBe("facebook");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("does not warn once consent for that category is granted", () => {
    document.cookie = "_fbp=fb.1.111; path=/";
    registerCleanup({ category: "marketing", cookies: [/^_fbp$/], storage: [] });
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const getConsent = (cat) => cat === "marketing";

    const found = warnPreConsentCookies(FAKE_PRESETS, getConsent);

    expect(found.length).toBe(0);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
