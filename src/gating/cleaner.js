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
    storage: Array.isArray(storage) ? storage.slice() : []
  });
};

const getRootDomain = (host) => {
  if (!host) return "";
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  return parts.slice(-2).join(".");
};

const expireCookie = (name) => {
  if (typeof document === "undefined") return;
  const host = (typeof location !== "undefined" && location.hostname) || "";
  const root = getRootDomain(host);
  const past = "Thu, 01 Jan 1970 00:00:00 GMT";

  try { document.cookie = name + "=; expires=" + past + "; path=/"; } catch (e) {}
  if (host) {
    try { document.cookie = name + "=; expires=" + past + "; path=/; domain=" + host; } catch (e) {}
    try { document.cookie = name + "=; expires=" + past + "; path=/; domain=." + host; } catch (e) {}
  }
  if (root && root !== host) {
    try { document.cookie = name + "=; expires=" + past + "; path=/; domain=" + root; } catch (e) {}
    try { document.cookie = name + "=; expires=" + past + "; path=/; domain=." + root; } catch (e) {}
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
      } catch (e) { /* ignore */ }
    }
  }

  return { cookies: cookieCount, storage: storageCount };
};

export const clearAllRules = () => {
  rules.clear();
};
