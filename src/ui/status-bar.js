// blakfy-cookie/src/ui/status-bar.js — central status bar from status.json (XSS-safe via textContent)

import { RTL_LOCALES } from "../i18n/detect.js";

const STATUS_COLORS = {
  info: "#1a56db",
  warning: "#b45309",
  error: "#dc2626",
  success: "#057a55",
  maintenance: "#6d28d9",
};

let statusRoot = null;
let statusData = null;

const resolveStatusMessage = (data, currentLocale, mainLang) => {
  const msgs = data && data.message;
  if (!msgs) return null;
  return msgs[currentLocale] || msgs[mainLang] || msgs["en"] || msgs[Object.keys(msgs)[0]] || null;
};

const dismissKey = (data) => "blakfy_status_" + ((data && data._id) || "default");

export const dismissStatus = () => {
  if (!statusRoot) return;
  try {
    sessionStorage.setItem(dismissKey(statusData), "1");
  } catch (e) {
    /* ignore */
  }
  if (statusRoot.parentNode) statusRoot.parentNode.removeChild(statusRoot);
  statusRoot = null;
  statusData = null;
};

export const renderStatus = ({ data, currentLocale, mainLang }) => {
  const msg = resolveStatusMessage(data, currentLocale, mainLang);
  if (!msg) return;

  try {
    if (sessionStorage.getItem(dismissKey(data)) === "1") return;
  } catch (e) {
    /* ignore */
  }

  const rtl = RTL_LOCALES.indexOf(currentLocale) > -1;
  const bg = STATUS_COLORS[data.type] || STATUS_COLORS.info;

  if (statusRoot && statusRoot.parentNode) {
    statusRoot.parentNode.removeChild(statusRoot);
  }

  const root = document.createElement("div");
  root.className = "blakfy-status";
  root.setAttribute("role", "status");
  root.setAttribute("dir", rtl ? "rtl" : "ltr");
  root.style.cssText = "background:" + bg + ";color:#fff";

  const span = document.createElement("span");
  span.className = "blakfy-status-msg";
  span.textContent = msg;
  root.appendChild(span);

  const btn = document.createElement("button");
  btn.className = "blakfy-status-dismiss";
  btn.setAttribute("aria-label", "close");
  btn.textContent = "✕";
  btn.addEventListener("click", dismissStatus);
  root.appendChild(btn);

  document.body.appendChild(root);
  statusRoot = root;
  statusData = data;
};

// #41: once-per-tab-session TTL cache, keyed by URL, so a custom data-blakfy-status-url
// per site never collides with another site's cache in the same browser. Caches BOTH a
// real "active" status and a "nothing to report"/failed result (as null) — the point is
// capping network requests, not just successful ones.
const STATUS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — #41 checklist: 60-300s TTL

const statusCacheKey = (url) => "blakfy_status_cache_" + url;

const readStatusCache = (url) => {
  try {
    const raw = sessionStorage.getItem(statusCacheKey(url));
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== "number") return undefined;
    if (Date.now() - parsed.ts > STATUS_CACHE_TTL_MS) return undefined;
    return parsed.data === undefined ? null : parsed.data;
  } catch (e) {
    return undefined;
  }
};

const writeStatusCache = (url, data) => {
  try {
    sessionStorage.setItem(statusCacheKey(url), JSON.stringify({ ts: Date.now(), data: data }));
  } catch (e) {
    /* ignore — private mode / storage disabled / quota */
  }
};

const normalizeStatus = (data) => {
  if (!data || !data.active) return null;
  if (data.expires && new Date(data.expires) < new Date()) return null;
  data._id = (data.expires || "") + (data.type || "");
  return data;
};

// #41: fixes two problems with the previous implementation —
// 1. `cache: "no-store"` + a `_=Date.now()` cache-buster meant no browser or CDN cache
//    could ever serve this, forever, on every page view of every client site. Plain
//    `fetch(url)` now lets normal HTTP caching (jsDelivr's own Cache-Control) apply.
// 2. Even with HTTP caching, a page load still spent a network round trip. The
//    sessionStorage layer above caps this to at most one request per tab per
//    STATUS_CACHE_TTL_MS, independent of whatever cache headers the endpoint sends —
//    a status banner does not need sub-minute freshness.
// A failed or slow fetch never delays or blocks anything else: this function is only
// ever called fire-and-forget from bootstrap() (see src/index.js step 17), never awaited
// on the consent path.
export const fetchStatus = (url) => {
  if (!url) return Promise.resolve(null);

  const cached = readStatusCache(url);
  if (cached !== undefined) return Promise.resolve(cached);

  return fetch(url)
    .then((r) => r.json())
    .then((data) => {
      const result = normalizeStatus(data);
      writeStatusCache(url, result);
      return result;
    })
    .catch(() => {
      // Cache the miss too — a slow/unreachable endpoint shouldn't be retried on every
      // single page view for the rest of the TTL window either.
      writeStatusCache(url, null);
      return null;
    });
};
