// blakfy-cookie/src/gating/script-unblocker.js — activates blocked <script type="text/plain"> tags by category

const SKIP_ATTRS = { type: 1 };

const isSkippedAttr = (name) => {
  if (SKIP_ATTRS[name]) return true;
  if (name.indexOf("data-blakfy-") === 0) return true;
  return false;
};

export const unblockScripts = (category) => {
  if (typeof document === "undefined" || !category) return 0;
  const sel =
    'script[type="text/plain"][data-blakfy-category="' +
    category +
    '"]:not([data-blakfy-unblocked="true"])';
  const nodes = document.querySelectorAll(sel);
  let count = 0;

  for (let i = 0; i < nodes.length; i++) {
    const orig = nodes[i];
    const fresh = document.createElement("script");

    const attrs = orig.attributes;
    for (let j = 0; j < attrs.length; j++) {
      const a = attrs[j];
      if (isSkippedAttr(a.name)) continue;
      try {
        fresh.setAttribute(a.name, a.value);
      } catch (e) {
        /* ignore */
      }
    }

    const blakfySrc = orig.getAttribute("data-blakfy-src");
    if (blakfySrc) {
      fresh.src = blakfySrc;
    } else {
      fresh.text = orig.textContent || "";
    }

    orig.setAttribute("data-blakfy-unblocked", "true");

    if (orig.parentNode) {
      orig.parentNode.replaceChild(fresh, orig);
      count++;
    }
  }

  return count;
};
