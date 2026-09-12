// blakfy-cookie/src/ui/focus-trap.js — Tab/Shift+Tab cycling, Escape handling, and (opt-in)
// background inert + body scroll lock + opener focus-return for a modal root element.
//
// #27: the preferences modal is a true APG "dialog" — background content must become
// inert and non-scrollable while it is open, and focus must return to the element that
// opened it on close. The first-visit banner is NOT modal (page content stays reachable,
// see banner.js aria-modal note) so it opts out of trapBackground/lockScroll.

const FOCUSABLE =
  'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let activeRoot = null;
let activeHandler = null;
let activeEscape = null;
let restoreFocusTarget = null;
let inertedNodes = [];
let scrollLockApplied = false;
let prevBodyOverflow = "";
let prevScrollY = 0;

const supportsInert = () =>
  typeof document !== "undefined" && "inert" in document.createElement("div");

// #35: with the widget mounted in a shadow root, `document.activeElement` only ever
// resolves to the SHADOW HOST (per spec, a light-DOM `document.activeElement` read
// does not pierce an open shadow boundary) — never the actual focused node inside.
// Walk down through nested open shadow roots to find the real focused element.
export const getDeepActiveElement = () => {
  if (typeof document === "undefined") return null;
  let el = document.activeElement;
  while (el && el.shadowRoot && el.shadowRoot.activeElement) {
    el = el.shadowRoot.activeElement;
  }
  return el;
};

const applyBackgroundInert = (skipEl) => {
  if (typeof document === "undefined" || !document.body) return;
  const useInert = supportsInert();
  const children = document.body.children;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    // skipEl may live inside a shadow root (e.g. the #blakfy-cookie-root host) —
    // Node.contains() does not pierce shadow boundaries, so a direct identity
    // check against the (light-DOM) skip element is what actually matters here;
    // callers pass the shadow HOST, not the overlay inside it, for this reason.
    if (node === skipEl || (skipEl && node.contains && node.contains(skipEl))) continue;
    if (useInert) {
      inertedNodes.push({ node: node, hadInert: node.hasAttribute("inert") });
      node.setAttribute("inert", "");
    } else {
      // Fallback for browsers without native `inert`: pull background content out of
      // the tab order and hide it from assistive tech while the modal is open.
      inertedNodes.push({
        node: node,
        hadTabindex: node.hasAttribute("tabindex"),
        prevTabindex: node.getAttribute("tabindex"),
        hadAriaHidden: node.hasAttribute("aria-hidden"),
      });
      node.setAttribute("tabindex", "-1");
      node.setAttribute("aria-hidden", "true");
    }
  }
};

const removeBackgroundInert = () => {
  const useInert = supportsInert();
  for (let i = 0; i < inertedNodes.length; i++) {
    const entry = inertedNodes[i];
    if (useInert) {
      if (!entry.hadInert) entry.node.removeAttribute("inert");
    } else {
      if (entry.hadTabindex) entry.node.setAttribute("tabindex", entry.prevTabindex);
      else entry.node.removeAttribute("tabindex");
      if (!entry.hadAriaHidden) entry.node.removeAttribute("aria-hidden");
    }
  }
  inertedNodes = [];
};

const lockBodyScroll = () => {
  if (typeof document === "undefined" || !document.body) return;
  scrollLockApplied = true;
  prevScrollY = (typeof window !== "undefined" && (window.scrollY || window.pageYOffset)) || 0;
  prevBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
};

const unlockBodyScroll = () => {
  if (!scrollLockApplied || typeof document === "undefined" || !document.body) return;
  document.body.style.overflow = prevBodyOverflow;
  scrollLockApplied = false;
  if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
    try {
      window.scrollTo(0, prevScrollY);
    } catch (e) {
      /* some test/embed environments (jsdom) don't implement scrollTo */
    }
  }
};

export const installFocusTrap = (rootEl, options) => {
  const opts = options || {};
  // Capture the opener BEFORE tearing down any previous trap — removeFocusTrap()
  // below moves focus back to ITS OWN restoreFocusTarget, which would otherwise
  // clobber this one when one trap replaces another (e.g. banner → preferences modal).
  const opener =
    opts.returnFocus === false || typeof document === "undefined" ? null : getDeepActiveElement();

  removeFocusTrap();
  if (!rootEl) return;
  activeRoot = rootEl;
  activeEscape = opts.onEscape;
  restoreFocusTarget = opener;

  if (opts.trapBackground) {
    // #35: pass inertSkipEl explicitly when the trapped root lives inside a shadow
    // root — the light-DOM body child to leave interactive is the shadow HOST
    // element, not rootEl's own (shadow-internal) parentNode.
    const overlayRoot = opts.inertSkipEl || rootEl.parentNode || rootEl;
    applyBackgroundInert(overlayRoot);
  }
  if (opts.lockScroll) lockBodyScroll();

  activeHandler = (e) => {
    if (!activeRoot) return;
    if (e.key === "Escape") {
      if (typeof activeEscape === "function") {
        e.preventDefault();
        activeEscape();
      }
      return;
    }
    if (e.key !== "Tab") return;
    const nodes = activeRoot.querySelectorAll(FOCUSABLE);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const current = getDeepActiveElement();
    if (e.shiftKey && current === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  };

  document.addEventListener("keydown", activeHandler);

  const firstFocusable = rootEl.querySelector(FOCUSABLE);
  if (firstFocusable) firstFocusable.focus();
};

export const removeFocusTrap = () => {
  if (activeHandler) {
    document.removeEventListener("keydown", activeHandler);
  }
  removeBackgroundInert();
  unlockBodyScroll();
  // #35: restoreFocusTarget can live inside a shadow root (e.g. the banner's
  // "Preferences" button, when the modal that opened on top of it closes) —
  // document.body.contains() does not pierce shadow boundaries and would always
  // report false there. isConnected reports true for any node attached anywhere
  // in the document, shadow tree included, which is the actual check intended.
  if (
    restoreFocusTarget &&
    typeof restoreFocusTarget.focus === "function" &&
    restoreFocusTarget.isConnected
  ) {
    restoreFocusTarget.focus();
  }
  restoreFocusTarget = null;
  activeRoot = null;
  activeHandler = null;
  activeEscape = null;
};
