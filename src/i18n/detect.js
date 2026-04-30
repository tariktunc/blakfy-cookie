// blakfy-cookie/src/i18n/detect.js — BCP47 locale detection and direction metadata

export const SUPPORTED_LOCALES = [
  "tr", "en", "ar", "fa", "ur",
  "fr", "ru", "de", "he", "uk",
  "es", "it", "pt", "nl", "pl", "sv", "cs",
  "zh", "zh-TW", "ja", "ko",
  "id", "hi"
];

export const RTL_LOCALES = ["ar", "he", "fa", "ur"];

export const normalizeLocale = (raw, supported) => {
  if (!raw) return null;
  const list = supported || SUPPORTED_LOCALES;
  const lo = String(raw).toLowerCase();
  for (let i = 0; i < list.length; i++) {
    if (list[i].toLowerCase() === lo) return list[i];
  }
  const prefix = lo.substring(0, 2);
  for (let j = 0; j < list.length; j++) {
    if (list[j].toLowerCase() === prefix) return list[j];
  }
  return null;
};

export const detectLocale = ({ configLocale, supported, defaultLocale }) => {
  const list = supported || SUPPORTED_LOCALES;
  const fallback = defaultLocale || "tr";
  if (configLocale && configLocale !== "auto") {
    return normalizeLocale(configLocale, list) || fallback;
  }
  try {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get("lang");
    if (qp) {
      const ql = normalizeLocale(qp, list);
      if (ql) return ql;
    }
  } catch (e) { /* ignore */ }
  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    const hl = normalizeLocale(htmlLang, list);
    if (hl) return hl;
  }
  const navLang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
  if (navLang) {
    const nl = normalizeLocale(navLang, list);
    if (nl) return nl;
  }
  return fallback;
};

export const detectMainLang = ({ configMainLang, supported, defaultLocale }) => {
  const list = supported || SUPPORTED_LOCALES;
  const fallback = defaultLocale || "tr";
  if (configMainLang) {
    const ml = normalizeLocale(configMainLang, list);
    if (ml) return ml;
  }
  const htmlLang = normalizeLocale(document.documentElement.lang, list);
  if (htmlLang) return htmlLang;
  return fallback;
};
