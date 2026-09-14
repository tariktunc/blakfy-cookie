// blakfy-cookie/src/ui/fab.js — reopen control (fixes #34)
//
// A small persistent button that reopens the preferences modal once a consent
// decision has been made. Withdrawal must be as easy as giving consent
// (GDPR Art. 7(3)) and the banner never returns on its own once answered —
// this is the only way back in besides a footer link a site wires up itself.
//
// Token-driven per the issue spec: every visual/placement value is a
// `--blakfy-fab-*` CSS custom property, so a site overrides only what it
// needs (see src/ui/styles.js for the defaults) instead of hardcoded values
// baked into this module.

const FAB_CLASS = "blakfy-fab";

// Fingerprint glyph — a plain, recognizable "privacy control" icon, not a
// generic gear/cookie, matching the reference (Wix/Usercentrics CMP) shape.
const FINGERPRINT_SVG =
  '<svg viewBox="0 0 24 24" width="var(--blakfy-fab-icon-size,20px)" height="var(--blakfy-fab-icon-size,20px)" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
  '<path d="M12 3a6 6 0 0 0-6 6v2c0 3.5-1 6-2 7.5"/>' +
  '<path d="M12 3a6 6 0 0 1 6 6v2c0 1.2.15 2.6.5 4"/>' +
  '<path d="M8 21c1-1.5 2-4 2-8v-1a2 2 0 1 1 4 0v3"/>' +
  '<path d="M4 15.5c.7-1.2 1-3 1-4.5V9a7 7 0 0 1 3.5-6.06"/>' +
  '<path d="M16 5.5A7 7 0 0 1 19 11v1.5c0 2.5.3 4.5 1 6"/>' +
  '<path d="M12 8a3 3 0 0 1 3 3v1c0 3 .5 5 1.5 7"/>' +
  "</svg>";

/**
 * @param {object} opts
 * @param {(text:string)=>string} [opts.ariaLabel] pre-resolved label text (already localized)
 * @param {boolean} [opts.isRTL]
 * @param {() => void} opts.onOpen
 * @returns {HTMLElement|null}
 */
export const createFab = (opts) => {
  const o = opts || {};
  if (typeof document === "undefined") return null;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = FAB_CLASS;
  btn.setAttribute("aria-label", o.ariaLabel || "Privacy settings");
  btn.setAttribute("aria-haspopup", "dialog");
  // Lets a site's own footer link/button open the same modal without
  // reaching into internals — `document.querySelector('[data-blakfy-open]')`.
  btn.setAttribute("data-blakfy-open", "");
  btn.innerHTML = FINGERPRINT_SVG;

  if (o.isRTL) btn.dir = "rtl";

  btn.addEventListener("click", () => {
    if (typeof o.onOpen === "function") o.onOpen();
  });

  return btn;
};

/**
 * Resolves data-blakfy-fab / data-blakfy-fab-* into a plain config object.
 * "off" disables the control entirely (a site wiring its own footer link).
 */
export const resolveFabConfig = (config) => {
  // Default "right" (2026-09-14) — the accessibility widget's FAB owns
  // bottom-left on every site, so this control must not default there too.
  const side = config && config.fabSide ? String(config.fabSide) : "right";
  if (side === "off") return null;
  return {
    side: side === "left" ? "left" : "right",
    offset: config && config.fabOffset != null ? config.fabOffset : null,
    size: config && config.fabSize != null ? config.fabSize : null,
    // #63b: independent width/height -> a real rectangle, not just a smaller square.
    // Also sizes the clickable box to match (see applyFabTokens) so there is no
    // invisible touch-target padding around a smaller visible shape.
    width: config && config.fabWidth != null ? config.fabWidth : null,
    height: config && config.fabHeight != null ? config.fabHeight : null,
    color: config && config.fabColor != null ? config.fabColor : null,
    // Raw CSS value (px or %), not a number -- "4px", "50%", "0" all valid.
    radius: config && config.fabRadius != null ? config.fabRadius : null,
    iconColor: config && config.fabIconColor != null ? config.fabIconColor : null,
    iconSize: config && config.fabIconSize != null ? config.fabIconSize : null,
  };
};

/** Applies the resolved fab config as inline custom properties on the button. */
export const applyFabTokens = (btn, resolved) => {
  if (!btn || !resolved) return;
  btn.classList.toggle("blakfy-fab--right", resolved.side === "right");
  btn.classList.toggle("blakfy-fab--left", resolved.side !== "right");
  if (resolved.offset != null) {
    btn.style.setProperty("--blakfy-fab-offset-x", resolved.offset + "px");
    btn.style.setProperty("--blakfy-fab-offset-y", resolved.offset + "px");
  }
  if (resolved.size != null) {
    btn.style.setProperty("--blakfy-fab-size", resolved.size + "px");
  }
  if (resolved.width != null) {
    btn.style.setProperty("--blakfy-fab-target-w", resolved.width + "px");
    btn.style.setProperty("--blakfy-fab-size-w", resolved.width + "px");
  }
  if (resolved.height != null) {
    btn.style.setProperty("--blakfy-fab-target-h", resolved.height + "px");
    btn.style.setProperty("--blakfy-fab-size-h", resolved.height + "px");
  }
  if (resolved.radius != null) {
    btn.style.setProperty("--blakfy-fab-radius", resolved.radius);
  }
  if (resolved.iconColor != null) {
    btn.style.setProperty("--blakfy-fab-color", resolved.iconColor);
  }
  if (resolved.iconSize != null) {
    const iconSize =
      typeof resolved.iconSize === "number" ? resolved.iconSize + "px" : resolved.iconSize;
    btn.style.setProperty("--blakfy-fab-icon-size", iconSize);
  }
  if (resolved.color != null) {
    btn.style.setProperty("--blakfy-fab-bg", resolved.color);
  }
};
