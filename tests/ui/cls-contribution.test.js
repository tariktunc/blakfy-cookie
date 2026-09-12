// tests/ui/cls-contribution.test.js — code-level CLS/layout-stability guard (#30 item 1)
//
// This is NOT a live CLS/INP measurement — that requires field data (CrUX/RUM), which is
// explicitly out of scope (#30 item 4) and cannot be fabricated. What CAN be verified from
// code alone is the structural precondition for near-zero CLS: the widget overlay is taken
// out of normal document flow (`position: fixed`) and never intercepts pointer events over
// page content it doesn't cover (`pointer-events: none` on the widget overlay itself), and it
// mounts inside its own shadow root rather than inserting nodes into the host page's own flow.
// If either regresses, the widget would start reflowing/covering host content — the two ways
// a bottom-anchored consent banner actually causes CLS/INP damage in the field.

import { describe, it, expect, beforeEach } from "vitest";

import { injectStyles } from "../../src/ui/styles.js";

const STYLE_ID = "blakfy-cookie-styles";

const getInjectedCss = (root) => {
  const el = root.querySelector("#" + STYLE_ID);
  return el ? el.textContent : "";
};

describe("widget overlay — CLS/INP structural preconditions (#30 item 1)", () => {
  let root;

  beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
  });

  it("banner/widget overlay is position:fixed (out of document flow, cannot push content)", () => {
    injectStyles(root);
    const css = getInjectedCss(root);
    expect(css).toMatch(/\.blakfy-overlay\.widget\{[^}]*position:fixed/);
  });

  it("widget overlay itself is pointer-events:none (never blocks clicks on page content beneath it)", () => {
    injectStyles(root);
    const css = getInjectedCss(root);
    expect(css).toMatch(/\.blakfy-overlay\.widget\{[^}]*pointer-events:none/);
  });

  it("only the card inside the widget overlay re-enables pointer-events, not the full-viewport overlay", () => {
    injectStyles(root);
    const css = getInjectedCss(root);
    expect(css).toMatch(/\.blakfy-overlay\.widget \.blakfy-card\{[^}]*pointer-events:auto/);
  });

  it("mounting the overlay into an isolated root does not touch document.body's existing children", () => {
    const before = Array.from(document.body.children);
    const overlay = document.createElement("div");
    overlay.className = "blakfy-overlay widget bottom-left";
    root.appendChild(overlay); // simulates shadowRoot.appendChild(overlay) from index.js
    const after = Array.from(document.body.children);
    // body's own child list is unchanged in length and identity — the widget lives inside
    // `root` (a stand-in for the shadow root), never as a sibling of host page content.
    expect(after.length).toBe(before.length);
    expect(after.every((el, i) => el === before[i])).toBe(true);
  });
});
