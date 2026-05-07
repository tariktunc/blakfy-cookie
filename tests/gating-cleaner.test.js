import { describe, it, expect, beforeEach } from "vitest";

import { registerCleanup, runCleanup, clearAllRules } from "../src/gating/cleaner.js";

beforeEach(() => {
  clearAllRules();
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
