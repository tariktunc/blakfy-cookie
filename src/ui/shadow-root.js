// blakfy-cookie/src/ui/shadow-root.js — single shadow-root mount point for the widget (#35)
//
// One host element (`#blakfy-cookie-root`) is created once and attached to
// document.body. Banner, modal, reopen FAB and their injected stylesheets all
// live inside its shadow root so host-page CSS cannot reach in (or leak out).
//
// Fallback: browsers without Element.prototype.attachShadow (effectively none
// still in field use) get the host element itself as the "root" — no Shadow
// DOM isolation, but everything keeps working structurally.

const HOST_ID = "blakfy-cookie-root";

let hostEl = null;
let root = null;
let usingShadow = false;

const ensureHost = () => {
  if (typeof document === "undefined") return null;
  if (hostEl && hostEl.isConnected) return hostEl;
  hostEl = document.getElementById(HOST_ID);
  if (!hostEl) {
    hostEl = document.createElement("div");
    hostEl.id = HOST_ID;
    // The host itself must not participate in host-page layout/flow — every
    // widget surface mounted inside is already position:fixed.
    hostEl.style.all = "initial";
    hostEl.style.display = "block";
    (document.body || document.documentElement).appendChild(hostEl);
  }
  return hostEl;
};

/**
 * Returns the mount root (a ShadowRoot, or the host element itself as a
 * fallback on browsers without Shadow DOM support). Idempotent — the same
 * root is returned on every call within a page's lifetime.
 */
export const getShadowRoot = () => {
  if (root) return root;
  const host = ensureHost();
  if (!host) return null;
  if (host.shadowRoot) {
    root = host.shadowRoot;
    usingShadow = true;
    return root;
  }
  if (typeof host.attachShadow === "function") {
    try {
      root = host.attachShadow({ mode: "open" });
      usingShadow = true;
      return root;
    } catch (e) {
      /* fall through to non-shadow fallback below */
    }
  }
  root = host; // no Shadow DOM support — CSS-reset fallback territory (#35 accepted risk)
  usingShadow = false;
  return root;
};

export const getShadowHost = () => hostEl;

export const isShadowDomActive = () => usingShadow;

// Test-only reset (avoids cross-test leakage of the module-level singleton).
export const __resetShadowRootForTests = () => {
  if (hostEl && hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
  hostEl = null;
  root = null;
  usingShadow = false;
};
