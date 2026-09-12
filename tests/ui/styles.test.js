// blakfy-cookie/tests/ui/styles.test.js — regression coverage for #23
// Light theme is the DEFAULT (base) state of .blakfy-card, with no
// [data-blakfy-theme=light] attribute block — dark/gray are explicit overrides.
// This test locks that contract in the injected stylesheet so it cannot silently
// regress back to "no light rules at all" (the original #23 report).

import { describe, it, expect, beforeEach } from "vitest";

import { injectStyles } from "../../src/ui/styles.js";

const STYLE_ID = "blakfy-cookie-styles";

const getInjectedCss = () => {
  const el = document.getElementById(STYLE_ID);
  return el ? el.textContent : "";
};

describe("injectStyles — light theme CSS (#23)", () => {
  beforeEach(() => {
    document.getElementById(STYLE_ID)?.remove();
  });

  it("injects a stylesheet with an id", () => {
    injectStyles();
    expect(document.getElementById(STYLE_ID)).not.toBeNull();
  });

  it("is idempotent (does not duplicate on repeat calls)", () => {
    injectStyles();
    injectStyles();
    expect(document.querySelectorAll(`#${STYLE_ID}`).length).toBe(1);
  });

  it("defines a light background/text on the base .blakfy-card rule (unscoped by data-blakfy-theme)", () => {
    injectStyles();
    const css = getInjectedCss();
    const baseRule = css.match(/(?:^|\})(\.blakfy-card\{[^}]*\})/);
    expect(baseRule).not.toBeNull();
    expect(baseRule[1]).toMatch(/background:#fff/);
    expect(baseRule[1]).toMatch(/color:#222/);
  });

  it("does NOT gate the base card rule behind [data-blakfy-theme=light]", () => {
    injectStyles();
    const css = getInjectedCss();
    expect(css).not.toMatch(/\[data-blakfy-theme=light\]/);
  });

  it("still ships explicit dark and gray theme overrides", () => {
    injectStyles();
    const css = getInjectedCss();
    expect(css).toMatch(/\[data-blakfy-theme=dark\]\{background:#1a1a1a/);
    expect(css).toMatch(/\[data-blakfy-theme=gray\]\{background:#f0f0f0/);
  });
});
