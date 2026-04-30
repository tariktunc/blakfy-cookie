import { describe, it, expect } from "vitest";
import { unblockIframes } from "../src/gating/iframe-unblocker.js";

const makeIframe = (category, src, opts = {}) => {
  const ifr = document.createElement("iframe");
  ifr.setAttribute("data-blakfy-src", src);
  ifr.setAttribute("data-blakfy-category", category);
  if (opts.placeholderId) {
    ifr.setAttribute("data-blakfy-placeholder-id", opts.placeholderId);
    const ph = document.createElement("div");
    ph.id = opts.placeholderId;
    document.body.appendChild(ph);
  }
  document.body.appendChild(ifr);
  return ifr;
};

describe("unblockIframes", () => {
  it("sets iframe.src from data-blakfy-src", () => {
    const ifr = makeIframe("marketing", "https://example.test/embed.html");
    const count = unblockIframes("marketing");
    expect(count).toBe(1);
    expect(ifr.src).toBe("https://example.test/embed.html");
    expect(ifr.getAttribute("data-blakfy-unblocked")).toBe("true");
  });

  it("removes placeholder when iframe is unblocked", () => {
    const ifr = makeIframe("marketing", "https://example.test/v.html", { placeholderId: "ph-xyz" });
    expect(document.getElementById("ph-xyz")).not.toBeNull();
    unblockIframes("marketing");
    expect(document.getElementById("ph-xyz")).toBeNull();
    expect(ifr.getAttribute("data-blakfy-placeholder-id")).toBeNull();
  });

  it("idempotency: two calls don't re-set src", () => {
    const ifr = makeIframe("marketing", "https://example.test/once.html");
    const first = unblockIframes("marketing");
    expect(first).toBe(1);
    const before = ifr.src;
    ifr.src = "https://different.test/intercept.html";
    const second = unblockIframes("marketing");
    expect(second).toBe(0);
    expect(ifr.src).toBe("https://different.test/intercept.html");
    expect(before).toContain("once.html");
  });

  it("ignores iframes without data-blakfy-src", () => {
    const ifr = document.createElement("iframe");
    ifr.setAttribute("data-blakfy-category", "marketing");
    document.body.appendChild(ifr);
    expect(unblockIframes("marketing")).toBe(0);
  });

  it("returns 0 when category is missing", () => {
    expect(unblockIframes(null)).toBe(0);
  });
});
