// blakfy-cookie/src/i18n/index.js — locale registry with code-split remote translations (#38)
//
// Only the two most common locales for Blakfy sites (tr, en) are bundled into the main
// entry. The other 21 languages ship as separate dist/i18n/{locale}.min.js chunks, built
// by scripts/build.js, and are fetched on demand via a <script> tag sibling to the main
// bundle's own <script src>. This keeps every site's actual download small: most sites
// only ever need tr/en and never pay for the other 21 languages.
//
// Loaded chunks are cached on window.__blakfyI18n so a page with more than one widget
// instance, or a locale switch back and forth, only fetches each language once.

import en from "./translations/en.js";
import tr from "./translations/tr.js";

export const DEFAULT_LOCALE = "tr";

// Bundled inline — always available synchronously, no network needed.
export const TRANSLATIONS = { tr, en };

// Shipped as separate chunks under dist/i18n/. Keep this list in sync with
// src/i18n/translations/*.js minus the two bundled locales above.
export const REMOTE_LOCALES = [
  "ar",
  "cs",
  "de",
  "es",
  "fa",
  "fr",
  "he",
  "hi",
  "id",
  "it",
  "ja",
  "ko",
  "nl",
  "pl",
  "pt",
  "ru",
  "sv",
  "uk",
  "ur",
  "zh",
  "zh-TW",
];

export const isRemoteLocale = (locale) => REMOTE_LOCALES.indexOf(locale) > -1;

const remoteCache = () => {
  if (typeof window === "undefined") return null;
  window.__blakfyI18n = window.__blakfyI18n || {};
  return window.__blakfyI18n;
};

// Synchronous lookup only — bundled locales + whatever remote chunk already loaded.
// Never triggers a network request. Falls back to DEFAULT_LOCALE, matching the old
// (pre-#38) getTranslation contract so every existing caller keeps working unchanged.
export const getTranslation = (locale) => {
  if (TRANSLATIONS[locale]) return TRANSLATIONS[locale];
  const cache = remoteCache();
  if (cache && cache[locale]) return cache[locale];
  return TRANSLATIONS[DEFAULT_LOCALE];
};

const inflight = new Map();

// Async — the only path that may fetch a remote chunk. `baseHref` is the currently
// running <script>'s src (see core/config.js getScriptEl); chunks are resolved as
// siblings of it: ".../i18n/{locale}.min.js". Resolves to a translation object;
// never rejects — any failure (no baseHref, network error, timeout) resolves to the
// DEFAULT_LOCALE translation so the widget always has usable text.
export const loadTranslation = (locale, baseHref) => {
  if (TRANSLATIONS[locale]) return Promise.resolve(TRANSLATIONS[locale]);
  const cache = remoteCache();
  if (cache && cache[locale]) return Promise.resolve(cache[locale]);
  if (!isRemoteLocale(locale) || !baseHref || typeof document === "undefined") {
    return Promise.resolve(TRANSLATIONS[DEFAULT_LOCALE]);
  }
  if (inflight.has(locale)) return inflight.get(locale);

  const p = new Promise((resolvePromise) => {
    const base = baseHref.replace(/\/[^/]*$/, "/");
    const script = document.createElement("script");
    script.src = base + "i18n/" + locale + ".min.js";
    script.async = true;
    const finish = () => {
      const loaded = remoteCache();
      resolvePromise((loaded && loaded[locale]) || TRANSLATIONS[DEFAULT_LOCALE]);
    };
    script.onload = finish;
    script.onerror = finish;
    document.head.appendChild(script);
  }).finally(() => inflight.delete(locale));

  inflight.set(locale, p);
  return p;
};
