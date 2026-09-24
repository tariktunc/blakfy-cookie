import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { readConfig, DEFAULTS } from "../src/core/config.js";

// Blind test written from spec.md (this job's spec), not from the T-02 implementation.
// Verifies spec.md acceptance criteria 2 and 3 against the BUILT dist and the public
// config-resolution API. Does not read src/ui/styles.js, src/ui/fab.js or src/ui/badge.js.

const HOST_ID = "blakfy-cookie-root";

const makeScript = () => {
  const el = document.createElement("script");
  document.body.appendChild(el);
  Object.defineProperty(document, "currentScript", { value: el, configurable: true });
  return el;
};

describe("public config defaults (spec.md criterion 2)", () => {
  it("theme default is light", () => {
    expect(DEFAULTS.theme).toBe("light");
    expect(readConfig(makeScript()).theme).toBe("light");
  });

  it("fabSide default is left", () => {
    expect(DEFAULTS.fabSide).toBe("left");
    expect(readConfig(makeScript()).fabSide).toBe("left");
  });
});

describe("rendered FAB defaults from the built dist (spec.md criterion 3)", () => {
  let cssText;

  beforeEach(async () => {
    document.body.innerHTML = "";
    document.getElementById(HOST_ID)?.remove();
    makeScript();
    // Reset the module registry so the IIFE bootstraps fresh against this document.
    await import(/* @vite-ignore */ `../dist/cookie.js?case=${Date.now()}`);

    const host = document.getElementById(HOST_ID);
    expect(host, "widget host element must mount into the document").toBeTruthy();
    const root = host.shadowRoot || host;
    const styleEl = Array.from(root.querySelectorAll("style")).find((s) =>
      s.textContent.includes("--blakfy-fab-")
    );
    expect(styleEl, "a style element carrying the FAB token block must be injected").toBeTruthy();
    cssText = styleEl.textContent;
  });

  afterEach(() => {
    document.getElementById(HOST_ID)?.remove();
    document.body.innerHTML = "";
  });

  it("defines --blakfy-fab-side:left", () => {
    expect(cssText).toMatch(/--blakfy-fab-side:\s*left/);
  });

  it("defines the base (>=758px) offset-x as 16px and offset-y as 116px", () => {
    expect(cssText).toMatch(/--blakfy-fab-offset-x:\s*16px/);
    expect(cssText).toMatch(/--blakfy-fab-offset-y:\s*116px/);
  });

  it("narrows offset-x to 12px below 758px while keeping offset-y at 116px, via a media query whose boundary keeps 758px wide and 757px narrow", () => {
    // spec.md line 41: x 16px at >=758px, 12px at <758px — 758px itself must still be
    // the WIDE (16px) value, so the query's max-width must be <758 (757px, 757.98px, ...),
    // never a literal "758px" (that would make 758px itself narrow, off by one).
    // Scan every @media(max-width:...) block and keep the one that actually redefines
    // --blakfy-fab-offset-x — the file has other, unrelated max-width media queries.
    const mediaMatch = [
      ...cssText.matchAll(/@media\s*\(max-width:\s*([\d.]+)px\)\s*\{([^}]*\{[^}]*\}[^}]*)\}/g),
    ].find((m) => /--blakfy-fab-offset-x/.test(m[2]));
    expect(
      mediaMatch,
      "a max-width media query redefining --blakfy-fab-offset-x must exist"
    ).toBeTruthy();
    const boundary = Number(mediaMatch[1]);
    expect(
      boundary,
      "the media query boundary must keep 758px on the wide (16px) side"
    ).toBeLessThan(758);
    expect(
      boundary,
      "the media query boundary must still make 757px the narrow (12px) side"
    ).toBeGreaterThan(756);
    const mediaBody = mediaMatch[2];
    // The rule must apply inside a shadow-root stylesheet: :root alone never matches
    // there, so the selector must include :host (directly or in a :host, :root pair).
    expect(
      mediaBody,
      "the narrowed rule must target a selector that matches inside a shadow root (:host)"
    ).toMatch(/:host/);
    expect(mediaBody).toMatch(/--blakfy-fab-offset-x:\s*12px/);
    expect(mediaBody).toMatch(/--blakfy-fab-offset-y:\s*116px/);
  });

  it("defines the FAB paint tokens: shadow, bg, color, radius, opacity", () => {
    expect(cssText).toMatch(/--blakfy-fab-shadow:\s*0 1px 3px rgba\(0,\s*0,\s*0,\s*0\.03\)/);
    expect(cssText).toMatch(/--blakfy-fab-bg:\s*#0a0a0a/);
    expect(cssText).toMatch(/--blakfy-fab-color:\s*#fff/);
    expect(cssText).toMatch(/--blakfy-fab-radius:\s*50%/);
    expect(cssText).toMatch(/--blakfy-fab-opacity:\s*1(?![\d.])/);
  });

  it("has no blue rgba(59, 130, 246 anywhere in the injected CSS", () => {
    expect(cssText).not.toMatch(/rgba\(59,\s*130,\s*246/);
  });

  it("the visible FAB rule actually consumes var(--blakfy-fab-bg) and var(--blakfy-fab-radius)", () => {
    const fabRuleMatch = cssText.match(/\.blakfy-fab[a-zA-Z:-]*::before\s*\{([^}]*)\}/);
    expect(fabRuleMatch, "a .blakfy-fab*::before rule must exist").toBeTruthy();
    const ruleBody = fabRuleMatch[1];
    expect(ruleBody).toMatch(/background:\s*var\(--blakfy-fab-bg\)/);
    expect(ruleBody).toMatch(/border-radius:\s*var\(--blakfy-fab-radius\)/);
    expect(ruleBody).toMatch(/opacity:\s*var\(--blakfy-fab-opacity\)/);
  });
});
