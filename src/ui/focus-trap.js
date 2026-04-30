// blakfy-cookie/src/ui/focus-trap.js — Tab/Shift+Tab cycling and Escape handling for any root element

const FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let activeRoot = null;
let activeHandler = null;
let activeEscape = null;

export const installFocusTrap = (rootEl, options) => {
  removeFocusTrap();
  if (!rootEl) return;
  activeRoot = rootEl;
  activeEscape = options && options.onEscape;

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
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
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
  activeRoot = null;
  activeHandler = null;
  activeEscape = null;
};
