/*!
 * Blakfy Cookie Widget v2.0.0
 * https://github.com/tariktunc/blakfy-cookie
 * MIT License | (c) Blakfy Studio
 *
 * KVKK + GDPR + CCPA + Google CMv2 + Microsoft UET + Yandex + TCF v2.2 + GPC + DNT
 * 23 languages | 18 presets | Tag-gating | Powered by Blakfy Studio
 */
(() => {
  // src/core/config.js
  var CDN_BASE = "https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@v2";
  var DEFAULTS = {
    locale: "auto",
    mainLang: null,
    policyUrl: "/cerez-politikasi",
    policyVersion: "1.0",
    auditEndpoint: null,
    position: "bottom-center",
    theme: "auto",
    accent: "#3E5C3A",
    presets: null,
    tcf: "false",
    cmpId: "0",
    ccpa: "auto",
    gpc: "respect",
    dnt: "respect",
    statusUrl: CDN_BASE + "/status.json",
    statusEnabled: true
  };
  var getScriptEl = () => {
    if (document.currentScript) return document.currentScript;
    const all = document.getElementsByTagName("script");
    return all[all.length - 1] || null;
  };
  var readConfig = (scriptEl) => {
    const el = scriptEl || getScriptEl();
    const attr = (name, fallback) => {
      if (!el) return fallback;
      const v = el.getAttribute(name);
      return v == null ? fallback : v;
    };
    return {
      locale: attr("data-blakfy-locale", DEFAULTS.locale),
      mainLang: attr("data-blakfy-main-lang", DEFAULTS.mainLang),
      policyUrl: attr("data-blakfy-policy-url", DEFAULTS.policyUrl),
      policyVersion: attr("data-blakfy-version", DEFAULTS.policyVersion),
      auditEndpoint: attr("data-blakfy-audit-endpoint", DEFAULTS.auditEndpoint),
      position: attr("data-blakfy-position", DEFAULTS.position),
      theme: attr("data-blakfy-theme", DEFAULTS.theme),
      accent: attr("data-blakfy-accent", DEFAULTS.accent),
      presets: attr("data-blakfy-presets", DEFAULTS.presets),
      tcf: attr("data-blakfy-tcf", DEFAULTS.tcf),
      cmpId: attr("data-blakfy-cmp-id", DEFAULTS.cmpId),
      ccpa: attr("data-blakfy-ccpa", DEFAULTS.ccpa),
      gpc: attr("data-blakfy-gpc", DEFAULTS.gpc),
      dnt: attr("data-blakfy-dnt", DEFAULTS.dnt),
      statusUrl: attr("data-blakfy-status-url", DEFAULTS.statusUrl),
      statusEnabled: attr("data-blakfy-status", "true") !== "false"
    };
  };

  // src/core/consent-store.js
  var COOKIE_NAME = "blakfy_consent";
  var COOKIE_TTL_DAYS = 365;
  var readCookie = (policyVersion) => {
    const match = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));
    if (!match) return null;
    try {
      const s = JSON.parse(decodeURIComponent(match[2]));
      if (s.version !== policyVersion) return null;
      return s;
    } catch (e) {
      return null;
    }
  };
  var writeCookie = (state) => {
    const expires = new Date(Date.now() + COOKIE_TTL_DAYS * 864e5).toUTCString();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(JSON.stringify(state)) + "; expires=" + expires + "; path=/; SameSite=Strict" + secure;
  };
  var newId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  };
  var buildState = ({
    prefs,
    currentLocale,
    mainLang,
    policyVersion,
    jurisdiction,
    tcString,
    uspString,
    prevId
  }) => ({
    id: prevId || newId(),
    essential: true,
    analytics: !!(prefs && prefs.analytics),
    marketing: !!(prefs && prefs.marketing),
    functional: !!(prefs && prefs.functional),
    recording: !!(prefs && prefs.recording),
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: policyVersion,
    locale: currentLocale,
    mainLang,
    jurisdiction: jurisdiction || "default",
    tcString: tcString || null,
    uspString: uspString || null
  });

  // src/core/events.js
  var createEmitter = () => {
    const listeners2 = /* @__PURE__ */ Object.create(null);
    const on = (event, fn) => {
      if (typeof fn !== "function") return;
      if (!listeners2[event]) listeners2[event] = [];
      listeners2[event].push(fn);
    };
    const off = (event, fn) => {
      const arr = listeners2[event];
      if (!arr) return;
      const i = arr.indexOf(fn);
      if (i > -1) arr.splice(i, 1);
    };
    const emit = (event, ...args) => {
      const arr = listeners2[event];
      if (!arr) return;
      for (let i = 0; i < arr.length; i++) {
        try {
          arr[i].apply(null, args);
        } catch (e) {
        }
      }
    };
    return { on, off, emit };
  };

  // src/i18n/detect.js
  var SUPPORTED_LOCALES = [
    "tr",
    "en",
    "ar",
    "fa",
    "ur",
    "fr",
    "ru",
    "de",
    "he",
    "uk",
    "es",
    "it",
    "pt",
    "nl",
    "pl",
    "sv",
    "cs",
    "zh",
    "zh-TW",
    "ja",
    "ko",
    "id",
    "hi"
  ];
  var RTL_LOCALES = ["ar", "he", "fa", "ur"];
  var normalizeLocale = (raw, supported) => {
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
  var detectLocale = ({ configLocale, supported, defaultLocale }) => {
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
    } catch (e) {
    }
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const hl = normalizeLocale(htmlLang, list);
      if (hl) return hl;
    }
    const navLang = navigator.language || navigator.languages && navigator.languages[0] || "";
    if (navLang) {
      const nl = normalizeLocale(navLang, list);
      if (nl) return nl;
    }
    return fallback;
  };
  var detectMainLang = ({ configMainLang, supported, defaultLocale }) => {
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

  // src/i18n/translations/tr.js
  var tr_default = {
    title: "\xC7erez Tercihleri",
    intro: "Bu site, deneyiminizi geli\u015Ftirmek i\xE7in \xE7erezler kullan\u0131r. Detaylar i\xE7in \xC7erez Politikam\u0131z\u0131 inceleyin.",
    policyLink: "\xC7erez Politikas\u0131",
    acceptAll: "T\xFCm\xFCn\xFC Kabul Et",
    rejectAll: "T\xFCm\xFCn\xFC Reddet",
    preferences: "Tercihler",
    save: "Se\xE7imleri Kaydet",
    close: "Kapat",
    cat: {
      essential: { title: "Zorunlu \xC7erezler", desc: "Sitenin temel i\u015Flevleri i\xE7in gerekli, devre d\u0131\u015F\u0131 b\u0131rak\u0131lamaz.", always: "Her zaman aktif" },
      analytics: { title: "Analitik \xC7erezler", desc: "Anonim ziyaret istatistikleri toplama amac\u0131yla kullan\u0131l\u0131r." },
      marketing: { title: "Pazarlama \xC7erezleri", desc: "Ki\u015Fiselle\u015Ftirilmi\u015F reklam ve yeniden hedefleme i\xE7in kullan\u0131l\u0131r." },
      functional: { title: "Fonksiyonel \xC7erezler", desc: "Dil, tema, b\xF6lge gibi tercihlerinizi hat\u0131rlamak i\xE7in kullan\u0131l\u0131r." }
    },
    placeholder: {
      title: "\u0130\xE7erik engellendi",
      desc: "Bu i\xE7eri\u011Fi g\xF6rmek i\xE7in {category} \xE7erezlerine izin vermeniz gerekiyor.",
      cta: "\u0130zin ver"
    }
  };

  // src/i18n/translations/en.js
  var en_default = {
    title: "Cookie Preferences",
    intro: "This site uses cookies to enhance your experience. See our Cookie Policy for details.",
    policyLink: "Cookie Policy",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    preferences: "Preferences",
    save: "Save Choices",
    close: "Close",
    cat: {
      essential: { title: "Essential Cookies", desc: "Required for the site to function. Cannot be disabled.", always: "Always active" },
      analytics: { title: "Analytics Cookies", desc: "Used to collect anonymous visit statistics." },
      marketing: { title: "Marketing Cookies", desc: "Used for personalized advertising and retargeting." },
      functional: { title: "Functional Cookies", desc: "Used to remember preferences like language, theme, region." }
    },
    placeholder: {
      title: "Content blocked",
      desc: "You need to allow {category} cookies to view this content.",
      cta: "Allow"
    }
  };

  // src/i18n/translations/ar.js
  var ar_default = {
    title: "\u062A\u0641\u0636\u064A\u0644\u0627\u062A \u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637",
    intro: "\u064A\u0633\u062A\u062E\u062F\u0645 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637 \u0644\u062A\u062D\u0633\u064A\u0646 \u062A\u062C\u0631\u0628\u062A\u0643. \u0631\u0627\u062C\u0639 \u0633\u064A\u0627\u0633\u0629 \u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644.",
    policyLink: "\u0633\u064A\u0627\u0633\u0629 \u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637",
    acceptAll: "\u0642\u0628\u0648\u0644 \u0627\u0644\u0643\u0644",
    rejectAll: "\u0631\u0641\u0636 \u0627\u0644\u0643\u0644",
    preferences: "\u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A",
    save: "\u062D\u0641\u0638 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A",
    close: "\u0625\u063A\u0644\u0627\u0642",
    cat: {
      essential: { title: "\u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629", desc: "\u0636\u0631\u0648\u0631\u064A\u0629 \u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0648\u0642\u0639. \u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0639\u0637\u064A\u0644\u0647\u0627.", always: "\u0646\u0634\u0637 \u062F\u0627\u0626\u0645\u064B\u0627" },
      analytics: { title: "\u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637 \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u064A\u0629", desc: "\u062A\u064F\u0633\u062A\u062E\u062F\u0645 \u0644\u062C\u0645\u0639 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062C\u0647\u0648\u0644\u0629." },
      marketing: { title: "\u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637 \u0627\u0644\u062A\u0633\u0648\u064A\u0642\u064A\u0629", desc: "\u062A\u064F\u0633\u062A\u062E\u062F\u0645 \u0644\u0644\u0625\u0639\u0644\u0627\u0646 \u0627\u0644\u0645\u062E\u0635\u0635 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0627\u0633\u062A\u0647\u062F\u0627\u0641." },
      functional: { title: "\u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637 \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629", desc: "\u062A\u064F\u0633\u062A\u062E\u062F\u0645 \u0644\u062A\u0630\u0643\u0631 \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A \u0645\u062B\u0644 \u0627\u0644\u0644\u063A\u0629 \u0648\u0627\u0644\u0633\u0645\u0629." }
    },
    placeholder: {
      title: "\u062A\u0645 \u062D\u0638\u0631 \u0627\u0644\u0645\u062D\u062A\u0648\u0649",
      desc: "\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0627\u0644\u0633\u0645\u0627\u062D \u0628\u0645\u0644\u0641\u0627\u062A \u062A\u0639\u0631\u064A\u0641 \u0627\u0644\u0627\u0631\u062A\u0628\u0627\u0637 \u0644\u0640 {category} \u0644\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0645\u062D\u062A\u0648\u0649.",
      cta: "\u0627\u0644\u0633\u0645\u0627\u062D"
    }
  };

  // src/i18n/translations/fa.js
  var fa_default = {
    title: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u06A9\u0648\u06A9\u06CC",
    intro: "\u0627\u06CC\u0646 \u0633\u0627\u06CC\u062A \u0627\u0632 \u06A9\u0648\u06A9\u06CC\u200C\u0647\u0627 \u0628\u0631\u0627\u06CC \u0628\u0647\u0628\u0648\u062F \u062A\u062C\u0631\u0628\u0647 \u0634\u0645\u0627 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F. \u0628\u0631\u0627\u06CC \u062C\u0632\u0626\u06CC\u0627\u062A \u0628\u06CC\u0634\u062A\u0631 \u0633\u06CC\u0627\u0633\u062A \u06A9\u0648\u06A9\u06CC \u0645\u0627 \u0631\u0627 \u0645\u0637\u0627\u0644\u0639\u0647 \u06A9\u0646\u06CC\u062F.",
    policyLink: "\u0633\u06CC\u0627\u0633\u062A \u06A9\u0648\u06A9\u06CC",
    acceptAll: "\u067E\u0630\u06CC\u0631\u0634 \u0647\u0645\u0647",
    rejectAll: "\u0631\u062F \u0647\u0645\u0647",
    preferences: "\u062A\u0646\u0638\u06CC\u0645\u0627\u062A",
    save: "\u0630\u062E\u06CC\u0631\u0647 \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0647\u0627",
    close: "\u0628\u0633\u062A\u0646",
    cat: {
      essential: { title: "\u06A9\u0648\u06A9\u06CC\u200C\u0647\u0627\u06CC \u0636\u0631\u0648\u0631\u06CC", desc: "\u0628\u0631\u0627\u06CC \u0639\u0645\u0644\u06A9\u0631\u062F \u0627\u0635\u0644\u06CC \u0633\u0627\u06CC\u062A \u0644\u0627\u0632\u0645 \u0627\u0633\u062A. \u063A\u06CC\u0631\u0641\u0639\u0627\u0644 \u06A9\u0631\u062F\u0646 \u0622\u0646\u200C\u0647\u0627 \u0627\u0645\u06A9\u0627\u0646\u200C\u067E\u0630\u06CC\u0631 \u0646\u06CC\u0633\u062A.", always: "\u0647\u0645\u06CC\u0634\u0647 \u0641\u0639\u0627\u0644" },
      analytics: { title: "\u06A9\u0648\u06A9\u06CC\u200C\u0647\u0627\u06CC \u062A\u062D\u0644\u06CC\u0644\u06CC", desc: "\u0628\u0631\u0627\u06CC \u062C\u0645\u0639\u200C\u0622\u0648\u0631\u06CC \u0622\u0645\u0627\u0631 \u0646\u0627\u0634\u0646\u0627\u0633 \u0628\u0627\u0632\u062F\u06CC\u062F\u06A9\u0646\u0646\u062F\u06AF\u0627\u0646 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F." },
      marketing: { title: "\u06A9\u0648\u06A9\u06CC\u200C\u0647\u0627\u06CC \u0628\u0627\u0632\u0627\u0631\u06CC\u0627\u0628\u06CC", desc: "\u0628\u0631\u0627\u06CC \u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u0634\u062E\u0635\u06CC\u200C\u0633\u0627\u0632\u06CC\u200C\u0634\u062F\u0647 \u0648 \u0647\u062F\u0641\u200C\u06AF\u0630\u0627\u0631\u06CC \u0645\u062C\u062F\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F." },
      functional: { title: "\u06A9\u0648\u06A9\u06CC\u200C\u0647\u0627\u06CC \u0639\u0645\u0644\u06A9\u0631\u062F\u06CC", desc: "\u0628\u0631\u0627\u06CC \u0628\u0647 \u06CC\u0627\u062F\u0622\u0648\u0631\u06CC \u062A\u0646\u0638\u06CC\u0645\u0627\u062A\u06CC \u0645\u0627\u0646\u0646\u062F \u0632\u0628\u0627\u0646 \u0648 \u067E\u0648\u0633\u062A\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F." }
    },
    placeholder: {
      title: "\u0645\u062D\u062A\u0648\u0627 \u0645\u0633\u062F\u0648\u062F \u0634\u062F",
      desc: "\u0628\u0631\u0627\u06CC \u0645\u0634\u0627\u0647\u062F\u0647 \u0627\u06CC\u0646 \u0645\u062D\u062A\u0648\u0627 \u0628\u0627\u06CC\u062F \u06A9\u0648\u06A9\u06CC\u200C\u0647\u0627\u06CC {category} \u0631\u0627 \u0645\u062C\u0627\u0632 \u06A9\u0646\u06CC\u062F.",
      cta: "\u0627\u062C\u0627\u0632\u0647 \u062F\u0627\u062F\u0646"
    }
  };

  // src/i18n/translations/ur.js
  var ur_default = {
    title: "\u06A9\u0648\u06A9\u06CC \u062A\u0631\u062C\u06CC\u062D\u0627\u062A",
    intro: "\u06CC\u06C1 \u0633\u0627\u0626\u0679 \u0622\u067E \u06A9\u06D2 \u062A\u062C\u0631\u0628\u06D2 \u06A9\u0648 \u0628\u06C1\u062A\u0631 \u0628\u0646\u0627\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u06A9\u0648\u06A9\u06CC\u0632 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06A9\u0631\u062A\u06CC \u06C1\u06D2\u06D4 \u062A\u0641\u0635\u06CC\u0644\u0627\u062A \u06A9\u06D2 \u0644\u06CC\u06D2 \u06C1\u0645\u0627\u0631\u06CC \u06A9\u0648\u06A9\u06CC \u067E\u0627\u0644\u06CC\u0633\u06CC \u062F\u06CC\u06A9\u06BE\u06CC\u06BA\u06D4",
    policyLink: "\u06A9\u0648\u06A9\u06CC \u067E\u0627\u0644\u06CC\u0633\u06CC",
    acceptAll: "\u0633\u0628 \u0642\u0628\u0648\u0644 \u06A9\u0631\u06CC\u06BA",
    rejectAll: "\u0633\u0628 \u0645\u0633\u062A\u0631\u062F \u06A9\u0631\u06CC\u06BA",
    preferences: "\u062A\u0631\u062C\u06CC\u062D\u0627\u062A",
    save: "\u0627\u0646\u062A\u062E\u0627\u0628 \u0645\u062D\u0641\u0648\u0638 \u06A9\u0631\u06CC\u06BA",
    close: "\u0628\u0646\u062F \u06A9\u0631\u06CC\u06BA",
    cat: {
      essential: { title: "\u0636\u0631\u0648\u0631\u06CC \u06A9\u0648\u06A9\u06CC\u0632", desc: "\u0633\u0627\u0626\u0679 \u06A9\u06D2 \u0628\u0646\u06CC\u0627\u062F\u06CC \u0627\u0641\u0639\u0627\u0644 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0636\u0631\u0648\u0631\u06CC \u06C1\u06CC\u06BA\u06D4 \u063A\u06CC\u0631 \u0641\u0639\u0627\u0644 \u0646\u06C1\u06CC\u06BA \u06A9\u06CC \u062C\u0627 \u0633\u06A9\u062A\u06CC\u06BA\u06D4", always: "\u06C1\u0645\u06CC\u0634\u06C1 \u0641\u0639\u0627\u0644" },
      analytics: { title: "\u062A\u062C\u0632\u06CC\u0627\u062A\u06CC \u06A9\u0648\u06A9\u06CC\u0632", desc: "\u06AF\u0645\u0646\u0627\u0645 \u0648\u0632\u0679 \u06A9\u06D2 \u0627\u0639\u062F\u0627\u062F \u0648 \u0634\u0645\u0627\u0631 \u062C\u0645\u0639 \u06A9\u0631\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06C1\u0648\u062A\u06CC \u06C1\u06CC\u06BA\u06D4" },
      marketing: { title: "\u0645\u0627\u0631\u06A9\u06CC\u0679\u0646\u06AF \u06A9\u0648\u06A9\u06CC\u0632", desc: "\u0630\u0627\u062A\u06CC \u0646\u0648\u0639\u06CC\u062A \u06A9\u06CC \u0627\u0634\u062A\u06C1\u0627\u0631\u0628\u0627\u0632\u06CC \u0627\u0648\u0631 \u0631\u06CC \u0679\u0627\u0631\u06AF\u06CC\u0679\u0646\u06AF \u06A9\u06D2 \u0644\u06CC\u06D2 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06C1\u0648\u062A\u06CC \u06C1\u06CC\u06BA\u06D4" },
      functional: { title: "\u0641\u0639\u0644\u06CC\u0627\u062A\u06CC \u06A9\u0648\u06A9\u06CC\u0632", desc: "\u0632\u0628\u0627\u0646 \u0627\u0648\u0631 \u062A\u06BE\u06CC\u0645 \u062C\u06CC\u0633\u06CC \u062A\u0631\u062C\u06CC\u062D\u0627\u062A \u06CC\u0627\u062F \u0631\u06A9\u06BE\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06C1\u0648\u062A\u06CC \u06C1\u06CC\u06BA\u06D4" }
    },
    placeholder: {
      title: "\u0645\u0648\u0627\u062F \u0628\u0644\u0627\u06A9 \u06C1\u06D2",
      desc: "\u0627\u0633 \u0645\u0648\u0627\u062F \u06A9\u0648 \u062F\u06CC\u06A9\u06BE\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u0622\u067E \u06A9\u0648 {category} \u06A9\u0648\u06A9\u06CC\u0632 \u06A9\u06CC \u0627\u062C\u0627\u0632\u062A \u062F\u06CC\u0646\u06CC \u06C1\u0648\u06AF\u06CC\u06D4",
      cta: "\u0627\u062C\u0627\u0632\u062A \u062F\u06CC\u06BA"
    }
  };

  // src/i18n/translations/fr.js
  var fr_default = {
    title: "Pr\xE9f\xE9rences des Cookies",
    intro: "Ce site utilise des cookies pour am\xE9liorer votre exp\xE9rience. Consultez notre Politique de Cookies pour plus de d\xE9tails.",
    policyLink: "Politique de Cookies",
    acceptAll: "Tout Accepter",
    rejectAll: "Tout Refuser",
    preferences: "Pr\xE9f\xE9rences",
    save: "Enregistrer",
    close: "Fermer",
    cat: {
      essential: { title: "Cookies Essentiels", desc: "N\xE9cessaires au fonctionnement du site. Ne peuvent pas \xEAtre d\xE9sactiv\xE9s.", always: "Toujours actif" },
      analytics: { title: "Cookies Analytiques", desc: "Utilis\xE9s pour collecter des statistiques de visite anonymes." },
      marketing: { title: "Cookies Marketing", desc: "Utilis\xE9s pour la publicit\xE9 personnalis\xE9e et le reciblage." },
      functional: { title: "Cookies Fonctionnels", desc: "Utilis\xE9s pour m\xE9moriser vos pr\xE9f\xE9rences." }
    },
    placeholder: {
      title: "Contenu bloqu\xE9",
      desc: "Vous devez autoriser les cookies {category} pour voir ce contenu.",
      cta: "Autoriser"
    }
  };

  // src/i18n/translations/ru.js
  var ru_default = {
    title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0444\u0430\u0439\u043B\u043E\u0432 cookie",
    intro: "\u042D\u0442\u043E\u0442 \u0441\u0430\u0439\u0442 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u0444\u0430\u0439\u043B\u044B cookie \u0434\u043B\u044F \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F \u0432\u0430\u0448\u0435\u0433\u043E \u043E\u043F\u044B\u0442\u0430. \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0441\u0442\u0438 \u0432 \u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F cookie.",
    policyLink: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 cookie",
    acceptAll: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435",
    rejectAll: "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C \u0432\u0441\u0435",
    preferences: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0432\u044B\u0431\u043E\u0440",
    close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    cat: {
      essential: { title: "\u041E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0444\u0430\u0439\u043B\u044B cookie", desc: "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u044B \u0434\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0441\u0430\u0439\u0442\u0430. \u041D\u0435 \u043C\u043E\u0433\u0443\u0442 \u0431\u044B\u0442\u044C \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B.", always: "\u0412\u0441\u0435\u0433\u0434\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u044B" },
      analytics: { title: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 cookie", desc: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0434\u043B\u044F \u0441\u0431\u043E\u0440\u0430 \u0430\u043D\u043E\u043D\u0438\u043C\u043D\u043E\u0439 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u0439." },
      marketing: { title: "\u041C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433\u043E\u0432\u044B\u0435 cookie", desc: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0434\u043B\u044F \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u0440\u0435\u043A\u043B\u0430\u043C\u044B \u0438 \u0440\u0435\u0442\u0430\u0440\u0433\u0435\u0442\u0438\u043D\u0433\u0430." },
      functional: { title: "\u0424\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 cookie", desc: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0434\u043B\u044F \u0437\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u044F \u0432\u0430\u0448\u0438\u0445 \u043F\u0440\u0435\u0434\u043F\u043E\u0447\u0442\u0435\u043D\u0438\u0439." }
    },
    placeholder: {
      title: "\u041A\u043E\u043D\u0442\u0435\u043D\u0442 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D",
      desc: "\u0427\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u044D\u0442\u043E\u0442 \u043A\u043E\u043D\u0442\u0435\u043D\u0442, \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u044B cookie \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 {category}.",
      cta: "\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044C"
    }
  };

  // src/i18n/translations/de.js
  var de_default = {
    title: "Cookie-Einstellungen",
    intro: "Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern. Weitere Informationen in unserer Cookie-Richtlinie.",
    policyLink: "Cookie-Richtlinie",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Alle ablehnen",
    preferences: "Einstellungen",
    save: "Auswahl speichern",
    close: "Schlie\xDFen",
    cat: {
      essential: { title: "Notwendige Cookies", desc: "F\xFCr die Grundfunktionen der Website erforderlich. K\xF6nnen nicht deaktiviert werden.", always: "Immer aktiv" },
      analytics: { title: "Analyse-Cookies", desc: "Werden verwendet, um anonyme Besuchsstatistiken zu sammeln." },
      marketing: { title: "Marketing-Cookies", desc: "Werden f\xFCr personalisierte Werbung und Retargeting verwendet." },
      functional: { title: "Funktionale Cookies", desc: "Werden verwendet, um Einstellungen wie Sprache und Theme zu speichern." }
    },
    placeholder: {
      title: "Inhalt blockiert",
      desc: "Sie m\xFCssen {category}-Cookies erlauben, um diesen Inhalt anzuzeigen.",
      cta: "Erlauben"
    }
  };

  // src/i18n/translations/he.js
  var he_default = {
    title: "\u05D4\u05E2\u05D3\u05E4\u05D5\u05EA \u05E2\u05D5\u05D2\u05D9\u05D5\u05EA",
    intro: "\u05D0\u05EA\u05E8 \u05D6\u05D4 \u05DE\u05E9\u05EA\u05DE\u05E9 \u05D1\u05E2\u05D5\u05D2\u05D9\u05D5\u05EA \u05DC\u05E9\u05D9\u05E4\u05D5\u05E8 \u05D7\u05D5\u05D5\u05D9\u05EA\u05DA. \u05E8\u05D0\u05D4 \u05D0\u05EA \u05DE\u05D3\u05D9\u05E0\u05D9\u05D5\u05EA \u05D4\u05E2\u05D5\u05D2\u05D9\u05D5\u05EA \u05E9\u05DC\u05E0\u05D5 \u05DC\u05E4\u05E8\u05D8\u05D9\u05DD.",
    policyLink: "\u05DE\u05D3\u05D9\u05E0\u05D9\u05D5\u05EA \u05E2\u05D5\u05D2\u05D9\u05D5\u05EA",
    acceptAll: "\u05E7\u05D1\u05DC \u05D4\u05DB\u05DC",
    rejectAll: "\u05D3\u05D7\u05D4 \u05D4\u05DB\u05DC",
    preferences: "\u05D4\u05E2\u05D3\u05E4\u05D5\u05EA",
    save: "\u05E9\u05DE\u05D5\u05E8 \u05D1\u05D7\u05D9\u05E8\u05D5\u05EA",
    close: "\u05E1\u05D2\u05D5\u05E8",
    cat: {
      essential: { title: "\u05E2\u05D5\u05D2\u05D9\u05D5\u05EA \u05D7\u05D9\u05D5\u05E0\u05D9\u05D5\u05EA", desc: "\u05E0\u05D3\u05E8\u05E9\u05D5\u05EA \u05DC\u05EA\u05E4\u05E7\u05D5\u05D3 \u05D4\u05D0\u05EA\u05E8. \u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D4\u05E9\u05D1\u05D9\u05EA.", always: "\u05E4\u05E2\u05D9\u05DC \u05EA\u05DE\u05D9\u05D3" },
      analytics: { title: "\u05E2\u05D5\u05D2\u05D9\u05D5\u05EA \u05E0\u05D9\u05EA\u05D5\u05D7", desc: "\u05DE\u05E9\u05DE\u05E9\u05D5\u05EA \u05DC\u05D0\u05D9\u05E1\u05D5\u05E3 \u05E1\u05D8\u05D8\u05D9\u05E1\u05D8\u05D9\u05E7\u05D5\u05EA \u05D1\u05D9\u05E7\u05D5\u05E8 \u05D0\u05E0\u05D5\u05E0\u05D9\u05DE\u05D9\u05D5\u05EA." },
      marketing: { title: "\u05E2\u05D5\u05D2\u05D9\u05D5\u05EA \u05E9\u05D9\u05D5\u05D5\u05E7", desc: "\u05DE\u05E9\u05DE\u05E9\u05D5\u05EA \u05DC\u05E4\u05E8\u05E1\u05D5\u05DD \u05DE\u05D5\u05EA\u05D0\u05DD \u05D0\u05D9\u05E9\u05D9\u05EA \u05D5\u05E8\u05D9\u05DE\u05E8\u05E7\u05D8\u05D9\u05E0\u05D2." },
      functional: { title: "\u05E2\u05D5\u05D2\u05D9\u05D5\u05EA \u05E4\u05D5\u05E0\u05E7\u05E6\u05D9\u05D5\u05E0\u05DC\u05D9\u05D5\u05EA", desc: "\u05DE\u05E9\u05DE\u05E9\u05D5\u05EA \u05DC\u05D6\u05DB\u05D9\u05E8\u05EA \u05D4\u05E2\u05D3\u05E4\u05D5\u05EA \u05DB\u05DE\u05D5 \u05E9\u05E4\u05D4 \u05D5\u05E2\u05D9\u05E6\u05D5\u05D1." }
    },
    placeholder: {
      title: "\u05D4\u05EA\u05D5\u05DB\u05DF \u05D7\u05E1\u05D5\u05DD",
      desc: "\u05E2\u05DC\u05D9\u05DA \u05DC\u05D0\u05E9\u05E8 \u05E2\u05D5\u05D2\u05D9\u05D5\u05EA {category} \u05DB\u05D3\u05D9 \u05DC\u05E6\u05E4\u05D5\u05EA \u05D1\u05EA\u05D5\u05DB\u05DF \u05D6\u05D4.",
      cta: "\u05D0\u05E4\u05E9\u05E8"
    }
  };

  // src/i18n/translations/uk.js
  var uk_default = {
    title: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0444\u0430\u0439\u043B\u0456\u0432 cookie",
    intro: "\u0426\u0435\u0439 \u0441\u0430\u0439\u0442 \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u0454 \u0444\u0430\u0439\u043B\u0438 cookie \u0434\u043B\u044F \u043F\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u043D\u044F \u0432\u0430\u0448\u043E\u0433\u043E \u0434\u043E\u0441\u0432\u0456\u0434\u0443. \u0414\u0438\u0432\u0456\u0442\u044C\u0441\u044F \u043D\u0430\u0448\u0443 \u041F\u043E\u043B\u0456\u0442\u0438\u043A\u0443 cookie.",
    policyLink: "\u041F\u043E\u043B\u0456\u0442\u0438\u043A\u0430 cookie",
    acceptAll: "\u041F\u0440\u0438\u0439\u043D\u044F\u0442\u0438 \u0432\u0441\u0456",
    rejectAll: "\u0412\u0456\u0434\u0445\u0438\u043B\u0438\u0442\u0438 \u0432\u0441\u0456",
    preferences: "\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F",
    save: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u0432\u0438\u0431\u0456\u0440",
    close: "\u0417\u0430\u043A\u0440\u0438\u0442\u0438",
    cat: {
      essential: { title: "\u041E\u0431\u043E\u0432'\u044F\u0437\u043A\u043E\u0432\u0456 cookie", desc: "\u041D\u0435\u043E\u0431\u0445\u0456\u0434\u043D\u0456 \u0434\u043B\u044F \u0440\u043E\u0431\u043E\u0442\u0438 \u0441\u0430\u0439\u0442\u0443. \u041D\u0435 \u043C\u043E\u0436\u0443\u0442\u044C \u0431\u0443\u0442\u0438 \u0432\u0438\u043C\u043A\u043D\u0435\u043D\u0456.", always: "\u0417\u0430\u0432\u0436\u0434\u0438 \u0430\u043A\u0442\u0438\u0432\u043D\u0456" },
      analytics: { title: "\u0410\u043D\u0430\u043B\u0456\u0442\u0438\u0447\u043D\u0456 cookie", desc: "\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u044E\u0442\u044C\u0441\u044F \u0434\u043B\u044F \u0437\u0431\u043E\u0440\u0443 \u0430\u043D\u043E\u043D\u0456\u043C\u043D\u043E\u0457 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u043D\u044C." },
      marketing: { title: "\u041C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433\u043E\u0432\u0456 cookie", desc: "\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u044E\u0442\u044C\u0441\u044F \u0434\u043B\u044F \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0456\u0437\u043E\u0432\u0430\u043D\u043E\u0457 \u0440\u0435\u043A\u043B\u0430\u043C\u0438 \u0442\u0430 \u0440\u0435\u0442\u0430\u0440\u0433\u0435\u0442\u0438\u043D\u0433\u0443." },
      functional: { title: "\u0424\u0443\u043D\u043A\u0446\u0456\u043E\u043D\u0430\u043B\u044C\u043D\u0456 cookie", desc: "\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u044E\u0442\u044C\u0441\u044F \u0434\u043B\u044F \u0437\u0430\u043F\u0430\u043C'\u044F\u0442\u043E\u0432\u0443\u0432\u0430\u043D\u043D\u044F \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u044C \u043C\u043E\u0432\u0438, \u0442\u0435\u043C\u0438 \u0442\u043E\u0449\u043E." }
    },
    placeholder: {
      title: "\u0412\u043C\u0456\u0441\u0442 \u0437\u0430\u0431\u043B\u043E\u043A\u043E\u0432\u0430\u043D\u043E",
      desc: "\u0429\u043E\u0431 \u043F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u0446\u0435\u0439 \u0432\u043C\u0456\u0441\u0442, \u0434\u043E\u0437\u0432\u043E\u043B\u044C\u0442\u0435 \u0444\u0430\u0439\u043B\u0438 cookie \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457 {category}.",
      cta: "\u0414\u043E\u0437\u0432\u043E\u043B\u0438\u0442\u0438"
    }
  };

  // src/i18n/translations/es.js
  var es_default = {
    title: "Preferencias de Cookies",
    intro: "Este sitio usa cookies para mejorar tu experiencia. Consulta nuestra Pol\xEDtica de Cookies.",
    policyLink: "Pol\xEDtica de Cookies",
    acceptAll: "Aceptar todo",
    rejectAll: "Rechazar todo",
    preferences: "Preferencias",
    save: "Guardar opciones",
    close: "Cerrar",
    cat: {
      essential: { title: "Cookies esenciales", desc: "Necesarias para el funcionamiento del sitio. No se pueden desactivar.", always: "Siempre activo" },
      analytics: { title: "Cookies anal\xEDticas", desc: "Usadas para recopilar estad\xEDsticas de visita an\xF3nimas." },
      marketing: { title: "Cookies de marketing", desc: "Usadas para publicidad personalizada y retargeting." },
      functional: { title: "Cookies funcionales", desc: "Usadas para recordar preferencias como idioma o tema." }
    },
    placeholder: {
      title: "Contenido bloqueado",
      desc: "Necesitas permitir las cookies de {category} para ver este contenido.",
      cta: "Permitir"
    }
  };

  // src/i18n/translations/it.js
  var it_default = {
    title: "Preferenze Cookie",
    intro: "Questo sito usa i cookie per migliorare la tua esperienza. Consulta la nostra Informativa sui Cookie.",
    policyLink: "Informativa sui Cookie",
    acceptAll: "Accetta tutti",
    rejectAll: "Rifiuta tutti",
    preferences: "Preferenze",
    save: "Salva scelte",
    close: "Chiudi",
    cat: {
      essential: { title: "Cookie essenziali", desc: "Necessari per il funzionamento del sito. Non disattivabili.", always: "Sempre attivo" },
      analytics: { title: "Cookie analitici", desc: "Usati per raccogliere statistiche di visita anonime." },
      marketing: { title: "Cookie di marketing", desc: "Usati per pubblicit\xE0 personalizzata e retargeting." },
      functional: { title: "Cookie funzionali", desc: "Usati per ricordare preferenze come lingua e tema." }
    },
    placeholder: {
      title: "Contenuto bloccato",
      desc: "Devi consentire i cookie {category} per visualizzare questo contenuto.",
      cta: "Consenti"
    }
  };

  // src/i18n/translations/pt.js
  var pt_default = {
    title: "Prefer\xEAncias de Cookies",
    intro: "Este site usa cookies para melhorar sua experi\xEAncia. Consulte nossa Pol\xEDtica de Cookies.",
    policyLink: "Pol\xEDtica de Cookies",
    acceptAll: "Aceitar todos",
    rejectAll: "Rejeitar todos",
    preferences: "Prefer\xEAncias",
    save: "Salvar escolhas",
    close: "Fechar",
    cat: {
      essential: { title: "Cookies essenciais", desc: "Necess\xE1rios para o funcionamento do site. N\xE3o podem ser desativados.", always: "Sempre ativo" },
      analytics: { title: "Cookies anal\xEDticos", desc: "Usados para coletar estat\xEDsticas an\xF4nimas de visitas." },
      marketing: { title: "Cookies de marketing", desc: "Usados para publicidade personalizada e retargeting." },
      functional: { title: "Cookies funcionais", desc: "Usados para lembrar prefer\xEAncias como idioma e tema." }
    },
    placeholder: {
      title: "Conte\xFAdo bloqueado",
      desc: "Voc\xEA precisa permitir cookies de {category} para ver este conte\xFAdo.",
      cta: "Permitir"
    }
  };

  // src/i18n/translations/nl.js
  var nl_default = {
    title: "Cookie-voorkeuren",
    intro: "Deze site gebruikt cookies om uw ervaring te verbeteren. Zie ons Cookiebeleid voor details.",
    policyLink: "Cookiebeleid",
    acceptAll: "Alles accepteren",
    rejectAll: "Alles weigeren",
    preferences: "Voorkeuren",
    save: "Keuzes opslaan",
    close: "Sluiten",
    cat: {
      essential: { title: "Essenti\xEBle cookies", desc: "Noodzakelijk voor het functioneren van de site. Kunnen niet worden uitgeschakeld.", always: "Altijd actief" },
      analytics: { title: "Analytische cookies", desc: "Gebruikt voor het verzamelen van anonieme bezoekstatistieken." },
      marketing: { title: "Marketingcookies", desc: "Gebruikt voor gepersonaliseerde advertenties en retargeting." },
      functional: { title: "Functionele cookies", desc: "Gebruikt om voorkeuren zoals taal en thema te onthouden." }
    },
    placeholder: {
      title: "Inhoud geblokkeerd",
      desc: "U moet {category}-cookies toestaan om deze inhoud te bekijken.",
      cta: "Toestaan"
    }
  };

  // src/i18n/translations/pl.js
  var pl_default = {
    title: "Preferencje plik\xF3w cookie",
    intro: "Ta strona u\u017Cywa plik\xF3w cookie, aby poprawi\u0107 Twoje do\u015Bwiadczenia. Zobacz nasz\u0105 Polityk\u0119 plik\xF3w cookie.",
    policyLink: "Polityka plik\xF3w cookie",
    acceptAll: "Akceptuj wszystkie",
    rejectAll: "Odrzu\u0107 wszystkie",
    preferences: "Preferencje",
    save: "Zapisz wybory",
    close: "Zamknij",
    cat: {
      essential: { title: "Niezb\u0119dne pliki cookie", desc: "Wymagane do dzia\u0142ania strony. Nie mo\u017Cna ich wy\u0142\u0105czy\u0107.", always: "Zawsze aktywne" },
      analytics: { title: "Analityczne pliki cookie", desc: "U\u017Cywane do zbierania anonimowych statystyk odwiedzin." },
      marketing: { title: "Marketingowe pliki cookie", desc: "U\u017Cywane do spersonalizowanych reklam i retargetingu." },
      functional: { title: "Funkcjonalne pliki cookie", desc: "U\u017Cywane do zapami\u0119tywania preferencji takich jak j\u0119zyk i motyw." }
    },
    placeholder: {
      title: "Tre\u015B\u0107 zablokowana",
      desc: "Musisz zezwoli\u0107 na pliki cookie {category}, aby wy\u015Bwietli\u0107 t\u0119 tre\u015B\u0107.",
      cta: "Zezw\xF3l"
    }
  };

  // src/i18n/translations/sv.js
  var sv_default = {
    title: "Cookie-inst\xE4llningar",
    intro: "Den h\xE4r webbplatsen anv\xE4nder cookies f\xF6r att f\xF6rb\xE4ttra din upplevelse. Se v\xE5r Cookie-policy.",
    policyLink: "Cookie-policy",
    acceptAll: "Acceptera alla",
    rejectAll: "Avvisa alla",
    preferences: "Inst\xE4llningar",
    save: "Spara val",
    close: "St\xE4ng",
    cat: {
      essential: { title: "N\xF6dv\xE4ndiga cookies", desc: "Kr\xE4vs f\xF6r att webbplatsen ska fungera. Kan inte inaktiveras.", always: "Alltid aktiv" },
      analytics: { title: "Analytiska cookies", desc: "Anv\xE4nds f\xF6r att samla in anonym bes\xF6ksstatistik." },
      marketing: { title: "Marknadsf\xF6ringscookies", desc: "Anv\xE4nds f\xF6r personlig annonsering och \xE5termarknadsf\xF6ring." },
      functional: { title: "Funktionella cookies", desc: "Anv\xE4nds f\xF6r att komma ih\xE5g inst\xE4llningar som spr\xE5k och tema." }
    },
    placeholder: {
      title: "Inneh\xE5ll blockerat",
      desc: "Du m\xE5ste till\xE5ta {category}-cookies f\xF6r att visa detta inneh\xE5ll.",
      cta: "Till\xE5t"
    }
  };

  // src/i18n/translations/cs.js
  var cs_default = {
    title: "P\u0159edvolby soubor\u016F cookie",
    intro: "Tento web pou\u017E\xEDv\xE1 soubory cookie ke zlep\u0161en\xED va\u0161eho z\xE1\u017Eitku. Viz na\u0161e Z\xE1sady soubor\u016F cookie.",
    policyLink: "Z\xE1sady soubor\u016F cookie",
    acceptAll: "P\u0159ijmout v\u0161e",
    rejectAll: "Odm\xEDtnout v\u0161e",
    preferences: "P\u0159edvolby",
    save: "Ulo\u017Eit volby",
    close: "Zav\u0159\xEDt",
    cat: {
      essential: { title: "Nezbytn\xE9 soubory cookie", desc: "Nutn\xE9 pro fungov\xE1n\xED webu. Nelze je deaktivovat.", always: "V\u017Edy aktivn\xED" },
      analytics: { title: "Analytick\xE9 soubory cookie", desc: "Slou\u017E\xED ke shroma\u017E\u010Fov\xE1n\xED anonymn\xEDch statistik n\xE1v\u0161t\u011Bv." },
      marketing: { title: "Marketingov\xE9 soubory cookie", desc: "Slou\u017E\xED k personalizovan\xE9 reklam\u011B a retargetingu." },
      functional: { title: "Funk\u010Dn\xED soubory cookie", desc: "Slou\u017E\xED k zapamatov\xE1n\xED p\u0159edvoleb jako jazyk a t\xE9ma." }
    },
    placeholder: {
      title: "Obsah blokov\xE1n",
      desc: "Pro zobrazen\xED tohoto obsahu mus\xEDte povolit soubory cookie {category}.",
      cta: "Povolit"
    }
  };

  // src/i18n/translations/zh.js
  var zh_default = {
    title: "Cookie \u504F\u597D\u8BBE\u7F6E",
    intro: "\u672C\u7F51\u7AD9\u4F7F\u7528 Cookie \u6765\u6539\u5584\u60A8\u7684\u4F53\u9A8C\u3002\u8BE6\u60C5\u8BF7\u67E5\u770B\u6211\u4EEC\u7684 Cookie \u653F\u7B56\u3002",
    policyLink: "Cookie \u653F\u7B56",
    acceptAll: "\u63A5\u53D7\u5168\u90E8",
    rejectAll: "\u62D2\u7EDD\u5168\u90E8",
    preferences: "\u504F\u597D\u8BBE\u7F6E",
    save: "\u4FDD\u5B58\u9009\u62E9",
    close: "\u5173\u95ED",
    cat: {
      essential: { title: "\u5FC5\u8981 Cookie", desc: "\u7F51\u7AD9\u57FA\u672C\u529F\u80FD\u6240\u5FC5\u9700\uFF0C\u65E0\u6CD5\u7981\u7528\u3002", always: "\u59CB\u7EC8\u542F\u7528" },
      analytics: { title: "\u5206\u6790 Cookie", desc: "\u7528\u4E8E\u6536\u96C6\u533F\u540D\u8BBF\u95EE\u7EDF\u8BA1\u6570\u636E\u3002" },
      marketing: { title: "\u8425\u9500 Cookie", desc: "\u7528\u4E8E\u4E2A\u6027\u5316\u5E7F\u544A\u548C\u518D\u8425\u9500\u3002" },
      functional: { title: "\u529F\u80FD Cookie", desc: "\u7528\u4E8E\u8BB0\u4F4F\u8BED\u8A00\u3001\u4E3B\u9898\u7B49\u504F\u597D\u8BBE\u7F6E\u3002" }
    },
    placeholder: {
      title: "\u5185\u5BB9\u5DF2\u88AB\u963B\u6B62",
      desc: "\u60A8\u9700\u8981\u5141\u8BB8 {category} Cookie \u624D\u80FD\u67E5\u770B\u6B64\u5185\u5BB9\u3002",
      cta: "\u5141\u8BB8"
    }
  };

  // src/i18n/translations/zh-TW.js
  var zh_TW_default = {
    title: "Cookie \u504F\u597D\u8A2D\u5B9A",
    intro: "\u672C\u7DB2\u7AD9\u4F7F\u7528 Cookie \u4F86\u6539\u5584\u60A8\u7684\u9AD4\u9A57\u3002\u8A73\u60C5\u8ACB\u67E5\u770B\u6211\u5011\u7684 Cookie \u653F\u7B56\u3002",
    policyLink: "Cookie \u653F\u7B56",
    acceptAll: "\u63A5\u53D7\u5168\u90E8",
    rejectAll: "\u62D2\u7D55\u5168\u90E8",
    preferences: "\u504F\u597D\u8A2D\u5B9A",
    save: "\u5132\u5B58\u9078\u64C7",
    close: "\u95DC\u9589",
    cat: {
      essential: { title: "\u5FC5\u8981 Cookie", desc: "\u7DB2\u7AD9\u57FA\u672C\u529F\u80FD\u6240\u5FC5\u9700\uFF0C\u7121\u6CD5\u505C\u7528\u3002", always: "\u59CB\u7D42\u555F\u7528" },
      analytics: { title: "\u5206\u6790 Cookie", desc: "\u7528\u65BC\u6536\u96C6\u533F\u540D\u8A2A\u554F\u7D71\u8A08\u8CC7\u6599\u3002" },
      marketing: { title: "\u884C\u92B7 Cookie", desc: "\u7528\u65BC\u500B\u4EBA\u5316\u5EE3\u544A\u548C\u518D\u884C\u92B7\u3002" },
      functional: { title: "\u529F\u80FD Cookie", desc: "\u7528\u65BC\u8A18\u4F4F\u8A9E\u8A00\u3001\u4E3B\u984C\u7B49\u504F\u597D\u8A2D\u5B9A\u3002" }
    },
    placeholder: {
      title: "\u5167\u5BB9\u5DF2\u88AB\u5C01\u9396",
      desc: "\u60A8\u9700\u8981\u5141\u8A31 {category} Cookie \u624D\u80FD\u6AA2\u8996\u6B64\u5167\u5BB9\u3002",
      cta: "\u5141\u8A31"
    }
  };

  // src/i18n/translations/ja.js
  var ja_default = {
    title: "Cookie\u306E\u8A2D\u5B9A",
    intro: "\u3053\u306E\u30B5\u30A4\u30C8\u306F\u30A8\u30AF\u30B9\u30DA\u30EA\u30A8\u30F3\u30B9\u3092\u5411\u4E0A\u3055\u305B\u308B\u305F\u3081\u306BCookie\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002\u8A73\u7D30\u306FCookie\u30DD\u30EA\u30B7\u30FC\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002",
    policyLink: "Cookie\u30DD\u30EA\u30B7\u30FC",
    acceptAll: "\u3059\u3079\u3066\u627F\u8A8D",
    rejectAll: "\u3059\u3079\u3066\u62D2\u5426",
    preferences: "\u8A2D\u5B9A",
    save: "\u9078\u629E\u3092\u4FDD\u5B58",
    close: "\u9589\u3058\u308B",
    cat: {
      essential: { title: "\u5FC5\u9808Cookie", desc: "\u30B5\u30A4\u30C8\u306E\u57FA\u672C\u6A5F\u80FD\u306B\u5FC5\u8981\u3067\u3059\u3002\u7121\u52B9\u306B\u3067\u304D\u307E\u305B\u3093\u3002", always: "\u5E38\u306B\u6709\u52B9" },
      analytics: { title: "\u5206\u6790Cookie", desc: "\u533F\u540D\u306E\u8A2A\u554F\u7D71\u8A08\u3092\u53CE\u96C6\u3059\u308B\u305F\u3081\u306B\u4F7F\u7528\u3055\u308C\u307E\u3059\u3002" },
      marketing: { title: "\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0Cookie", desc: "\u30D1\u30FC\u30BD\u30CA\u30E9\u30A4\u30BA\u3055\u308C\u305F\u5E83\u544A\u3068\u30EA\u30BF\u30FC\u30B2\u30C6\u30A3\u30F3\u30B0\u306B\u4F7F\u7528\u3055\u308C\u307E\u3059\u3002" },
      functional: { title: "\u6A5F\u80FDCookie", desc: "\u8A00\u8A9E\u3084\u30C6\u30FC\u30DE\u306A\u3069\u306E\u8A2D\u5B9A\u3092\u8A18\u61B6\u3059\u308B\u305F\u3081\u306B\u4F7F\u7528\u3055\u308C\u307E\u3059\u3002" }
    },
    placeholder: {
      title: "\u30B3\u30F3\u30C6\u30F3\u30C4\u304C\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u307E\u3057\u305F",
      desc: "\u3053\u306E\u30B3\u30F3\u30C6\u30F3\u30C4\u3092\u8868\u793A\u3059\u308B\u306B\u306F{category}Cookie\u3092\u8A31\u53EF\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
      cta: "\u8A31\u53EF\u3059\u308B"
    }
  };

  // src/i18n/translations/ko.js
  var ko_default = {
    title: "\uCFE0\uD0A4 \uD658\uACBD\uC124\uC815",
    intro: "\uC774 \uC0AC\uC774\uD2B8\uB294 \uACBD\uD5D8\uC744 \uD5A5\uC0C1\uC2DC\uD0A4\uAE30 \uC704\uD574 \uCFE0\uD0A4\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uC790\uC138\uD55C \uB0B4\uC6A9\uC740 \uCFE0\uD0A4 \uC815\uCC45\uC744 \uD655\uC778\uD558\uC138\uC694.",
    policyLink: "\uCFE0\uD0A4 \uC815\uCC45",
    acceptAll: "\uBAA8\uB450 \uC218\uB77D",
    rejectAll: "\uBAA8\uB450 \uAC70\uBD80",
    preferences: "\uD658\uACBD\uC124\uC815",
    save: "\uC120\uD0DD \uC800\uC7A5",
    close: "\uB2EB\uAE30",
    cat: {
      essential: { title: "\uD544\uC218 \uCFE0\uD0A4", desc: "\uC0AC\uC774\uD2B8 \uAE30\uB2A5\uC5D0 \uD544\uC694\uD558\uBA70 \uBE44\uD65C\uC131\uD654\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", always: "\uD56D\uC0C1 \uD65C\uC131" },
      analytics: { title: "\uBD84\uC11D \uCFE0\uD0A4", desc: "\uC775\uBA85 \uBC29\uBB38 \uD1B5\uACC4 \uC218\uC9D1\uC5D0 \uC0AC\uC6A9\uB429\uB2C8\uB2E4." },
      marketing: { title: "\uB9C8\uCF00\uD305 \uCFE0\uD0A4", desc: "\uB9DE\uCDA4\uD615 \uAD11\uACE0 \uBC0F \uB9AC\uD0C0\uAC8C\uD305\uC5D0 \uC0AC\uC6A9\uB429\uB2C8\uB2E4." },
      functional: { title: "\uAE30\uB2A5\uC131 \uCFE0\uD0A4", desc: "\uC5B8\uC5B4, \uD14C\uB9C8 \uB4F1\uC758 \uD658\uACBD\uC124\uC815\uC744 \uAE30\uC5B5\uD558\uB294 \uB370 \uC0AC\uC6A9\uB429\uB2C8\uB2E4." }
    },
    placeholder: {
      title: "\uCF58\uD150\uCE20\uAC00 \uCC28\uB2E8\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
      desc: "\uC774 \uCF58\uD150\uCE20\uB97C \uBCF4\uB824\uBA74 {category} \uCFE0\uD0A4\uB97C \uD5C8\uC6A9\uD574\uC57C \uD569\uB2C8\uB2E4.",
      cta: "\uD5C8\uC6A9"
    }
  };

  // src/i18n/translations/id.js
  var id_default = {
    title: "Preferensi Cookie",
    intro: "Situs ini menggunakan cookie untuk meningkatkan pengalaman Anda. Lihat Kebijakan Cookie kami.",
    policyLink: "Kebijakan Cookie",
    acceptAll: "Terima Semua",
    rejectAll: "Tolak Semua",
    preferences: "Preferensi",
    save: "Simpan Pilihan",
    close: "Tutup",
    cat: {
      essential: { title: "Cookie Esensial", desc: "Diperlukan untuk fungsi dasar situs. Tidak dapat dinonaktifkan.", always: "Selalu aktif" },
      analytics: { title: "Cookie Analitik", desc: "Digunakan untuk mengumpulkan statistik kunjungan anonim." },
      marketing: { title: "Cookie Pemasaran", desc: "Digunakan untuk iklan yang dipersonalisasi dan retargeting." },
      functional: { title: "Cookie Fungsional", desc: "Digunakan untuk mengingat preferensi seperti bahasa dan tema." }
    },
    placeholder: {
      title: "Konten diblokir",
      desc: "Anda harus mengizinkan cookie {category} untuk melihat konten ini.",
      cta: "Izinkan"
    }
  };

  // src/i18n/translations/hi.js
  var hi_default = {
    title: "\u0915\u0941\u0915\u0940 \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915\u0924\u093E\u090F\u0902",
    intro: "\u092F\u0939 \u0938\u093E\u0907\u091F \u0906\u092A\u0915\u0947 \u0905\u0928\u0941\u092D\u0935 \u0915\u094B \u092C\u0947\u0939\u0924\u0930 \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u0941\u0915\u0940\u091C\u093C \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0924\u0940 \u0939\u0948\u0964 \u0935\u093F\u0935\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F \u0939\u092E\u093E\u0930\u0940 \u0915\u0941\u0915\u0940 \u0928\u0940\u0924\u093F \u0926\u0947\u0916\u0947\u0902\u0964",
    policyLink: "\u0915\u0941\u0915\u0940 \u0928\u0940\u0924\u093F",
    acceptAll: "\u0938\u092D\u0940 \u0938\u094D\u0935\u0940\u0915\u093E\u0930 \u0915\u0930\u0947\u0902",
    rejectAll: "\u0938\u092D\u0940 \u0905\u0938\u094D\u0935\u0940\u0915\u093E\u0930 \u0915\u0930\u0947\u0902",
    preferences: "\u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915\u0924\u093E\u090F\u0902",
    save: "\u0935\u093F\u0915\u0932\u094D\u092A \u0938\u0939\u0947\u091C\u0947\u0902",
    close: "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902",
    cat: {
      essential: { title: "\u0906\u0935\u0936\u094D\u092F\u0915 \u0915\u0941\u0915\u0940\u091C\u093C", desc: "\u0938\u093E\u0907\u091F \u0915\u0947 \u0915\u093E\u0930\u094D\u092F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0906\u0935\u0936\u094D\u092F\u0915\u0964 \u0905\u0915\u094D\u0937\u092E \u0928\u0939\u0940\u0902 \u0915\u0940 \u091C\u093E \u0938\u0915\u0924\u0940\u0902\u0964", always: "\u0939\u092E\u0947\u0936\u093E \u0938\u0915\u094D\u0930\u093F\u092F" },
      analytics: { title: "\u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u0915\u0941\u0915\u0940\u091C\u093C", desc: "\u0905\u091C\u094D\u091E\u093E\u0924 \u0935\u093F\u091C\u093C\u093F\u091F \u0906\u0901\u0915\u0921\u093C\u0947 \u090F\u0915\u0924\u094D\u0930 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0909\u092A\u092F\u094B\u0917 \u0915\u0940 \u091C\u093E\u0924\u0940 \u0939\u0948\u0902\u0964" },
      marketing: { title: "\u092E\u093E\u0930\u094D\u0915\u0947\u091F\u093F\u0902\u0917 \u0915\u0941\u0915\u0940\u091C\u093C", desc: "\u0935\u0948\u092F\u0915\u094D\u0924\u093F\u0915\u0943\u0924 \u0935\u093F\u091C\u094D\u091E\u093E\u092A\u0928 \u0914\u0930 \u0930\u093F\u091F\u093E\u0930\u094D\u0917\u0947\u091F\u093F\u0902\u0917 \u0915\u0947 \u0932\u093F\u090F \u0909\u092A\u092F\u094B\u0917 \u0915\u0940 \u091C\u093E\u0924\u0940 \u0939\u0948\u0902\u0964" },
      functional: { title: "\u0915\u093E\u0930\u094D\u092F\u093E\u0924\u094D\u092E\u0915 \u0915\u0941\u0915\u0940\u091C\u093C", desc: "\u092D\u093E\u0937\u093E, \u0925\u0940\u092E \u091C\u0948\u0938\u0940 \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915\u0924\u093E\u0913\u0902 \u0915\u094B \u092F\u093E\u0926 \u0930\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0909\u092A\u092F\u094B\u0917 \u0915\u0940 \u091C\u093E\u0924\u0940 \u0939\u0948\u0902\u0964" }
    },
    placeholder: {
      title: "\u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0905\u0935\u0930\u0941\u0926\u094D\u0927 \u0939\u0948",
      desc: "\u0907\u0938 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0915\u094B \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u094B {category} \u0915\u0941\u0915\u0940\u091C\u093C \u0915\u0940 \u0905\u0928\u0941\u092E\u0924\u093F \u0926\u0947\u0928\u0940 \u0939\u094B\u0917\u0940\u0964",
      cta: "\u0905\u0928\u0941\u092E\u0924\u093F \u0926\u0947\u0902"
    }
  };

  // src/i18n/index.js
  var DEFAULT_LOCALE = "tr";
  var TRANSLATIONS = {
    tr: tr_default,
    en: en_default,
    ar: ar_default,
    fa: fa_default,
    ur: ur_default,
    fr: fr_default,
    ru: ru_default,
    de: de_default,
    he: he_default,
    uk: uk_default,
    es: es_default,
    it: it_default,
    pt: pt_default,
    nl: nl_default,
    pl: pl_default,
    sv: sv_default,
    cs: cs_default,
    zh: zh_default,
    "zh-TW": zh_TW_default,
    ja: ja_default,
    ko: ko_default,
    id: id_default,
    hi: hi_default
  };
  var getTranslation = (locale) => TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];

  // src/ui/styles.js
  var STYLE_ID = "blakfy-cookie-styles";
  var RULES = [
    "/* Layout architecture is locked \u2014 only --blakfy-accent is overridable */",
    // Modal mode (centered, dimmed backdrop)
    ".blakfy-overlay.modal{position:fixed !important;inset:0;background:rgba(0,0,0,.4);z-index:2147483646 !important;display:flex !important;align-items:center;justify-content:center;padding:16px}",
    // Widget mode (tooltip/banner — transparent, no backdrop)
    ".blakfy-overlay.widget{position:fixed !important;inset:auto;background:transparent;padding:0;display:block !important;z-index:2147483646 !important;pointer-events:none}",
    ".blakfy-overlay.widget .blakfy-card{width:min(96vw,1100px);max-width:none;border-radius:8px;position:relative;pointer-events:auto;padding-bottom:40px}",
    // Position modifiers (widget)
    ".blakfy-overlay.widget.bottom-center{bottom:16px;left:50%;right:auto;top:auto;transform:translateX(-50%)}",
    ".blakfy-overlay.widget.bottom-right{bottom:16px;right:16px;left:auto;top:auto}",
    ".blakfy-overlay.widget.bottom-left{bottom:16px;left:16px;right:auto;top:auto}",
    ".blakfy-overlay.widget.top-center{top:16px;left:50%;right:auto;bottom:auto;transform:translateX(-50%)}",
    ".blakfy-overlay.widget.top-right{top:16px;right:16px;left:auto;bottom:auto}",
    ".blakfy-overlay.widget.top-left{top:16px;left:16px;right:auto;bottom:auto}",
    ".blakfy-overlay.widget.center{top:50%;left:50%;right:auto;bottom:auto;transform:translate(-50%,-50%)}",
    // Card base (shared by banner + modal)
    ".blakfy-card{background:#fff;color:#222;border-radius:16px;max-width:560px;width:100%;padding:24px;border:3px solid var(--blakfy-accent,#3E5C3A);font-family:system-ui,-apple-system,sans-serif;line-height:1.5;position:relative}",
    ".blakfy-card[dir=rtl]{text-align:right}",
    ".blakfy-card h2{margin:0 0 12px;font-size:18px;font-weight:600}",
    ".blakfy-card p{margin:0 0 16px;font-size:14px;color:#444}",
    ".blakfy-card a{color:var(--blakfy-accent,#3E5C3A);text-decoration:underline}",
    // Horizontal banner layout (banner.js wraps content in .blakfy-banner-body)
    ".blakfy-banner-body{display:flex;flex-direction:row;align-items:center;gap:24px}",
    ".blakfy-banner-body .blakfy-card-text{flex:1;min-width:0}",
    ".blakfy-banner-body .blakfy-card-text h2{margin:0 0 4px;font-size:16px;font-weight:600}",
    ".blakfy-banner-body .blakfy-card-text p{margin:0;font-size:13px;color:#444}",
    ".blakfy-banner-body .blakfy-actions{flex-shrink:0;flex-direction:column;flex-wrap:nowrap;margin-top:0;gap:6px;min-width:156px}",
    ".blakfy-banner-body .blakfy-actions .blakfy-btn{flex:none;width:100%;min-width:0;min-height:38px;padding:8px 14px;font-size:13px}",
    ".blakfy-card[dir=rtl] .blakfy-banner-body{flex-direction:row-reverse}",
    // Actions (generic — used in modal + banner)
    ".blakfy-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}",
    // Buttons (3px radius per spec)
    ".blakfy-btn{flex:1;min-width:120px;min-height:44px;padding:12px 16px;border:1px solid #ddd;border-radius:3px;background:#fff;color:#222;font-size:14px;font-weight:500;cursor:pointer;transition:transform .1s,background .15s}",
    ".blakfy-btn:hover{transform:translateY(-1px)}",
    ".blakfy-btn-primary{background:var(--blakfy-accent,#3E5C3A);color:#fff;border-color:transparent}",
    ".blakfy-cat{padding:12px 0;border-top:1px solid #eee;display:flex;align-items:flex-start;gap:12px}",
    ".blakfy-cat:first-of-type{border-top:none}",
    ".blakfy-cat-text{flex:1}",
    ".blakfy-cat-text strong{display:block;font-size:14px;margin-bottom:2px}",
    ".blakfy-cat-text span{font-size:13px;color:#666}",
    // Switches (pill-shaped — UX standard)
    ".blakfy-switch{flex-shrink:0;width:44px;height:24px;border-radius:999px;background:#ccc;position:relative;cursor:pointer;border:none;padding:0}",
    ".blakfy-switch[aria-checked=true]{background:var(--blakfy-accent,#3E5C3A)}",
    ".blakfy-switch::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}",
    ".blakfy-switch[aria-checked=true]::after{transform:translateX(20px)}",
    ".blakfy-switch:disabled{opacity:.6;cursor:not-allowed}",
    ".blakfy-close{position:absolute;top:12px;right:12px;background:none;border:none;font-size:20px;cursor:pointer;color:#666;width:32px;height:32px;border-radius:50%}",
    ".blakfy-close:hover{background:#f3f3f3}",
    "[dir=rtl] .blakfy-close{right:auto;left:12px}",
    ".blakfy-badge{position:absolute;bottom:8px;right:12px;font-size:11px;opacity:0.6;transition:opacity 0.2s;display:flex !important;pointer-events:auto !important;align-items:center;gap:4px;color:#666;text-decoration:none}",
    ".blakfy-badge:hover{opacity:1}",
    "[dir=rtl] .blakfy-badge{right:auto;left:12px}",
    ".blakfy-status{position:fixed;bottom:0;left:0;right:0;z-index:2147483645;display:flex;align-items:center;gap:12px;padding:10px 20px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.5}",
    ".blakfy-status-msg{flex:1}",
    ".blakfy-status-dismiss{background:none;border:none;color:inherit;cursor:pointer;padding:4px 10px;border-radius:6px;font-size:16px;opacity:.8;line-height:1}",
    ".blakfy-status-dismiss:hover{opacity:1;background:rgba(255,255,255,.2)}",
    "@media (prefers-reduced-motion:reduce){.blakfy-btn,.blakfy-switch::after{transition:none}}",
    // Responsive breakpoints
    "@media (max-width:1024px){.blakfy-card{max-width:440px}}",
    // Tablet/mobile: banner collapses to vertical stack
    "@media (max-width:768px){.blakfy-card{max-width:calc(100vw - 32px);padding:18px}.blakfy-card h2{font-size:16px}.blakfy-card p{font-size:13px}.blakfy-btn{flex:1 1 100%;min-height:44px;padding:10px 14px;font-size:13px}.blakfy-overlay.widget.bottom-center,.blakfy-overlay.widget.top-center{left:16px;right:16px;transform:none}.blakfy-overlay.widget .blakfy-card{width:100%}.blakfy-banner-body{flex-direction:column;align-items:stretch;gap:12px}.blakfy-banner-body .blakfy-actions{min-width:auto;flex-direction:row;flex-wrap:wrap;gap:8px}.blakfy-banner-body .blakfy-actions .blakfy-btn{flex:1 1 100%;width:auto;min-height:44px;padding:10px 14px;font-size:13px}}",
    "@media (max-width:480px){.blakfy-overlay.widget .blakfy-card{width:100%;max-width:calc(100vw - 32px)}}"
  ];
  var injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const css = document.createElement("style");
    css.id = STYLE_ID;
    css.textContent = RULES.join("");
    document.head.appendChild(css);
  };

  // src/ui/banner.js
  var createBanner = ({ t, isRTL, accent, policyUrl, onAccept, onReject, onPrefs }) => {
    const card = document.createElement("div");
    card.className = "blakfy-card";
    card.setAttribute("dir", isRTL ? "rtl" : "ltr");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-labelledby", "blakfy-title");
    card.setAttribute("aria-describedby", "blakfy-desc");
    card.style.cssText = "--blakfy-accent:" + accent;
    const body = document.createElement("div");
    body.className = "blakfy-banner-body";
    const textBlock = document.createElement("div");
    textBlock.className = "blakfy-card-text";
    const h2 = document.createElement("h2");
    h2.id = "blakfy-title";
    h2.textContent = "\u{1F36A} " + t.title;
    textBlock.appendChild(h2);
    const p = document.createElement("p");
    p.id = "blakfy-desc";
    p.textContent = t.intro + " ";
    const a = document.createElement("a");
    a.href = policyUrl;
    a.textContent = t.policyLink;
    p.appendChild(a);
    textBlock.appendChild(p);
    body.appendChild(textBlock);
    const actions = document.createElement("div");
    actions.className = "blakfy-actions";
    const btnReject = document.createElement("button");
    btnReject.className = "blakfy-btn";
    btnReject.setAttribute("data-act", "reject");
    btnReject.textContent = t.rejectAll;
    btnReject.addEventListener("click", () => {
      if (onReject) onReject();
    });
    actions.appendChild(btnReject);
    const btnPrefs = document.createElement("button");
    btnPrefs.className = "blakfy-btn";
    btnPrefs.setAttribute("data-act", "prefs");
    btnPrefs.textContent = t.preferences;
    btnPrefs.addEventListener("click", () => {
      if (onPrefs) onPrefs();
    });
    actions.appendChild(btnPrefs);
    const btnAccept = document.createElement("button");
    btnAccept.className = "blakfy-btn blakfy-btn-primary";
    btnAccept.setAttribute("data-act", "accept");
    btnAccept.textContent = t.acceptAll;
    btnAccept.addEventListener("click", () => {
      if (onAccept) onAccept();
    });
    actions.appendChild(btnAccept);
    body.appendChild(actions);
    card.appendChild(body);
    const badgeSlot = document.createElement("div");
    badgeSlot.className = "blakfy-badge-slot";
    card.appendChild(badgeSlot);
    return card;
  };

  // src/ui/modal.js
  var CATEGORIES = ["essential", "analytics", "marketing", "functional"];
  var buildCatRow = (key, t, alwaysOn, checked) => {
    const c = t.cat[key];
    const row = document.createElement("div");
    row.className = "blakfy-cat";
    const text = document.createElement("div");
    text.className = "blakfy-cat-text";
    const strong = document.createElement("strong");
    strong.textContent = c.title;
    text.appendChild(strong);
    const span = document.createElement("span");
    span.textContent = c.desc + (alwaysOn ? " (" + (c.always || "") + ")" : "");
    text.appendChild(span);
    row.appendChild(text);
    const sw = document.createElement("button");
    sw.className = "blakfy-switch";
    sw.setAttribute("role", "switch");
    sw.setAttribute("aria-checked", checked ? "true" : "false");
    sw.setAttribute("data-cat", key);
    if (alwaysOn) sw.disabled = true;
    sw.addEventListener("click", () => {
      if (sw.disabled) return;
      const on = sw.getAttribute("aria-checked") === "true";
      sw.setAttribute("aria-checked", on ? "false" : "true");
    });
    row.appendChild(sw);
    return row;
  };
  var createModal = ({ t, isRTL, accent, currentState, onSave, onAccept, onClose }) => {
    const current = currentState || { analytics: false, marketing: false, functional: false };
    const card = document.createElement("div");
    card.className = "blakfy-card";
    card.setAttribute("dir", isRTL ? "rtl" : "ltr");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-labelledby", "blakfy-mtitle");
    card.style.cssText = "--blakfy-accent:" + accent + ";position:relative";
    const closeBtn = document.createElement("button");
    closeBtn.className = "blakfy-close";
    closeBtn.setAttribute("aria-label", t.close);
    closeBtn.setAttribute("data-act", "close");
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => {
      if (onClose) onClose();
    });
    card.appendChild(closeBtn);
    const h2 = document.createElement("h2");
    h2.id = "blakfy-mtitle";
    h2.textContent = t.title;
    card.appendChild(h2);
    card.appendChild(buildCatRow("essential", t, true, true));
    card.appendChild(buildCatRow("analytics", t, false, !!current.analytics));
    card.appendChild(buildCatRow("marketing", t, false, !!current.marketing));
    card.appendChild(buildCatRow("functional", t, false, !!current.functional));
    const actions = document.createElement("div");
    actions.className = "blakfy-actions";
    actions.style.marginTop = "16px";
    const btnSave = document.createElement("button");
    btnSave.className = "blakfy-btn";
    btnSave.setAttribute("data-act", "save");
    btnSave.textContent = t.save;
    btnSave.addEventListener("click", () => {
      const prefs = {};
      for (let i = 0; i < CATEGORIES.length; i++) {
        const k = CATEGORIES[i];
        if (k === "essential") continue;
        const sw = card.querySelector('[data-cat="' + k + '"]');
        prefs[k] = sw ? sw.getAttribute("aria-checked") === "true" : false;
      }
      if (onSave) onSave(prefs);
    });
    actions.appendChild(btnSave);
    const btnAccept = document.createElement("button");
    btnAccept.className = "blakfy-btn blakfy-btn-primary";
    btnAccept.setAttribute("data-act", "accept");
    btnAccept.textContent = t.acceptAll;
    btnAccept.addEventListener("click", () => {
      if (onAccept) onAccept();
    });
    actions.appendChild(btnAccept);
    card.appendChild(actions);
    const badgeSlot = document.createElement("div");
    badgeSlot.className = "blakfy-badge-slot";
    card.appendChild(badgeSlot);
    return card;
  };

  // src/ui/badge.js
  var BADGE_HREF = "https://blakfy.com";
  var BADGE_TEXT_PREFIX = "Powered by ";
  var BADGE_BRAND = "Blakfy Studio";
  var BADGE_CLASS = "blakfy-badge";
  var PROTECT_STYLE_ID = "blakfy-badge-protect";
  var PROTECT_CSS = ".blakfy-badge{display:flex !important;visibility:visible !important;opacity:0.6 !important;pointer-events:auto !important;}.blakfy-badge:hover{opacity:1 !important;}.blakfy-badge[hidden]{display:flex !important;}";
  var mountedBadges = /* @__PURE__ */ new Set();
  var slotMap = /* @__PURE__ */ new WeakMap();
  var observer = null;
  var intervalId = null;
  var rootRef = null;
  var buildBadge = () => {
    const a = document.createElement("a");
    a.href = BADGE_HREF;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = BADGE_CLASS;
    a.setAttribute("aria-label", "Powered by Blakfy Studio \u2014 opens in new tab");
    const prefix = document.createTextNode(BADGE_TEXT_PREFIX);
    a.appendChild(prefix);
    const strong = document.createElement("strong");
    strong.textContent = BADGE_BRAND;
    a.appendChild(strong);
    let cssText = "display: flex !important; align-items: center; gap: 4px;position: absolute; bottom: 8px; right: 12px;font-size: 11px; font-family: system-ui, -apple-system, sans-serif;color: inherit; text-decoration: none;opacity: 0.6 !important; transition: opacity 0.2s;pointer-events: auto !important;z-index: 1;";
    a.style.cssText = cssText;
    return a;
  };
  var applyRTL = (badge) => {
    const rtlAncestor = badge.closest && badge.closest("[dir=rtl]");
    if (rtlAncestor) {
      badge.style.right = "auto";
      badge.style.left = "12px";
    }
  };
  var injectProtectStyle = () => {
    if (typeof document === "undefined") return;
    if (document.getElementById(PROTECT_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PROTECT_STYLE_ID;
    style.textContent = PROTECT_CSS;
    (document.head || document.documentElement).appendChild(style);
  };
  var replaceBadge = (oldBadge) => {
    const slot = slotMap.get(oldBadge);
    const fresh = buildBadge();
    if (oldBadge.parentNode) {
      oldBadge.parentNode.replaceChild(fresh, oldBadge);
    } else if (slot && slot.isConnected) {
      slot.appendChild(fresh);
    } else if (rootRef) {
      rootRef.appendChild(fresh);
    }
    mountedBadges.delete(oldBadge);
    mountedBadges.add(fresh);
    if (slot) slotMap.set(fresh, slot);
    applyRTL(fresh);
    return fresh;
  };
  var reAttachBadge = (badge) => {
    const slot = slotMap.get(badge);
    if (badge.isConnected) return badge;
    const fresh = buildBadge();
    if (slot && slot.isConnected) {
      slot.appendChild(fresh);
    } else if (rootRef) {
      rootRef.appendChild(fresh);
    } else {
      return badge;
    }
    mountedBadges.delete(badge);
    mountedBadges.add(fresh);
    if (slot) slotMap.set(fresh, slot);
    applyRTL(fresh);
    return fresh;
  };
  var mountBadges = (rootEl) => {
    if (!rootEl) return [];
    rootRef = rootEl;
    const slots = rootEl.querySelectorAll(".blakfy-badge-slot");
    const result = [];
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const existing = slot.querySelector("." + BADGE_CLASS);
      if (existing) {
        mountedBadges.add(existing);
        slotMap.set(existing, slot);
        applyRTL(existing);
        result.push(existing);
        continue;
      }
      const badge = buildBadge();
      while (slot.firstChild) slot.removeChild(slot.firstChild);
      slot.appendChild(badge);
      mountedBadges.add(badge);
      slotMap.set(badge, slot);
      applyRTL(badge);
      result.push(badge);
    }
    return result;
  };
  var verifyBadges = () => {
    if (typeof window === "undefined" || !window.getComputedStyle) return;
    const snapshot = Array.from(mountedBadges);
    for (let i = 0; i < snapshot.length; i++) {
      const badge = snapshot[i];
      if (!badge.isConnected) {
        reAttachBadge(badge);
        continue;
      }
      const cs = window.getComputedStyle(badge);
      const opacity = parseFloat(cs.opacity);
      if (isFinite(opacity) && opacity < 0.5 || cs.display === "none" || cs.visibility === "hidden") {
        replaceBadge(badge);
      }
    }
    if (!document.getElementById(PROTECT_STYLE_ID)) {
      injectProtectStyle();
    }
  };
  var handleMutations = (records) => {
    let needsStyleReinject = false;
    const removedBadges = [];
    const mutatedBadges = [];
    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      if (rec.type === "childList") {
        for (let j = 0; j < rec.removedNodes.length; j++) {
          const node = rec.removedNodes[j];
          if (!node || node.nodeType !== 1) continue;
          if (node.id === PROTECT_STYLE_ID) {
            needsStyleReinject = true;
          }
          if (mountedBadges.has(node)) {
            removedBadges.push(node);
          } else if (node.querySelector) {
            const inner = node.querySelector("." + BADGE_CLASS);
            if (inner && mountedBadges.has(inner)) {
              removedBadges.push(inner);
            }
          }
        }
      } else if (rec.type === "attributes") {
        const target = rec.target;
        if (target && mountedBadges.has(target)) {
          mutatedBadges.push(target);
        }
      }
    }
    if (needsStyleReinject) {
      setTimeout(injectProtectStyle, 0);
    }
    if (removedBadges.length) {
      setTimeout(() => {
        for (let i = 0; i < removedBadges.length; i++) {
          reAttachBadge(removedBadges[i]);
        }
      }, 50);
    }
    for (let i = 0; i < mutatedBadges.length; i++) {
      replaceBadge(mutatedBadges[i]);
    }
  };
  var installAntiTamper = (rootEl) => {
    if (!rootEl || typeof MutationObserver === "undefined") return;
    rootRef = rootEl;
    injectProtectStyle();
    if (observer) observer.disconnect();
    observer = new MutationObserver(handleMutations);
    observer.observe(rootEl, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ["style", "class", "hidden"]
    });
    if (document.head) {
      observer.observe(document.head, { childList: true, subtree: false });
    }
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(verifyBadges, 2e3);
  };

  // src/ui/focus-trap.js
  var FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var activeRoot = null;
  var activeHandler = null;
  var activeEscape = null;
  var installFocusTrap = (rootEl, options) => {
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
  var removeFocusTrap = () => {
    if (activeHandler) {
      document.removeEventListener("keydown", activeHandler);
    }
    activeRoot = null;
    activeHandler = null;
    activeEscape = null;
  };

  // src/ui/status-bar.js
  var STATUS_COLORS = {
    info: "#1a56db",
    warning: "#b45309",
    error: "#dc2626",
    success: "#057a55",
    maintenance: "#6d28d9"
  };
  var statusRoot = null;
  var statusData = null;
  var resolveStatusMessage = (data, currentLocale, mainLang) => {
    const msgs = data && data.message;
    if (!msgs) return null;
    return msgs[currentLocale] || msgs[mainLang] || msgs["en"] || msgs[Object.keys(msgs)[0]] || null;
  };
  var dismissKey = (data) => "blakfy_status_" + (data && data._id || "default");
  var dismissStatus = () => {
    if (!statusRoot) return;
    try {
      sessionStorage.setItem(dismissKey(statusData), "1");
    } catch (e) {
    }
    if (statusRoot.parentNode) statusRoot.parentNode.removeChild(statusRoot);
    statusRoot = null;
    statusData = null;
  };
  var renderStatus = ({ data, currentLocale, mainLang }) => {
    const msg = resolveStatusMessage(data, currentLocale, mainLang);
    if (!msg) return;
    try {
      if (sessionStorage.getItem(dismissKey(data)) === "1") return;
    } catch (e) {
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
    btn.textContent = "\u2715";
    btn.addEventListener("click", dismissStatus);
    root.appendChild(btn);
    document.body.appendChild(root);
    statusRoot = root;
    statusData = data;
  };
  var fetchStatus = (url) => {
    if (!url) return Promise.resolve(null);
    return fetch(url + (url.indexOf("?") > -1 ? "&" : "?") + "_=" + Date.now(), { cache: "no-store" }).then((r) => r.json()).then((data) => {
      if (!data || !data.active) return null;
      if (data.expires && new Date(data.expires) < /* @__PURE__ */ new Date()) return null;
      data._id = (data.expires || "") + (data.type || "");
      return data;
    }).catch(() => null);
  };

  // src/gating/script-unblocker.js
  var SKIP_ATTRS = { type: 1 };
  var isSkippedAttr = (name) => {
    if (SKIP_ATTRS[name]) return true;
    if (name.indexOf("data-blakfy-") === 0) return true;
    return false;
  };
  var unblockScripts = (category) => {
    if (typeof document === "undefined" || !category) return 0;
    const sel = 'script[type="text/plain"][data-blakfy-category="' + category + '"]:not([data-blakfy-unblocked="true"])';
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

  // src/gating/placeholder.js
  var fmt = (tpl, vars) => {
    if (!tpl) return "";
    return tpl.replace(/\{(\w+)\}/g, (_, k) => vars && vars[k] != null ? vars[k] : "{" + k + "}");
  };
  var createPlaceholder = ({ category, srcUrl, t, onAccept }) => {
    const ph = t && t.placeholder || {};
    const titleText = ph.title || "Content blocked";
    const descText = fmt(ph.desc || "Allow {category} cookies to view this content.", { category: category || "" });
    const ctaText = ph.cta || "Allow";
    const wrap = document.createElement("div");
    wrap.className = "blakfy-placeholder";
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", titleText);
    wrap.style.cssText = [
      "box-sizing:border-box",
      "display:flex",
      "flex-direction:column",
      "align-items:center",
      "justify-content:center",
      "gap:12px",
      "padding:24px",
      "min-height:200px",
      "width:100%",
      "border:1px solid #d0d7de",
      "border-radius:12px",
      "background:#f6f8fa",
      "color:#1f2328",
      "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
      "font-size:14px",
      "line-height:1.5",
      "text-align:center"
    ].join(";");
    const icon = document.createElement("div");
    icon.setAttribute("aria-hidden", "true");
    icon.style.cssText = "font-size:28px;line-height:1";
    icon.textContent = "\u{1F512}";
    wrap.appendChild(icon);
    const title = document.createElement("div");
    title.style.cssText = "font-weight:600;font-size:16px;color:#1f2328";
    title.textContent = titleText;
    wrap.appendChild(title);
    const desc = document.createElement("div");
    desc.style.cssText = "max-width:420px;color:#57606a";
    desc.textContent = descText;
    wrap.appendChild(desc);
    if (srcUrl) {
      const host = document.createElement("div");
      host.style.cssText = "font-size:12px;color:#8c959f;word-break:break-all";
      try {
        const u = new URL(srcUrl);
        host.textContent = u.hostname;
      } catch (e) {
        host.textContent = srcUrl;
      }
      wrap.appendChild(host);
    }
    const cta = document.createElement("button");
    cta.type = "button";
    cta.className = "blakfy-placeholder-cta";
    cta.textContent = ctaText;
    cta.style.cssText = [
      "appearance:none",
      "border:0",
      "border-radius:8px",
      "padding:10px 18px",
      "background:#1f6feb",
      "color:#ffffff",
      "font-weight:600",
      "font-size:14px",
      "cursor:pointer",
      "margin-top:4px"
    ].join(";");
    cta.addEventListener("click", () => {
      if (typeof onAccept === "function") {
        try {
          onAccept(category);
        } catch (e) {
        }
      }
    });
    wrap.appendChild(cta);
    return wrap;
  };

  // src/gating/iframe-unblocker.js
  var unblockIframes = (category) => {
    if (typeof document === "undefined" || !category) return 0;
    const sel = 'iframe[data-blakfy-src][data-blakfy-category="' + category + '"]:not([data-blakfy-unblocked="true"])';
    const nodes = document.querySelectorAll(sel);
    let count = 0;
    for (let i = 0; i < nodes.length; i++) {
      const ifr = nodes[i];
      const src = ifr.getAttribute("data-blakfy-src");
      if (!src) continue;
      const phId = ifr.getAttribute("data-blakfy-placeholder-id");
      if (phId) {
        const ph = document.getElementById(phId);
        if (ph && ph.parentNode) ph.parentNode.removeChild(ph);
        ifr.removeAttribute("data-blakfy-placeholder-id");
      }
      ifr.src = src;
      ifr.style.display = "";
      ifr.setAttribute("data-blakfy-unblocked", "true");
      count++;
    }
    return count;
  };
  var installPlaceholders = (t, onAccept) => {
    if (typeof document === "undefined") return 0;
    const sel = 'iframe[data-blakfy-src][data-blakfy-category][data-blakfy-placeholder="auto"]:not([data-blakfy-unblocked="true"]):not([data-blakfy-placeholder-installed="true"])';
    const nodes = document.querySelectorAll(sel);
    let count = 0;
    for (let i = 0; i < nodes.length; i++) {
      const ifr = nodes[i];
      const category = ifr.getAttribute("data-blakfy-category");
      const srcUrl = ifr.getAttribute("data-blakfy-src") || "";
      const ph = createPlaceholder({
        category,
        srcUrl,
        t,
        onAccept
      });
      const phId = "blakfy-ph-" + Math.random().toString(36).slice(2, 10);
      ph.id = phId;
      ifr.setAttribute("data-blakfy-placeholder-id", phId);
      ifr.setAttribute("data-blakfy-placeholder-installed", "true");
      ifr.style.display = "none";
      if (ifr.parentNode) {
        ifr.parentNode.insertBefore(ph, ifr);
        count++;
      }
    }
    return count;
  };

  // src/gating/observer.js
  var activeObserver = null;
  var isBlockedScript = (node) => {
    return node && node.nodeType === 1 && node.tagName === "SCRIPT" && node.getAttribute && node.getAttribute("type") === "text/plain" && node.getAttribute("data-blakfy-category");
  };
  var isBlockedIframe = (node) => {
    return node && node.nodeType === 1 && node.tagName === "IFRAME" && node.getAttribute && node.getAttribute("data-blakfy-src") && node.getAttribute("data-blakfy-category");
  };
  var collectCategoriesFromNode = (node, set) => {
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
  var startObserver = ({ getConsent, onScan }) => {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") return null;
    if (activeObserver) stopObserver();
    const obs = new MutationObserver((mutations) => {
      const seen = /* @__PURE__ */ Object.create(null);
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
            try {
              onScan(cat);
            } catch (e) {
            }
          }
        }
      }
    });
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    activeObserver = obs;
    return obs;
  };
  var stopObserver = () => {
    if (activeObserver) {
      try {
        activeObserver.disconnect();
      } catch (e) {
      }
      activeObserver = null;
    }
  };
  var scanAll = ({ getConsent, categories }) => {
    if (typeof document === "undefined") return [];
    const list = Array.isArray(categories) && categories.length ? categories : ["essential", "analytics", "marketing", "functional", "recording"];
    const granted = [];
    for (let i = 0; i < list.length; i++) {
      const cat = list[i];
      if (typeof getConsent === "function" && getConsent(cat)) {
        granted.push(cat);
      }
    }
    return granted;
  };

  // src/gating/cleaner.js
  var rules = /* @__PURE__ */ new Map();
  var ensure = (category) => {
    if (!rules.has(category)) rules.set(category, []);
    return rules.get(category);
  };
  var registerCleanup = ({ category, cookies, storage }) => {
    if (!category) return;
    const list = ensure(category);
    list.push({
      cookies: Array.isArray(cookies) ? cookies.slice() : [],
      storage: Array.isArray(storage) ? storage.slice() : []
    });
  };
  var getRootDomain = (host) => {
    if (!host) return "";
    const parts = host.split(".");
    if (parts.length <= 2) return host;
    return parts.slice(-2).join(".");
  };
  var expireCookie = (name) => {
    if (typeof document === "undefined") return;
    const host = typeof location !== "undefined" && location.hostname || "";
    const root = getRootDomain(host);
    const past = "Thu, 01 Jan 1970 00:00:00 GMT";
    try {
      document.cookie = name + "=; expires=" + past + "; path=/";
    } catch (e) {
    }
    if (host) {
      try {
        document.cookie = name + "=; expires=" + past + "; path=/; domain=" + host;
      } catch (e) {
      }
      try {
        document.cookie = name + "=; expires=" + past + "; path=/; domain=." + host;
      } catch (e) {
      }
    }
    if (root && root !== host) {
      try {
        document.cookie = name + "=; expires=" + past + "; path=/; domain=" + root;
      } catch (e) {
      }
      try {
        document.cookie = name + "=; expires=" + past + "; path=/; domain=." + root;
      } catch (e) {
      }
    }
  };
  var readCookieNames = () => {
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
  var runCleanup = (category) => {
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
        }
      }
    }
    return { cookies: cookieCount, storage: storageCount };
  };

  // src/presets/google-analytics.js
  var google_analytics_default = {
    name: "Google Analytics 4",
    category: "analytics",
    cookies: [/^_ga/, "_gid", "_gat", /^_ga_/],
    storage: [],
    scriptHosts: ["www.googletagmanager.com", "google-analytics.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/google-tag-manager.js
  var google_tag_manager_default = {
    name: "Google Tag Manager",
    category: "analytics",
    cookies: ["_gtm", /^_dc_gtm/],
    storage: [],
    scriptHosts: ["www.googletagmanager.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/google-maps.js
  var google_maps_default = {
    name: "Google Maps",
    category: "functional",
    cookies: [],
    storage: [],
    scriptHosts: ["maps.googleapis.com", "maps.gstatic.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/google-recaptcha.js
  var google_recaptcha_default = {
    name: "Google reCAPTCHA",
    category: "functional",
    cookies: ["_GRECAPTCHA"],
    storage: [],
    scriptHosts: ["www.google.com/recaptcha", "www.gstatic.com/recaptcha"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/facebook-pixel.js
  var facebook_pixel_default = {
    name: "Facebook Pixel",
    category: "marketing",
    cookies: ["_fbp", "_fbc"],
    storage: [],
    scriptHosts: ["connect.facebook.net"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/youtube.js
  var youtube_default = {
    name: "YouTube",
    category: "marketing",
    cookies: [],
    storage: [],
    scriptHosts: ["www.youtube.com", "youtube-nocookie.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/vimeo.js
  var vimeo_default = {
    name: "Vimeo",
    category: "marketing",
    cookies: [],
    storage: [],
    scriptHosts: ["player.vimeo.com", "vimeo.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/hotjar.js
  var hotjar_default = {
    name: "Hotjar",
    category: "analytics",
    cookies: [/^_hj/],
    storage: [],
    scriptHosts: ["static.hotjar.com", "script.hotjar.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/microsoft-clarity.js
  var microsoft_clarity_default = {
    name: "Microsoft Clarity",
    category: "analytics",
    cookies: ["_clck", "_clsk", "CLID", "MR", "MUID", "SM"],
    storage: [],
    scriptHosts: ["www.clarity.ms", "c.clarity.ms"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/linkedin-insight.js
  var linkedin_insight_default = {
    name: "LinkedIn Insight Tag",
    category: "marketing",
    cookies: ["li_sugr", "bcookie", "lidc", "UserMatchHistory", "AnalyticsSyncHistory"],
    storage: [],
    scriptHosts: ["snap.licdn.com", "px.ads.linkedin.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/yandex-metrica.js
  var yandex_metrica_default = {
    name: "Yandex Metrica",
    category: "analytics",
    subCategory: "recording",
    cookies: [/^_ym/, "yandexuid", "yabs-frequency"],
    storage: [],
    scriptHosts: ["mc.yandex.ru", "mc.webvisor.com", "mc.yandex.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/bing-ads-uet.js
  var bing_ads_uet_default = {
    name: "Bing Ads UET",
    category: "marketing",
    cookies: ["MUID", "_uetsid", "_uetvid"],
    storage: [],
    scriptHosts: ["bat.bing.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/tiktok-pixel.js
  var tiktok_pixel_default = {
    name: "TikTok Pixel",
    category: "marketing",
    cookies: ["_ttp"],
    storage: [],
    scriptHosts: ["analytics.tiktok.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/pinterest-tag.js
  var pinterest_tag_default = {
    name: "Pinterest Tag",
    category: "marketing",
    cookies: ["_pinterest_ct", "_pinterest_sess"],
    storage: [],
    scriptHosts: ["s.pinimg.com", "ct.pinterest.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/tawk-to.js
  var tawk_to_default = {
    name: "Tawk.to",
    category: "functional",
    cookies: ["TawkConnectionTime", /^__tawkuuid/, /^Tawk_/],
    storage: [],
    scriptHosts: ["embed.tawk.to"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/intercom.js
  var intercom_default = {
    name: "Intercom",
    category: "functional",
    cookies: [/^intercom-/],
    storage: [],
    scriptHosts: ["widget.intercom.io", "js.intercomcdn.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/hubspot.js
  var hubspot_default = {
    name: "HubSpot",
    category: "marketing",
    cookies: ["__hstc", "__hssc", "__hssrc", "hubspotutk", "messagesUtk"],
    storage: [],
    scriptHosts: ["js.hs-scripts.com", "js.hs-analytics.net"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/mailchimp.js
  var mailchimp_default = {
    name: "Mailchimp",
    category: "marketing",
    cookies: [/^_mcid/, "ak_bmsc", "_mcvisit"],
    storage: [],
    scriptHosts: ["chimpstatic.com"],
    onGrant: (state) => {
    },
    onRevoke: (state) => {
    }
  };

  // src/presets/_registry.js
  var PRESETS = {
    ga4: google_analytics_default,
    gtm: google_tag_manager_default,
    maps: google_maps_default,
    recaptcha: google_recaptcha_default,
    facebook: facebook_pixel_default,
    youtube: youtube_default,
    vimeo: vimeo_default,
    hotjar: hotjar_default,
    clarity: microsoft_clarity_default,
    linkedin: linkedin_insight_default,
    yandex: yandex_metrica_default,
    bing: bing_ads_uet_default,
    tiktok: tiktok_pixel_default,
    pinterest: pinterest_tag_default,
    tawkto: tawk_to_default,
    intercom: intercom_default,
    hubspot: hubspot_default,
    mailchimp: mailchimp_default
  };
  var applyPreset = (name, { registerCleanup: registerCleanup2 }) => {
    const preset = PRESETS[name];
    if (!preset) return null;
    if (typeof registerCleanup2 === "function") {
      registerCleanup2({
        category: preset.category,
        cookies: preset.cookies || [],
        storage: preset.storage || []
      });
      if (preset.subCategory) {
        registerCleanup2({
          category: preset.subCategory,
          cookies: preset.cookies || [],
          storage: preset.storage || []
        });
      }
    }
    return preset;
  };

  // src/compliance/google-cmv2.js
  var defaultsInstalled = false;
  var installDefaults = () => {
    if (typeof window === "undefined") return;
    if (defaultsInstalled) return;
    defaultsInstalled = true;
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
    }
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500
    });
  };
  var pushGCM = (state) => {
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;
    const s = state || {};
    const m = s.marketing ? "granted" : "denied";
    const a = s.analytics ? "granted" : "denied";
    const f = s.functional ? "granted" : "denied";
    window.gtag("consent", "update", {
      ad_storage: m,
      ad_user_data: m,
      ad_personalization: m,
      analytics_storage: a,
      functionality_storage: f,
      personalization_storage: f,
      security_storage: "granted"
    });
  };

  // src/compliance/microsoft-uet.js
  var defaultsInstalled2 = false;
  var installDefaults2 = () => {
    if (typeof window === "undefined") return;
    if (defaultsInstalled2) return;
    defaultsInstalled2 = true;
    window.uetq = window.uetq || [];
    window.uetq.push("consent", "default", { ad_storage: "denied" });
  };
  var pushUET = (state) => {
    if (typeof window === "undefined") return;
    const s = state || {};
    window.uetq = window.uetq || [];
    window.uetq.push("consent", "update", {
      ad_storage: s.marketing ? "granted" : "denied"
    });
  };

  // src/compliance/yandex-metrica.js
  var defaultsInstalled3 = false;
  var installDefaults3 = () => {
    if (typeof window === "undefined") return;
    if (defaultsInstalled3) return;
    defaultsInstalled3 = true;
    if (typeof window.ym !== "function") {
      window.ym = function() {
      };
      window.ym.__blakfyStub = true;
    }
  };
  var applyYandex = (state, ctx) => {
    const s = state || {};
    const unblock = ctx && ctx.unblock;
    if (typeof unblock !== "function") return;
    if (s.analytics === true) unblock("analytics");
    if (s.recording === true) unblock("recording");
  };

  // src/compliance/tcf-v2.js
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  var lastTCString = "";
  var vendorList = null;
  var bitsToB64 = (bits) => {
    const pad = (6 - bits.length % 6) % 6;
    const padded = bits + "0".repeat(pad);
    let out = "";
    for (let i = 0; i < padded.length; i += 6) {
      out += B64.charAt(parseInt(padded.substr(i, 6), 2));
    }
    return out;
  };
  var intToBits = (n, width) => {
    let s = (n >>> 0).toString(2);
    if (s.length > width) s = s.slice(-width);
    return s.padStart(width, "0");
  };
  var bigIntToBits = (n, width) => {
    const v = BigInt(Math.max(0, Math.floor(Number(n) / 100)));
    let s = v.toString(2);
    if (s.length > width) s = s.slice(-width);
    return s.padStart(width, "0");
  };
  var charToBits = (c) => intToBits(c.toUpperCase().charCodeAt(0) - 65, 6);
  var langToBits = (lang) => charToBits((lang || "EN").charAt(0)) + charToBits((lang || "EN").charAt(1));
  var buildPurposes = (state) => {
    const out = new Array(24).fill(0);
    out[0] = 1;
    if (state && state.analytics) {
      out[1] = 1;
      out[2] = 1;
      out[3] = 1;
    }
    if (state && state.marketing) {
      out[4] = 1;
      out[5] = 1;
      out[6] = 1;
      out[7] = 1;
      out[8] = 1;
    }
    if (state && state.functional) {
      out[9] = 1;
    }
    return out.join("");
  };
  var buildTCString = (opts) => {
    const o = opts || {};
    const cmpId = o.cmpId | 0;
    const cmpVersion2 = o.cmpVersion | 0;
    const now = Date.now();
    const created = bigIntToBits(now, 36);
    const lastUpdated = bigIntToBits(now, 36);
    const purposesConsent = o.purposeConsents || buildPurposes(o.state);
    const purposesLI = "0".repeat(24);
    const core = intToBits(2, 6) + created + lastUpdated + intToBits(cmpId, 12) + intToBits(cmpVersion2, 12) + intToBits(1, 6) + langToBits(o.consentLanguage || "EN") + intToBits(o.vendorListVersion || 300, 12) + intToBits(4, 6) + "10" + "0".repeat(12) + purposesConsent + purposesLI + "0" + charToBits("A") + charToBits("A") + intToBits(0, 16) + intToBits(0, 16) + "1" + intToBits(0, 12) + intToBits(0, 16) + intToBits(0, 16) + "1" + intToBits(0, 12);
    return bitsToB64(core);
  };
  var getTCString = () => lastTCString;
  var buildPurposeMap = (state) => {
    const consents = {};
    const li = {};
    const s = state || {};
    for (let i = 1; i <= 11; i++) {
      consents[i] = false;
      li[i] = false;
    }
    consents[1] = true;
    if (s.analytics) {
      consents[2] = true;
      consents[3] = true;
      consents[4] = true;
    }
    if (s.marketing) {
      consents[5] = true;
      consents[6] = true;
      consents[7] = true;
      consents[8] = true;
      consents[9] = true;
    }
    if (s.functional) {
      consents[10] = true;
    }
    return { consents, legitimateInterests: li };
  };
  var installTCFAPI = (opts) => {
    if (typeof window === "undefined") return;
    const o = opts || {};
    const cmpId = o.cmpId | 0;
    const cmpVersion2 = o.cmpVersion | 0;
    const getConsent = typeof o.getConsent === "function" ? o.getConsent : () => ({});
    const subscribe = typeof o.on === "function" ? o.on : null;
    const listeners2 = /* @__PURE__ */ Object.create(null);
    let nextId = 1;
    let displayStatus = "hidden";
    let eventStatus = "tcloaded";
    const buildTCData = (listenerId) => {
      const state = getConsent() || {};
      const purposes = buildPurposeMap(state);
      lastTCString = buildTCString({ cmpId, cmpVersion: cmpVersion2, state });
      return {
        tcString: lastTCString,
        eventStatus,
        cmpId,
        cmpVersion: cmpVersion2,
        gdprApplies: true,
        listenerId: typeof listenerId === "number" ? listenerId : null,
        addtlConsent: "",
        purpose: purposes,
        vendor: { consents: {}, legitimateInterests: {} }
      };
    };
    const buildPing = () => ({
      gdprApplies: true,
      cmpLoaded: true,
      cmpStatus: "loaded",
      displayStatus,
      apiVersion: "2.2",
      cmpVersion: cmpVersion2,
      cmpId,
      gvlVersion: vendorList && vendorList.vendorListVersion ? vendorList.vendorListVersion : 0,
      tcfPolicyVersion: 4
    });
    const handle = (command, version, callback, parameter) => {
      if (typeof callback !== "function") return;
      if (command === "ping") {
        callback(buildPing(), true);
        return;
      }
      if (command === "getTCData") {
        callback(buildTCData(null), true);
        return;
      }
      if (command === "addEventListener") {
        const id = nextId++;
        listeners2[id] = callback;
        callback(buildTCData(id), true);
        return;
      }
      if (command === "removeEventListener") {
        if (listeners2[parameter]) {
          delete listeners2[parameter];
          callback(true, true);
        } else callback(false, true);
        return;
      }
      callback(null, false);
    };
    if (!window.__tcfapi || !window.__tcfapi.__blakfy) {
      window.__tcfapi = (cmd, ver, cb, param) => handle(cmd, ver, cb, param);
      window.__tcfapi.__blakfy = true;
    }
    if (typeof document !== "undefined" && !document.querySelector('iframe[name="__tcfapiLocator"]')) {
      try {
        const iframe = document.createElement("iframe");
        iframe.style.cssText = "display:none;position:absolute;width:0;height:0;border:0";
        iframe.name = "__tcfapiLocator";
        (document.body || document.documentElement).appendChild(iframe);
      } catch (e) {
      }
    }
    if (!window.__blakfyTcfMsg) {
      window.__blakfyTcfMsg = true;
      window.addEventListener("message", (ev) => {
        const data = ev && ev.data;
        if (!data) return;
        const payload = typeof data === "string" ? safeParse(data) : data;
        if (!payload || !payload.__tcfapiCall) return;
        const call = payload.__tcfapiCall;
        handle(call.command, call.version, (returnValue, success) => {
          const msg = { __tcfapiReturn: { returnValue, success, callId: call.callId } };
          try {
            ev.source && ev.source.postMessage(msg, ev.origin || "*");
          } catch (e) {
          }
        }, call.parameter);
      });
    }
    const fireAll = () => {
      const ids = Object.keys(listeners2);
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        try {
          listeners2[id](buildTCData(parseInt(id, 10)), true);
        } catch (e) {
        }
      }
    };
    if (subscribe) {
      subscribe("change", () => {
        eventStatus = "useractioncomplete";
        fireAll();
      });
      subscribe("display", (visible) => {
        displayStatus = visible ? "visible" : "hidden";
        fireAll();
      });
    }
    return { fireAll };
  };
  var safeParse = (s) => {
    try {
      return JSON.parse(s);
    } catch (e) {
      return null;
    }
  };

  // src/compliance/ccpa.js
  var optedOutFlag = false;
  var noticeGiven = true;
  var cmpVersion = 1;
  var listeners = [];
  var installed = false;
  var buildUSPString = (opts) => {
    const o = opts || {};
    const version = o.version || 1;
    const notice = o.notice === false ? "N" : o.notice === null ? "-" : "Y";
    const optOut2 = o.optedOut === true ? "Y" : o.optedOut === null ? "-" : "N";
    const lspa = o.lspa === true ? "Y" : o.lspa === null ? "-" : "N";
    return String(version) + notice + optOut2 + lspa;
  };
  var currentString = () => buildUSPString({ version: cmpVersion, notice: noticeGiven, optedOut: optedOutFlag, lspa: false });
  var fireListeners = () => {
    const data = { version: cmpVersion, uspString: currentString() };
    for (let i = 0; i < listeners.length; i++) {
      try {
        listeners[i].cb(data, true);
      } catch (e) {
      }
    }
  };
  var installUSP = (opts) => {
    if (typeof window === "undefined") return;
    const o = opts || {};
    if (typeof o.optedOut === "boolean") optedOutFlag = o.optedOut;
    if (typeof o.notice === "boolean") noticeGiven = o.notice;
    if (installed) return;
    installed = true;
    window.__uspapi = (command, version, callback) => {
      if (typeof callback !== "function") return;
      if (command === "getUSPData") {
        callback({ version: cmpVersion, uspString: currentString() }, true);
        return;
      }
      callback(null, false);
    };
    if (typeof document !== "undefined" && !document.querySelector('iframe[name="__uspapiLocator"]')) {
      try {
        const iframe = document.createElement("iframe");
        iframe.style.cssText = "display:none;position:absolute;width:0;height:0;border:0";
        iframe.name = "__uspapiLocator";
        (document.body || document.documentElement).appendChild(iframe);
      } catch (e) {
      }
    }
  };
  var optOut = () => {
    optedOutFlag = true;
    noticeGiven = true;
    fireListeners();
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("blakfy:ccpa:optout", { detail: { uspString: currentString() } }));
      } catch (e) {
      }
    }
  };
  var isOptedOut = () => optedOutFlag === true;
  var installDoNotSellLink = (opts) => {
    if (typeof document === "undefined") return null;
    const o = opts || {};
    const container = o.container || document.body;
    if (!container) return null;
    const existing = container.querySelector(".blakfy-ccpa-link");
    if (existing) return existing;
    const t = o.t || {};
    const label = t.ccpa && t.ccpa.doNotSell || "Do Not Sell or Share My Personal Information";
    const a = document.createElement("a");
    a.className = "blakfy-ccpa-link";
    a.href = "#";
    a.setAttribute("role", "button");
    a.textContent = label;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      optOut();
    });
    container.appendChild(a);
    return a;
  };

  // src/compliance/gpc.js
  var getGPC = () => {
    if (typeof navigator !== "undefined" && navigator.globalPrivacyControl === true) return true;
    if (typeof document !== "undefined" && document.documentElement && document.documentElement.dataset && document.documentElement.dataset.gpc === "1") return true;
    return false;
  };
  var applyGPC = (opts) => {
    const o = opts || {};
    const mode = o.mode || "respect";
    const currentState = o.currentState || null;
    const setPrefs = typeof o.setPrefs === "function" ? o.setPrefs : null;
    if (mode !== "respect") return { applied: false, reason: "mode-disabled" };
    if (!getGPC()) return { applied: false, reason: "no-gpc-signal" };
    if (currentState && currentState.explicit === true) {
      return { applied: false, reason: "user-already-consented" };
    }
    if (setPrefs) setPrefs({ analytics: false, marketing: false });
    return { applied: true, reason: "gpc-auto-deny" };
  };

  // src/compliance/dnt.js
  var getDNT = () => {
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return true;
    if (typeof window !== "undefined" && window.doNotTrack === "1") return true;
    return false;
  };
  var applyDNT = (opts) => {
    const o = opts || {};
    const mode = o.mode || "respect";
    const setPrefs = typeof o.setPrefs === "function" ? o.setPrefs : null;
    if (!getDNT()) return { applied: false, reason: "no-dnt-signal" };
    if (mode === "auto-deny") {
      if (setPrefs) setPrefs({ analytics: false, marketing: false });
      return { applied: true, reason: "dnt-auto-deny" };
    }
    return { applied: false, reason: "dnt-ui-hint-only" };
  };

  // src/geo/jurisdiction.js
  var EU_COUNTRIES = [
    "AT",
    "BE",
    "BG",
    "HR",
    "CY",
    "CZ",
    "DK",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "HU",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PL",
    "PT",
    "RO",
    "SK",
    "SI",
    "ES",
    "SE",
    "NO",
    "IS",
    "LI",
    "GB",
    "UK",
    "CH"
  ];
  var mapCountryToJurisdiction = (country, region) => {
    if (!country) return "default";
    const c = String(country).toUpperCase();
    const r = region ? String(region).toUpperCase() : "";
    if (EU_COUNTRIES.indexOf(c) !== -1) return "GDPR";
    if (c === "TR") return "GDPR";
    if (c === "BR") return "LGPD";
    if (c === "US" && r === "CA") return "CCPA";
    return "default";
  };
  var tzGuess = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz.indexOf("Europe/") === 0) return "GDPR";
      if (tz === "America/Los_Angeles" || tz === "America/Tijuana") return "CCPA";
      if (tz === "America/Sao_Paulo") return "LGPD";
      return "default";
    } catch (e) {
      return "default";
    }
  };
  var detectJurisdiction = async (opts) => {
    const o = opts || {};
    if (typeof document !== "undefined" && document.documentElement && document.documentElement.dataset && document.documentElement.dataset.jurisdiction) {
      const v = document.documentElement.dataset.jurisdiction;
      if (v === "GDPR" || v === "CCPA" || v === "LGPD" || v === "default") return v;
    }
    if (o.geoEndpoint && typeof fetch === "function") {
      try {
        const res = await fetch(o.geoEndpoint, { credentials: "omit" });
        if (res && res.ok) {
          const data = await res.json();
          return mapCountryToJurisdiction(data && data.country, data && data.region);
        }
      } catch (e) {
      }
    }
    return tzGuess();
  };

  // src/core/audit.js
  var postAudit = (endpoint, payload) => {
    if (!endpoint) return;
    try {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {
      });
    } catch (e) {
    }
  };

  // src/api.js
  var VERSION = "2.0.4";
  var CATEGORIES2 = ["analytics", "marketing", "functional", "recording"];
  var createAPI = (ctx) => {
    const { config, emitter, deps } = ctx;
    let state = ctx.state || null;
    let currentLocale = ctx.locale;
    let mainLang = ctx.mainLang;
    let jurisdiction = ctx.jurisdiction || "default";
    let t = getTranslation(currentLocale);
    let modalRoot = null;
    let bannerRoot = null;
    const setUI = (which, root) => {
      if (which === "modal") modalRoot = root;
      if (which === "banner") bannerRoot = root;
    };
    const closeUI = () => {
      if (typeof document !== "undefined") {
        const overlays = document.querySelectorAll(".blakfy-overlay");
        for (let i = 0; i < overlays.length; i++) {
          const o = overlays[i];
          if (o && o.parentNode) o.parentNode.removeChild(o);
        }
      }
      modalRoot = null;
      bannerRoot = null;
      if (deps && typeof deps.removeFocusTrap === "function") deps.removeFocusTrap();
    };
    const getConsent = (cat) => {
      if (cat === "essential") return true;
      return state ? !!state[cat] : false;
    };
    const grantedCategories = (s) => {
      const out = [];
      if (!s) return out;
      for (let i = 0; i < CATEGORIES2.length; i++) {
        if (s[CATEGORIES2[i]]) out.push(CATEGORIES2[i]);
      }
      return out;
    };
    const commit = (prefs, action) => {
      const prevState = state;
      const prevGranted = grantedCategories(prevState);
      const next = buildState({
        prefs: prefs || {},
        currentLocale,
        mainLang,
        policyVersion: config.policyVersion,
        jurisdiction,
        tcString: deps && typeof deps.getTCString === "function" ? deps.getTCString() : null,
        uspString: null,
        prevId: prevState && prevState.id
      });
      state = next;
      try {
        writeCookie(state);
      } catch (e) {
      }
      if (config.auditEndpoint) {
        postAudit(config.auditEndpoint, {
          id: state.id,
          action: action || "save",
          timestamp: state.timestamp,
          version: state.version,
          jurisdiction: state.jurisdiction,
          consent: {
            analytics: state.analytics,
            marketing: state.marketing,
            functional: state.functional,
            recording: state.recording
          }
        });
      }
      if (deps && typeof deps.pushGCM === "function") deps.pushGCM(state);
      if (deps && typeof deps.pushUET === "function") deps.pushUET(state);
      if (deps && typeof deps.applyYandex === "function") {
        deps.applyYandex(state, {
          unblock: (cat) => {
            if (deps.unblockScripts) deps.unblockScripts(cat);
            if (deps.unblockIframes) deps.unblockIframes(cat);
          },
          runCleanup: deps.runCleanup
        });
      }
      const nowGranted = grantedCategories(state);
      for (let i = 0; i < nowGranted.length; i++) {
        const cat = nowGranted[i];
        if (deps && deps.unblockScripts) deps.unblockScripts(cat);
        if (deps && deps.unblockIframes) deps.unblockIframes(cat);
      }
      for (let j = 0; j < prevGranted.length; j++) {
        const c = prevGranted[j];
        if (nowGranted.indexOf(c) === -1) {
          if (deps && typeof deps.runCleanup === "function") deps.runCleanup(c);
        }
      }
      emitter.emit("change", state);
      for (let k = 0; k < CATEGORIES2.length; k++) {
        const cat = CATEGORIES2[k];
        const wasGranted = prevGranted.indexOf(cat) > -1;
        const isGranted = nowGranted.indexOf(cat) > -1;
        if (!wasGranted && isGranted) emitter.emit("consent:" + cat, true);
        if (wasGranted && !isGranted) emitter.emit("consent:" + cat, false);
      }
      closeUI();
    };
    const acceptAll = () => commit({ analytics: true, marketing: true, functional: true, recording: true }, "accept_all");
    const rejectAll = () => commit({ analytics: false, marketing: false, functional: false, recording: false }, "reject_all");
    const open = () => {
      if (deps && typeof deps.openModal === "function") deps.openModal({ commit, t, currentLocale, state });
    };
    const onChange = (fn) => {
      emitter.on("change", fn);
    };
    const onConsent = (category, fn) => {
      if (typeof fn !== "function") return;
      if (getConsent(category)) {
        try {
          fn(true);
        } catch (e) {
        }
      }
      emitter.on("consent:" + category, fn);
    };
    const setLocale = (loc) => {
      const resolved = normalizeLocale(loc);
      if (!resolved) return;
      currentLocale = resolved;
      t = getTranslation(resolved) || getTranslation(DEFAULT_LOCALE);
      emitter.emit("locale", { locale: resolved, t, isRTL: RTL_LOCALES.indexOf(resolved) > -1 });
    };
    const getMainLang = () => mainLang;
    const getState = () => state;
    const getJurisdiction = () => jurisdiction;
    const unblock = (category) => {
      if (!deps) return;
      if (typeof deps.unblockScripts === "function") deps.unblockScripts(category);
      if (typeof deps.unblockIframes === "function") deps.unblockIframes(category);
    };
    const scan = () => {
      const granted = scanAll({ getConsent });
      for (let i = 0; i < granted.length; i++) unblock(granted[i]);
      return granted;
    };
    const usePreset = (name) => {
      if (!deps || typeof deps.applyPreset !== "function") return null;
      return deps.applyPreset(name, { registerCleanup: deps.registerCleanup });
    };
    const registerCleanup2 = (opts) => {
      if (deps && typeof deps.registerCleanup === "function") deps.registerCleanup(opts);
    };
    const tcf = {
      getTCString: () => deps && typeof deps.getTCString === "function" ? deps.getTCString() : ""
    };
    const ccpa = {
      optOut: () => {
        if (deps && typeof deps.optOutCCPA === "function") deps.optOutCCPA();
      },
      isOptedOut: () => deps && typeof deps.isOptedOutCCPA === "function" ? !!deps.isOptedOutCCPA() : false
    };
    return {
      version: VERSION,
      open,
      acceptAll,
      rejectAll,
      getConsent,
      getState,
      onChange,
      setLocale,
      getMainLang,
      onConsent,
      registerCleanup: registerCleanup2,
      unblock,
      scan,
      usePreset,
      tcf,
      ccpa,
      getJurisdiction,
      __internal: { commit, setUI, closeUI }
    };
  };

  // src/index.js
  var ROOT_OVERLAY_CLASS = "blakfy-overlay";
  var bootstrap = async () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (window.BlakfyCookie && window.BlakfyCookie.__bootstrapped) return;
    const scriptEl = getScriptEl();
    const config = readConfig(scriptEl);
    const currentLocale = detectLocale({ configLocale: config.locale });
    const mainLang = detectMainLang({ configMainLang: config.mainLang });
    let t = getTranslation(currentLocale);
    let isRTL = RTL_LOCALES.indexOf(currentLocale) > -1;
    injectStyles();
    const emitter = createEmitter();
    let jurisdiction = "default";
    try {
      jurisdiction = await detectJurisdiction({});
    } catch (e) {
      jurisdiction = "default";
    }
    installDefaults();
    installDefaults2();
    installDefaults3();
    let state = readCookie(config.policyVersion);
    if (config.tcf === "true") {
      installTCFAPI({
        cmpId: parseInt(config.cmpId, 10) || 0,
        cmpVersion: 1,
        getConsent: () => state || {},
        on: emitter.on
      });
    }
    const ccpaOn = config.ccpa === "true" || config.ccpa === "auto" && jurisdiction === "CCPA";
    if (ccpaOn) {
      installUSP({});
      installDoNotSellLink({ t });
    }
    if (getDNT() && config.dnt === "auto-deny" && !state) {
      applyDNT({ mode: "auto-deny", setPrefs: () => {
      } });
    }
    if (getGPC() && config.gpc === "respect" && !state) {
      applyGPC({ mode: "respect", currentState: null, setPrefs: () => {
      } });
    }
    if (config.presets) {
      const list = String(config.presets).split(",").map((s) => s.trim()).filter(Boolean);
      for (let i = 0; i < list.length; i++) {
        try {
          applyPreset(list[i], { registerCleanup });
        } catch (e) {
        }
      }
    }
    const api = createAPI({
      state,
      config,
      emitter,
      locale: currentLocale,
      mainLang,
      jurisdiction,
      deps: {
        unblockScripts,
        unblockIframes,
        runCleanup,
        registerCleanup,
        applyPreset,
        pushGCM,
        pushUET,
        applyYandex,
        getTCString,
        optOutCCPA: optOut,
        isOptedOutCCPA: isOptedOut,
        removeFocusTrap,
        openModal: (opts) => mountModal(opts)
      }
    });
    api.__bootstrapped = true;
    emitter.on("change", (s) => {
      state = s;
    });
    emitter.on("locale", (info) => {
      t = info.t;
      isRTL = info.isRTL;
    });
    if (!window.BlakfyCookie) {
      window.BlakfyCookie = api;
      try {
        window.dispatchEvent(new CustomEvent("blakfy:ready", { detail: { version: api.version } }));
      } catch (e) {
      }
    }
    const mountBanner = () => {
      const overlay = document.createElement("div");
      overlay.className = ROOT_OVERLAY_CLASS + " widget " + (config.position || "bottom-right");
      const card = createBanner({
        t,
        isRTL,
        accent: config.accent,
        policyUrl: config.policyUrl,
        onAccept: () => api.acceptAll(),
        onReject: () => api.rejectAll(),
        onPrefs: () => mountModal({ commit: api.__internal.commit, t, currentLocale, state })
      });
      overlay.appendChild(card);
      document.body.appendChild(overlay);
      api.__internal.setUI("banner", overlay);
      mountBadges(card);
      installAntiTamper(card);
      installFocusTrap(card, { onEscape: () => {
      } });
      return overlay;
    };
    function mountModal(opts) {
      const existing = document.querySelectorAll("." + ROOT_OVERLAY_CLASS + ".modal");
      for (let i = 0; i < existing.length; i++) {
        if (existing[i].parentNode) existing[i].parentNode.removeChild(existing[i]);
      }
      const overlay = document.createElement("div");
      overlay.className = ROOT_OVERLAY_CLASS + " modal";
      overlay.addEventListener("click", (ev) => {
        if (ev.target === overlay) api.__internal.closeUI();
      });
      const card = createModal({
        t: opts && opts.t || t,
        isRTL,
        accent: config.accent,
        currentState: state,
        onSave: (prefs) => api.__internal.commit(prefs, "save"),
        onAccept: () => api.acceptAll(),
        onClose: () => api.__internal.closeUI()
      });
      overlay.appendChild(card);
      document.body.appendChild(overlay);
      api.__internal.setUI("modal", overlay);
      mountBadges(card);
      installAntiTamper(card);
      installFocusTrap(card, { onEscape: () => api.__internal.closeUI() });
      return overlay;
    }
    if (state) {
      pushGCM(state);
      pushUET(state);
      applyYandex(state, {
        unblock: (cat) => {
          unblockScripts(cat);
          unblockIframes(cat);
        },
        runCleanup
      });
      const granted = scanAll({ getConsent: api.getConsent });
      for (let i = 0; i < granted.length; i++) {
        unblockScripts(granted[i]);
        unblockIframes(granted[i]);
      }
      installPlaceholders(t, (cat) => {
        mountModal({ commit: api.__internal.commit, t, currentLocale, state });
      });
    } else {
      mountBanner();
      installPlaceholders(t, () => {
        mountModal({ commit: api.__internal.commit, t, currentLocale, state });
      });
    }
    startObserver({
      getConsent: api.getConsent,
      onScan: (cat) => {
        unblockScripts(cat);
        unblockIframes(cat);
      }
    });
    if (config.statusEnabled && config.statusUrl) {
      fetchStatus(config.statusUrl).then((data) => {
        if (data) renderStatus({ data, currentLocale, mainLang });
      });
    }
  };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        bootstrap();
      });
    } else {
      bootstrap();
    }
  }
  var index_default = bootstrap;
})();
/*! For license information please see cookie.js.LEGAL.txt */
//# sourceMappingURL=cookie.js.map
