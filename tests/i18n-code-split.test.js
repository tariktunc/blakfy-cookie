// blakfy-cookie/tests/i18n-code-split.test.js — #38 bundle splitting: remote locale loading
//
// src/i18n/index.js bundles only tr/en; the other 21 locales are fetched at runtime as
// dist/i18n/{locale}.min.js chunks. These tests cover the loader contract without a real
// network — they check script-injection shape and fallback behavior.

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_LOCALE,
  REMOTE_LOCALES,
  TRANSLATIONS,
  getTranslation,
  isRemoteLocale,
  loadTranslation,
} from "../src/i18n/index.js";

afterEach(() => {
  document.head.innerHTML = "";
  delete window.__blakfyI18n;
  vi.restoreAllMocks();
});

describe("i18n code splitting (#38)", () => {
  it("bundles exactly tr and en inline", () => {
    expect(Object.keys(TRANSLATIONS).sort()).toEqual(["en", "tr"]);
  });

  it("REMOTE_LOCALES lists the other 21 locales, none overlapping the bundled two", () => {
    expect(REMOTE_LOCALES.length).toBe(21);
    expect(REMOTE_LOCALES.indexOf("tr")).toBe(-1);
    expect(REMOTE_LOCALES.indexOf("en")).toBe(-1);
    expect(isRemoteLocale("de")).toBe(true);
    expect(isRemoteLocale("tr")).toBe(false);
  });

  it("getTranslation() stays fully synchronous and never injects a script", () => {
    const before = document.head.querySelectorAll("script").length;
    const t = getTranslation("de");
    expect(t).toBe(TRANSLATIONS[DEFAULT_LOCALE]); // not loaded yet -> falls back
    expect(document.head.querySelectorAll("script").length).toBe(before);
  });

  it("loadTranslation() for a bundled locale resolves immediately, no script tag", async () => {
    const t = await loadTranslation("en", "https://cdn.example.com/cookie.min.js");
    expect(t).toBe(TRANSLATIONS.en);
    expect(document.head.querySelectorAll("script").length).toBe(0);
  });

  it("loadTranslation() with no baseHref falls back to DEFAULT_LOCALE without touching the DOM", async () => {
    const t = await loadTranslation("de", undefined);
    expect(t).toBe(TRANSLATIONS[DEFAULT_LOCALE]);
    expect(document.head.querySelectorAll("script").length).toBe(0);
  });

  it("loadTranslation() for a remote locale injects a sibling <script src>", async () => {
    const p = loadTranslation("de", "https://cdn.example.com/path/cookie.min.js");
    const script = document.head.querySelector("script");
    expect(script).toBeTruthy();
    expect(script.src).toBe("https://cdn.example.com/path/i18n/de.min.js");

    // simulate the chunk having loaded and registered itself
    window.__blakfyI18n = { de: { title: "Deutsch" } };
    script.onload();

    const t = await p;
    expect(t).toEqual({ title: "Deutsch" });
  });

  it("loadTranslation() falls back to DEFAULT_LOCALE on script error", async () => {
    const p = loadTranslation("fr", "https://cdn.example.com/cookie.min.js");
    const script = document.head.querySelector("script");
    script.onerror();
    const t = await p;
    expect(t).toBe(TRANSLATIONS[DEFAULT_LOCALE]);
  });

  it("loadTranslation() only injects one script for concurrent calls to the same locale", async () => {
    const p1 = loadTranslation("ru", "https://cdn.example.com/cookie.min.js");
    const p2 = loadTranslation("ru", "https://cdn.example.com/cookie.min.js");
    expect(document.head.querySelectorAll("script").length).toBe(1);
    const script = document.head.querySelector("script");
    window.__blakfyI18n = { ru: { title: "Russkiy" } };
    script.onload();
    const [t1, t2] = await Promise.all([p1, p2]);
    expect(t1).toEqual(t2);
  });
});
