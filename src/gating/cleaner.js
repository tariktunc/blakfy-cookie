// blakfy-cookie/src/gating/cleaner.js — registry-driven cookie + localStorage cleanup per category

const rules = new Map();

const ensure = (category) => {
  if (!rules.has(category)) rules.set(category, []);
  return rules.get(category);
};

export const registerCleanup = ({ category, cookies, storage }) => {
  if (!category) return;
  const list = ensure(category);
  list.push({
    cookies: Array.isArray(cookies) ? cookies.slice() : [],
    storage: Array.isArray(storage) ? storage.slice() : [],
  });
};

// Not a full Public Suffix List — that's a large dependency for a widget this size
// (see #38 bundle budget). This is a short list of the multi-label ccTLD suffixes
// most likely to appear on client sites (Turkish market first per #25), so that
// e.g. "shop.example.com.tr" resolves to "example.com.tr", not "com.tr" — the
// bug that left cookies undeleted on every .com.tr domain.
const TWO_LABEL_PUBLIC_SUFFIXES = new Set([
  "com.tr",
  "org.tr",
  "net.tr",
  "gov.tr",
  "edu.tr",
  "web.tr",
  "gen.tr",
  "av.tr",
  "biz.tr",
  "info.tr",
  "name.tr",
  "tv.tr",
  "co.uk",
  "org.uk",
  "gov.uk",
  "ac.uk",
  "me.uk",
  "ltd.uk",
  "plc.uk",
  "com.au",
  "net.au",
  "org.au",
  "gov.au",
  "edu.au",
  "co.jp",
  "or.jp",
  "ne.jp",
  "ac.jp",
  "com.br",
  "com.mx",
  "com.ar",
  "com.co",
  "co.nz",
  "co.za",
  "co.in",
  "co.id",
  "co.kr",
]);

const getRootDomain = (host) => {
  if (!host) return "";
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  if (parts.length >= 3 && TWO_LABEL_PUBLIC_SUFFIXES.has(lastTwo)) {
    return parts.slice(-3).join(".");
  }
  return lastTwo;
};

const expireCookie = (name) => {
  if (typeof document === "undefined") return;
  const host = (typeof location !== "undefined" && location.hostname) || "";
  const root = getRootDomain(host);
  const past = "Thu, 01 Jan 1970 00:00:00 GMT";

  try {
    document.cookie = name + "=; expires=" + past + "; path=/";
  } catch (e) {}
  if (host) {
    try {
      document.cookie = name + "=; expires=" + past + "; path=/; domain=" + host;
    } catch (e) {}
    try {
      document.cookie = name + "=; expires=" + past + "; path=/; domain=." + host;
    } catch (e) {}
  }
  if (root && root !== host) {
    try {
      document.cookie = name + "=; expires=" + past + "; path=/; domain=" + root;
    } catch (e) {}
    try {
      document.cookie = name + "=; expires=" + past + "; path=/; domain=." + root;
    } catch (e) {}
  }
};

const readCookieNames = () => {
  if (typeof document === "undefined" || !document.cookie) return [];
  const out = [];
  const parts = document.cookie.split(";");
  for (let i = 0; i < parts.length; i++) {
    const eq = parts[i].indexOf("=");
    const name = (eq === -1 ? parts[i] : parts[i].slice(0, eq)).trim();
    if (name) out.push(name);
  }
  return out;
};

export const runCleanup = (category) => {
  const list = rules.get(category);
  if (!list || !list.length) return { cookies: 0, storage: 0 };

  const allNames = readCookieNames();
  let cookieCount = 0;
  let storageCount = 0;

  for (let i = 0; i < list.length; i++) {
    const rule = list[i];
    const cookieMatchers = rule.cookies || [];

    for (let m = 0; m < cookieMatchers.length; m++) {
      const matcher = cookieMatchers[m];
      if (matcher instanceof RegExp) {
        for (let n = 0; n < allNames.length; n++) {
          if (matcher.test(allNames[n])) {
            expireCookie(allNames[n]);
            cookieCount++;
          }
        }
      } else if (typeof matcher === "string") {
        expireCookie(matcher);
        cookieCount++;
      }
    }

    const storageKeys = rule.storage || [];
    for (let k = 0; k < storageKeys.length; k++) {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(storageKeys[k]);
          storageCount++;
        }
      } catch (e) {
        /* ignore */
      }
    }
  }

  return { cookies: cookieCount, storage: storageCount };
};

export const clearAllRules = () => {
  rules.clear();
};

// #25: a site installed with no data-blakfy-presets has zero cleanup rules —
// silently correct if the site truly has no third-party tags, but a host platform
// (Wix, Shopify, ...) commonly injects its own GA4/Pixel cookies at runtime, absent
// from the served HTML the integrator checked. Warn when a known preset's cookie
// pattern is present on the page but no rule for its category was ever registered,
// so "no presets" reads as a deliberate choice rather than an unnoticed gap.
export const warnUnregisteredCookies = (presets) => {
  if (!presets || typeof console === "undefined" || typeof console.warn !== "function") return [];
  const allNames = readCookieNames();
  if (!allNames.length) return [];

  const found = [];
  const presetKeys = Object.keys(presets);
  for (let p = 0; p < presetKeys.length; p++) {
    const preset = presets[presetKeys[p]];
    if (!preset || rules.has(preset.category)) continue;
    const matchers = preset.cookies || [];
    for (let m = 0; m < matchers.length; m++) {
      const matcher = matchers[m];
      for (let n = 0; n < allNames.length; n++) {
        const isMatch =
          matcher instanceof RegExp ? matcher.test(allNames[n]) : matcher === allNames[n];
        if (!isMatch) continue;
        found.push({ preset: presetKeys[p], name: preset.name, cookie: allNames[n] });
      }
    }
  }

  for (let i = 0; i < found.length; i++) {
    console.warn(
      "[Blakfy Cookie] Cookie '" +
        found[i].cookie +
        "' matches " +
        found[i].name +
        " but no data-blakfy-presets entry registers a cleanup rule for it. " +
        "This cookie will NOT be deleted on reject/withdrawal. Add '" +
        found[i].preset +
        "' to data-blakfy-presets, or confirm this is expected."
    );
  }

  return found;
};
