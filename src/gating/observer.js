// blakfy-cookie/src/gating/observer.js — MutationObserver that unblocks new tagged scripts/iframes when consent allows

let activeObserver = null;

const isBlockedScript = (node) => {
  return node && node.nodeType === 1 && node.tagName === "SCRIPT"
    && node.getAttribute && node.getAttribute("type") === "text/plain"
    && node.getAttribute("data-blakfy-category");
};

const isBlockedIframe = (node) => {
  return node && node.nodeType === 1 && node.tagName === "IFRAME"
    && node.getAttribute && node.getAttribute("data-blakfy-src")
    && node.getAttribute("data-blakfy-category");
};

const collectCategoriesFromNode = (node, set) => {
  if (!node || node.nodeType !== 1) return;
  if (isBlockedScript(node) || isBlockedIframe(node)) {
    set[node.getAttribute("data-blakfy-category")] = 1;
  }
  if (node.querySelectorAll) {
    const inner = node.querySelectorAll('script[type="text/plain"][data-blakfy-category], iframe[data-blakfy-src][data-blakfy-category]');
    for (let i = 0; i < inner.length; i++) {
      set[inner[i].getAttribute("data-blakfy-category")] = 1;
    }
  }
};

export const startObserver = ({ getConsent, onScan }) => {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return null;
  if (activeObserver) stopObserver();

  const obs = new MutationObserver((mutations) => {
    const seen = Object.create(null);
    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i];
      if (m.type !== "childList") continue;
      const added = m.addedNodes;
      for (let j = 0; j < added.length; j++) {
        collectCategoriesFromNode(added[j], seen);
      }
    }
    for (const cat in seen) {
      if (typeof getConsent === "function" && getConsent(cat)) {
        if (typeof onScan === "function") {
          try { onScan(cat); } catch (e) { /* swallow */ }
        }
      }
    }
  });

  obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
  activeObserver = obs;
  return obs;
};

export const stopObserver = () => {
  if (activeObserver) {
    try { activeObserver.disconnect(); } catch (e) { /* ignore */ }
    activeObserver = null;
  }
};

export const scanAll = ({ getConsent, categories }) => {
  if (typeof document === "undefined") return [];
  const list = Array.isArray(categories) && categories.length
    ? categories
    : ["essential", "analytics", "marketing", "functional", "recording"];
  const granted = [];
  for (let i = 0; i < list.length; i++) {
    const cat = list[i];
    if (typeof getConsent === "function" && getConsent(cat)) {
      granted.push(cat);
    }
  }
  return granted;
};
