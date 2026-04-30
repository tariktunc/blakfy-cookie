import { describe, it, expect } from "vitest";
import { unblockScripts } from "../src/gating/script-unblocker.js";

describe("unblockScripts", () => {
  it("creates a fresh <script src> from data-blakfy-src and removes original", () => {
    const orig = document.createElement("script");
    orig.setAttribute("type", "text/plain");
    orig.setAttribute("data-blakfy-category", "marketing");
    orig.setAttribute("data-blakfy-src", "https://example.test/x.js");
    document.body.appendChild(orig);

    const count = unblockScripts("marketing");
    expect(count).toBe(1);

    const live = document.querySelector('script[src="https://example.test/x.js"]');
    expect(live).not.toBeNull();
    expect(live.getAttribute("type")).toBeNull();

    const remaining = document.querySelectorAll('script[type="text/plain"][data-blakfy-category="marketing"]:not([data-blakfy-unblocked="true"])');
    expect(remaining.length).toBe(0);
  });

  it("inline scripts get textContent copied with no type attribute", () => {
    const orig = document.createElement("script");
    orig.setAttribute("type", "text/plain");
    orig.setAttribute("data-blakfy-category", "analytics");
    orig.textContent = "var x=1;";
    document.body.appendChild(orig);

    unblockScripts("analytics");
    const live = Array.from(document.querySelectorAll("script")).find(
      (s) => s.textContent === "var x=1;" && s.getAttribute("type") !== "text/plain"
    );
    expect(live).toBeDefined();
    const t = live.getAttribute("type");
    expect(t === null || t === "application/javascript" || t === "").toBe(true);
  });

  it("calling twice does not double-process (idempotency)", () => {
    const orig = document.createElement("script");
    orig.setAttribute("type", "text/plain");
    orig.setAttribute("data-blakfy-category", "marketing");
    orig.setAttribute("data-blakfy-src", "https://example.test/y.js");
    document.body.appendChild(orig);

    const first = unblockScripts("marketing");
    const second = unblockScripts("marketing");
    expect(first).toBe(1);
    expect(second).toBe(0);

    const lives = document.querySelectorAll('script[src="https://example.test/y.js"]');
    expect(lives.length).toBe(1);
  });

  it("ignores scripts with mismatched category", () => {
    const orig = document.createElement("script");
    orig.setAttribute("type", "text/plain");
    orig.setAttribute("data-blakfy-category", "marketing");
    orig.setAttribute("data-blakfy-src", "https://example.test/z.js");
    document.body.appendChild(orig);

    const count = unblockScripts("analytics");
    expect(count).toBe(0);
  });

  it("returns 0 when category is missing", () => {
    expect(unblockScripts(null)).toBe(0);
    expect(unblockScripts("")).toBe(0);
  });
});
