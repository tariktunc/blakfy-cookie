// blakfy-cookie/src/gating/iframe-unblocker.js — activates blocked iframes and installs consent placeholders

import { createPlaceholder } from "./placeholder.js";

export const unblockIframes = (category) => {
  if (typeof document === "undefined" || !category) return 0;
  const sel =
    'iframe[data-blakfy-src][data-blakfy-category="' +
    category +
    '"]:not([data-blakfy-unblocked="true"])';
  const nodes = document.querySelectorAll(sel);
  let count = 0;

  for (let i = 0; i < nodes.length; i++) {
    const ifr = nodes[i];
    const src = ifr.getAttribute("data-blakfy-src");
    if (!src) continue;

    const phId = ifr.getAttribute("data-blakfy-placeholder-id");
    if (phId) {
      const ph = document.getElementById(phId);
      if (ph && ph.parentNode) ph.parentNode.removeChild(ph);
      ifr.removeAttribute("data-blakfy-placeholder-id");
    }

    ifr.src = src;
    ifr.style.display = "";
    ifr.setAttribute("data-blakfy-unblocked", "true");
    count++;
  }

  return count;
};

export const installPlaceholders = (t, onAccept) => {
  if (typeof document === "undefined") return 0;
  const sel =
    'iframe[data-blakfy-src][data-blakfy-category][data-blakfy-placeholder="auto"]:not([data-blakfy-unblocked="true"]):not([data-blakfy-placeholder-installed="true"])';
  const nodes = document.querySelectorAll(sel);
  let count = 0;

  for (let i = 0; i < nodes.length; i++) {
    const ifr = nodes[i];
    const category = ifr.getAttribute("data-blakfy-category");
    const srcUrl = ifr.getAttribute("data-blakfy-src") || "";

    const ph = createPlaceholder({
      category: category,
      srcUrl: srcUrl,
      t: t,
      onAccept: onAccept,
    });

    const phId = "blakfy-ph-" + Math.random().toString(36).slice(2, 10);
    ph.id = phId;
    ifr.setAttribute("data-blakfy-placeholder-id", phId);
    ifr.setAttribute("data-blakfy-placeholder-installed", "true");
    ifr.style.display = "none";

    if (ifr.parentNode) {
      ifr.parentNode.insertBefore(ph, ifr);
      count++;
    }
  }

  return count;
};
