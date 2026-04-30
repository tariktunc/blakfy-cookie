// blakfy-cookie/src/ui/badge.js — "Powered by Blakfy Studio" badge with 3-layer anti-tampering protection

const BADGE_HREF = "https://blakfy.com";
const BADGE_TEXT_PREFIX = "Powered by ";
const BADGE_BRAND = "Blakfy Studio";
const BADGE_CLASS = "blakfy-badge";
const PROTECT_STYLE_ID = "blakfy-badge-protect";

const PROTECT_CSS = ".blakfy-badge{display:flex !important;visibility:visible !important;opacity:0.6 !important;pointer-events:auto !important;}.blakfy-badge:hover{opacity:1 !important;}.blakfy-badge[hidden]{display:flex !important;}";

const mountedBadges = new Set();
const slotMap = new WeakMap();
let observer = null;
let intervalId = null;
let rootRef = null;

export const buildBadge = () => {
  const a = document.createElement("a");
  a.href = BADGE_HREF;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.className = BADGE_CLASS;
  a.setAttribute("aria-label", "Powered by Blakfy Studio — opens in new tab");

  const prefix = document.createTextNode(BADGE_TEXT_PREFIX);
  a.appendChild(prefix);

  const strong = document.createElement("strong");
  strong.textContent = BADGE_BRAND;
  a.appendChild(strong);

  let cssText = "display: flex !important; align-items: center; gap: 4px;"
    + "position: absolute; bottom: 8px; right: 12px;"
    + "font-size: 11px; font-family: system-ui, -apple-system, sans-serif;"
    + "color: inherit; text-decoration: none;"
    + "opacity: 0.6 !important; transition: opacity 0.2s;"
    + "pointer-events: auto !important;"
    + "z-index: 1;";
  a.style.cssText = cssText;

  return a;
};

const applyRTL = (badge) => {
  const rtlAncestor = badge.closest && badge.closest("[dir=rtl]");
  if (rtlAncestor) {
    badge.style.right = "auto";
    badge.style.left = "12px";
  }
};

const injectProtectStyle = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(PROTECT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = PROTECT_STYLE_ID;
  style.textContent = PROTECT_CSS;
  (document.head || document.documentElement).appendChild(style);
};

const replaceBadge = (oldBadge) => {
  const slot = slotMap.get(oldBadge);
  const fresh = buildBadge();
  if (oldBadge.parentNode) {
    oldBadge.parentNode.replaceChild(fresh, oldBadge);
  } else if (slot && slot.isConnected) {
    slot.appendChild(fresh);
  } else if (rootRef) {
    rootRef.appendChild(fresh);
  }
  mountedBadges.delete(oldBadge);
  mountedBadges.add(fresh);
  if (slot) slotMap.set(fresh, slot);
  applyRTL(fresh);
  return fresh;
};

const reAttachBadge = (badge) => {
  const slot = slotMap.get(badge);
  if (badge.isConnected) return badge;
  const fresh = buildBadge();
  if (slot && slot.isConnected) {
    slot.appendChild(fresh);
  } else if (rootRef) {
    rootRef.appendChild(fresh);
  } else {
    return badge;
  }
  mountedBadges.delete(badge);
  mountedBadges.add(fresh);
  if (slot) slotMap.set(fresh, slot);
  applyRTL(fresh);
  return fresh;
};

export const mountBadges = (rootEl) => {
  if (!rootEl) return [];
  rootRef = rootEl;
  const slots = rootEl.querySelectorAll(".blakfy-badge-slot");
  const result = [];
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const existing = slot.querySelector("." + BADGE_CLASS);
    if (existing) {
      mountedBadges.add(existing);
      slotMap.set(existing, slot);
      applyRTL(existing);
      result.push(existing);
      continue;
    }
    const badge = buildBadge();
    while (slot.firstChild) slot.removeChild(slot.firstChild);
    slot.appendChild(badge);
    mountedBadges.add(badge);
    slotMap.set(badge, slot);
    applyRTL(badge);
    result.push(badge);
  }
  return result;
};

const verifyBadges = () => {
  if (typeof window === "undefined" || !window.getComputedStyle) return;
  const snapshot = Array.from(mountedBadges);
  for (let i = 0; i < snapshot.length; i++) {
    const badge = snapshot[i];
    if (!badge.isConnected) {
      reAttachBadge(badge);
      continue;
    }
    const cs = window.getComputedStyle(badge);
    const opacity = parseFloat(cs.opacity);
    if (
      (isFinite(opacity) && opacity < 0.5) ||
      cs.display === "none" ||
      cs.visibility === "hidden"
    ) {
      replaceBadge(badge);
    }
  }
  if (!document.getElementById(PROTECT_STYLE_ID)) {
    injectProtectStyle();
  }
};

const handleMutations = (records) => {
  let needsStyleReinject = false;
  const removedBadges = [];
  const mutatedBadges = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (rec.type === "childList") {
      for (let j = 0; j < rec.removedNodes.length; j++) {
        const node = rec.removedNodes[j];
        if (!node || node.nodeType !== 1) continue;
        if (node.id === PROTECT_STYLE_ID) {
          needsStyleReinject = true;
        }
        if (mountedBadges.has(node)) {
          removedBadges.push(node);
        } else if (node.querySelector) {
          const inner = node.querySelector("." + BADGE_CLASS);
          if (inner && mountedBadges.has(inner)) {
            removedBadges.push(inner);
          }
        }
      }
    } else if (rec.type === "attributes") {
      const target = rec.target;
      if (target && mountedBadges.has(target)) {
        mutatedBadges.push(target);
      }
    }
  }

  if (needsStyleReinject) {
    setTimeout(injectProtectStyle, 0);
  }

  if (removedBadges.length) {
    setTimeout(() => {
      for (let i = 0; i < removedBadges.length; i++) {
        reAttachBadge(removedBadges[i]);
      }
    }, 50);
  }

  for (let i = 0; i < mutatedBadges.length; i++) {
    replaceBadge(mutatedBadges[i]);
  }
};

export const installAntiTamper = (rootEl) => {
  if (!rootEl || typeof MutationObserver === "undefined") return;
  rootRef = rootEl;

  injectProtectStyle();

  if (observer) observer.disconnect();
  observer = new MutationObserver(handleMutations);
  observer.observe(rootEl, {
    childList: true,
    attributes: true,
    subtree: true,
    attributeFilter: ["style", "class", "hidden"]
  });

  if (document.head) {
    observer.observe(document.head, { childList: true, subtree: false });
  }

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(verifyBadges, 2000);
};

export const disposeAntiTamper = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  mountedBadges.clear();
  rootRef = null;
};
