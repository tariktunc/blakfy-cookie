// blakfy-cookie/src/ui/theme-bridge.js — site theme detection + reactive observer
// Single responsibility: read host site's light/dark signal, watch for changes,
// apply resolved theme to widget cards. No styling logic here.
//
// Detection priority (deterministic, controlled):
//   1. <html class="dark"> or <html class="light">  ← WebForge canonical (Tailwind class strategy)
//   2. <body class="dark"> or <body class="light">  ← body-level fallback
//   3. <html data-theme="dark|light">                ← compatibility (DaisyUI, shadcn-style)
//   4. <html data-mode="dark|light">                 ← compatibility (legacy)
//   5. body backgroundColor luminance heuristic       ← visual fallback
//   6. prefers-color-scheme media query              ← OS-level last resort
//
// Explicit theme="light" or theme="dark" config bypasses this bridge entirely.

const DEBOUNCE_MS = 50;

const hasClass = (el, cls) => {
  return Boolean(el && el.classList && el.classList.contains(cls));
};

const luminanceFromBg = () => {
  if (!document.body) return null;
  try {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") return null;
    const m = bg.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (!m) return null;
    const r = parseInt(m[1], 10) / 255;
    const g = parseInt(m[2], 10) / 255;
    const b = parseInt(m[3], 10) / 255;
    // Relative luminance (sRGB approximation; sufficient for binary classification)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum < 0.5 ? "dark" : "light";
  } catch (e) {
    return null;
  }
};

const readDataAttr = (el, name) => {
  if (!el || !el.getAttribute) return null;
  const v = el.getAttribute(name);
  if (v === "dark" || v === "light") return v;
  return null;
};

/**
 * Detect host site theme using priority chain. Returns "light" or "dark".
 * Safe to call before document.body exists (returns "light" in that case).
 */
export const detectSiteTheme = () => {
  if (typeof document === "undefined") return "light";
  const html = document.documentElement;
  const body = document.body;

  // 1. WebForge canonical: <html class="dark|light">
  if (hasClass(html, "dark")) return "dark";
  if (hasClass(html, "light")) return "light";

  // 2. Body-level class fallback
  if (hasClass(body, "dark")) return "dark";
  if (hasClass(body, "light")) return "light";

  // 3. data-theme (compatibility)
  const dt = readDataAttr(html, "data-theme") || readDataAttr(body, "data-theme");
  if (dt) return dt;

  // 4. data-mode (legacy compatibility)
  const dm = readDataAttr(html, "data-mode") || readDataAttr(body, "data-mode");
  if (dm) return dm;

  // 5. Body bg luminance heuristic
  const lum = luminanceFromBg();
  if (lum) return lum;

  // 6. OS preference
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch (e) {
    return "light";
  }
};

/**
 * Watch for site theme changes. Calls callback(newTheme) when host site signals change.
 * Returns a disposer function to disconnect observers.
 *
 * Observes:
 *   - <html> attribute changes: class, data-theme, data-mode
 *   - <body> attribute changes: class, data-theme, data-mode
 *   - prefers-color-scheme media query (only fires if no DOM signal exists)
 *
 * Debounced 50ms to avoid jank during theme toggle.
 */
export const watchSiteTheme = (callback) => {
  if (typeof window === "undefined" || typeof MutationObserver === "undefined") {
    return () => {};
  }

  let timer = null;
  let lastTheme = detectSiteTheme();

  const debouncedCheck = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const next = detectSiteTheme();
      if (next !== lastTheme) {
        lastTheme = next;
        try {
          callback(next);
        } catch (e) {
          /* consumer error must not break the observer */
        }
      }
    }, DEBOUNCE_MS);
  };

  const observer = new MutationObserver(debouncedCheck);
  const observerOpts = {
    attributes: true,
    attributeFilter: ["class", "data-theme", "data-mode"],
  };

  try {
    observer.observe(document.documentElement, observerOpts);
  } catch (e) {
    /* ignore */
  }
  if (document.body) {
    try {
      observer.observe(document.body, observerOpts);
    } catch (e) {
      /* ignore */
    }
  }

  let mql = null;
  try {
    mql = window.matchMedia("(prefers-color-scheme: dark)");
    if (mql && mql.addEventListener) mql.addEventListener("change", debouncedCheck);
    else if (mql && mql.addListener) mql.addListener(debouncedCheck); // legacy Safari
  } catch (e) {
    mql = null;
  }

  return () => {
    try {
      observer.disconnect();
    } catch (e) {
      /* ignore */
    }
    if (timer) clearTimeout(timer);
    try {
      if (mql) {
        if (mql.removeEventListener) mql.removeEventListener("change", debouncedCheck);
        else if (mql.removeListener) mql.removeListener(debouncedCheck);
      }
    } catch (e) {
      /* ignore */
    }
  };
};

/**
 * Apply resolved theme to a widget card element (idempotent).
 * Sets/removes data-blakfy-theme="dark" — light is the default (no attribute).
 */
export const applyThemeToCard = (card, theme) => {
  if (!card || !card.setAttribute) return;
  if (theme === "dark") {
    card.setAttribute("data-blakfy-theme", "dark");
  } else if (theme === "gray") {
    card.setAttribute("data-blakfy-theme", "gray");
  } else {
    card.removeAttribute("data-blakfy-theme");
  }
};

/**
 * Normalize legacy/alias theme values. "auto" returned as-is for caller to dispatch.
 */
export const normalizeThemeValue = (raw) => {
  if (raw === "black") return "dark";
  if (raw === "white") return "light";
  return raw || "auto";
};
