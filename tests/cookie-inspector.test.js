// blakfy-cookie/tests/cookie-inspector.test.js — #39 cookie transparency panel data layer

import { describe, it, expect, afterEach } from "vitest";

import { COOKIE_NAME } from "../src/core/consent-store.js";
import {
  listObservedCookies,
  deleteObservedCookie,
  diffCatalogueAgainstObserved,
} from "../src/data/cookie-inspector.js";

const PRESETS = {
  ga4: {
    name: "Google Analytics 4",
    category: "analytics",
    cookies: [/^_ga/, "_gid"],
  },
  facebook: {
    name: "Facebook Pixel",
    category: "marketing",
    cookies: ["_fbp"],
  },
};

const setCookie = (name, value) => {
  document.cookie = name + "=" + (value || "1") + "; path=/";
};

const clearAllTestCookies = () => {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter(Boolean);
  for (const n of names) {
    document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  }
};

afterEach(() => {
  clearAllTestCookies();
});

describe("listObservedCookies", () => {
  it("matches a cookie against a preset's regex and attaches service metadata", () => {
    setCookie("_ga_ABC123");
    const list = listObservedCookies(PRESETS);
    const row = list.find((c) => c.name === "_ga_ABC123");
    expect(row).toBeDefined();
    expect(row.service).toBe("Google Analytics 4");
    expect(row.category).toBe("analytics");
    expect(row.unrecognised).toBe(false);
    expect(row.essential).toBe(false);
  });

  it("matches a cookie against a preset's exact string", () => {
    setCookie("_fbp");
    const list = listObservedCookies(PRESETS);
    const row = list.find((c) => c.name === "_fbp");
    expect(row.service).toBe("Facebook Pixel");
    expect(row.unrecognised).toBe(false);
  });

  it("marks a cookie matching no preset as unrecognised", () => {
    setCookie("some_random_cookie");
    const list = listObservedCookies(PRESETS);
    const row = list.find((c) => c.name === "some_random_cookie");
    expect(row.unrecognised).toBe(true);
    expect(row.service).toBeNull();
  });

  it("marks the Blakfy consent cookie itself as essential and non-deletable", () => {
    setCookie(COOKIE_NAME, "%7B%22id%22%3A%221%22%7D");
    const list = listObservedCookies(PRESETS);
    const row = list.find((c) => c.name === COOKIE_NAME);
    expect(row.essential).toBe(true);
    expect(row.unrecognised).toBe(false);
  });

  it("returns an empty array when no cookies are present", () => {
    expect(listObservedCookies(PRESETS)).toEqual([]);
  });
});

describe("deleteObservedCookie", () => {
  it("deletes a non-essential cookie and returns true", () => {
    setCookie("_ga_XYZ");
    const result = deleteObservedCookie("_ga_XYZ");
    expect(result).toBe(true);
    expect(
      document.cookie.indexOf("_ga_XYZ=") === -1 || document.cookie.indexOf("_ga_XYZ=;") > -1
    ).toBe(true);
  });

  it("refuses to delete the essential Blakfy consent cookie", () => {
    setCookie(COOKIE_NAME, "abc");
    const result = deleteObservedCookie(COOKIE_NAME);
    expect(result).toBe(false);
    expect(document.cookie).toContain(COOKIE_NAME + "=abc");
  });

  it("refuses a null/empty name without throwing", () => {
    expect(deleteObservedCookie("")).toBe(false);
    expect(deleteObservedCookie(null)).toBe(false);
  });
});

describe("diffCatalogueAgainstObserved", () => {
  it("flags a declared cookie that is not actually observed", () => {
    // ga4 declared but neither _ga* nor _gid present
    const diff = diffCatalogueAgainstObserved(PRESETS, ["ga4"]);
    expect(diff.length).toBe(1);
    expect(diff[0].key).toBe("ga4");
    expect(diff[0].declaredButNotObserved).toContain("_gid");
  });

  it("returns empty when every declared cookie is observed", () => {
    setCookie("_fbp");
    const diff = diffCatalogueAgainstObserved(PRESETS, ["facebook"]);
    expect(diff.length).toBe(0);
  });

  it("ignores presets not in the active list", () => {
    const diff = diffCatalogueAgainstObserved(PRESETS, []);
    expect(diff).toEqual([]);
  });
});
