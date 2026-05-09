// tests/ui/theme-bridge.test.js — site theme detection + reactive watch + card application

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  detectSiteTheme,
  watchSiteTheme,
  applyThemeToCard,
  normalizeThemeValue,
} from "../../src/ui/theme-bridge.js";

beforeEach(() => {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-mode");
  document.body.className = "";
  document.body.removeAttribute("data-theme");
  document.body.removeAttribute("data-mode");
  document.body.style.backgroundColor = "";
});

describe("detectSiteTheme", () => {
  it('returns "dark" when <html class="dark">', () => {
    document.documentElement.classList.add("dark");
    expect(detectSiteTheme()).toBe("dark");
  });

  it('returns "light" when <html class="light">', () => {
    document.documentElement.classList.add("light");
    expect(detectSiteTheme()).toBe("light");
  });

  it("falls back to <body> class signals", () => {
    document.body.classList.add("dark");
    expect(detectSiteTheme()).toBe("dark");
  });

  it("reads data-theme as compatibility fallback", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    expect(detectSiteTheme()).toBe("dark");
  });

  it("reads data-mode as legacy compatibility", () => {
    document.documentElement.setAttribute("data-mode", "light");
    expect(detectSiteTheme()).toBe("light");
  });

  it("prioritizes <html class> over data-theme", () => {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "light");
    expect(detectSiteTheme()).toBe("dark");
  });

  it('returns "light" by default when no signal exists (jsdom default bg)', () => {
    expect(detectSiteTheme()).toBe("light");
  });
});

describe("watchSiteTheme", () => {
  it("returns a disposer function", () => {
    const dispose = watchSiteTheme(() => {});
    expect(typeof dispose).toBe("function");
    dispose();
  });

  it("fires callback when <html class> toggles dark", async () => {
    const cb = vi.fn();
    const dispose = watchSiteTheme(cb);
    document.documentElement.classList.add("dark");
    await new Promise((r) => setTimeout(r, 80)); // > debounce
    expect(cb).toHaveBeenCalledWith("dark");
    dispose();
  });

  it("does not fire when theme is unchanged", async () => {
    document.documentElement.classList.add("dark");
    const cb = vi.fn();
    const dispose = watchSiteTheme(cb);
    document.documentElement.classList.add("dark"); // idempotent
    await new Promise((r) => setTimeout(r, 80));
    expect(cb).not.toHaveBeenCalled();
    dispose();
  });

  it("debounces rapid changes (single call)", async () => {
    const cb = vi.fn();
    const dispose = watchSiteTheme(cb);
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("dark");
    await new Promise((r) => setTimeout(r, 80));
    // After debounce settles, theme is "dark", so callback fires once
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("dark");
    dispose();
  });

  it("disposer disconnects observer", async () => {
    const cb = vi.fn();
    const dispose = watchSiteTheme(cb);
    dispose();
    document.documentElement.classList.add("dark");
    await new Promise((r) => setTimeout(r, 80));
    expect(cb).not.toHaveBeenCalled();
  });
});

describe("applyThemeToCard", () => {
  it('sets data-blakfy-theme="dark" for dark', () => {
    const card = document.createElement("div");
    applyThemeToCard(card, "dark");
    expect(card.getAttribute("data-blakfy-theme")).toBe("dark");
  });

  it("removes attribute for light (default state)", () => {
    const card = document.createElement("div");
    card.setAttribute("data-blakfy-theme", "dark");
    applyThemeToCard(card, "light");
    expect(card.hasAttribute("data-blakfy-theme")).toBe(false);
  });

  it('sets "gray" theme explicitly', () => {
    const card = document.createElement("div");
    applyThemeToCard(card, "gray");
    expect(card.getAttribute("data-blakfy-theme")).toBe("gray");
  });

  it("is null-safe", () => {
    expect(() => applyThemeToCard(null, "dark")).not.toThrow();
    expect(() => applyThemeToCard(undefined, "dark")).not.toThrow();
  });
});

describe("normalizeThemeValue", () => {
  it('maps "black" → "dark"', () => {
    expect(normalizeThemeValue("black")).toBe("dark");
  });

  it('maps "white" → "light"', () => {
    expect(normalizeThemeValue("white")).toBe("light");
  });

  it("preserves explicit values", () => {
    expect(normalizeThemeValue("dark")).toBe("dark");
    expect(normalizeThemeValue("light")).toBe("light");
    expect(normalizeThemeValue("auto")).toBe("auto");
    expect(normalizeThemeValue("gray")).toBe("gray");
  });

  it('returns "auto" for null/undefined', () => {
    expect(normalizeThemeValue(null)).toBe("auto");
    expect(normalizeThemeValue(undefined)).toBe("auto");
    expect(normalizeThemeValue("")).toBe("auto");
  });
});
