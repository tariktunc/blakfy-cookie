/*!
 * Blakfy Cookie Widget v2.4.6
 * https://github.com/tariktunc/blakfy-cookie
 * MIT License | (c) Blakfy Studio
 *
 * KVKK + GDPR + CCPA + Google CMv2 + Microsoft UET + Yandex + TCF v2.2 + GPC + DNT
 * 23 languages | 18 presets | Tag-gating | Powered by Blakfy Studio
 */
(() => {
  // src/adapters/host-adapters.js
  var warnedNoBridge = {};
  var warnOnce = (key, message) => {
    if (warnedNoBridge[key]) return;
    warnedNoBridge[key] = true;
    if (typeof console !== "undefined" && console.info) console.info(message);
  };
  var detectHost = (scriptEl) => {
    if (typeof window === "undefined") return null;
    const override = scriptEl && typeof scriptEl.getAttribute === "function" ? scriptEl.getAttribute("data-blakfy-host") : null;
    if (override === "shopify" || override === "squarespace" || override === "wordpress") {
      return override;
    }
    if (typeof window.Shopify === "object" && window.Shopify) return "shopify";
    if (window.Static && window.Static.SQUARESPACE_CONTEXT) return "squarespace";
    if (typeof window.wp_set_consent === "function" || typeof window.wp_has_consent === "function") {
      return "wordpress";
    }
    return null;
  };
  var bridgeShopify = (state) => {
    if (typeof window === "undefined") return false;
    const cp = window.Shopify && window.Shopify.customerPrivacy;
    if (!cp || typeof cp.setTrackingConsent !== "function") {
      warnOnce(
        "shopify",
        "[Blakfy Cookie] Shopify detected but window.Shopify.customerPrivacy is not available yet (it loads after Shopify's own privacy banner script). No bridge installed for this page load \u2014 see tariktunc/blakfy-cookie#24."
      );
      return false;
    }
    const s = state || {};
    try {
      cp.setTrackingConsent(
        {
          analytics: !!s.analytics,
          marketing: !!s.marketing,
          preferences: !!s.functional
        },
        function() {
        }
      );
      return true;
    } catch (e) {
      return false;
    }
  };
  var bridgeWordPress = (state) => {
    if (typeof window === "undefined") return false;
    if (typeof window.wp_set_consent !== "function") {
      warnOnce(
        "wordpress",
        '[Blakfy Cookie] WordPress host detected (data-blakfy-host="wordpress" or a consent-plugin marker) but no WP Consent API (wp_set_consent) is present on this page. Vanilla WordPress has no native consent API to bridge to \u2014 install a WP Consent API-compatible plugin if two-way sync is needed. See tariktunc/blakfy-cookie#24.'
      );
      return false;
    }
    const s = state || {};
    try {
      window.wp_set_consent("functional", s.functional ? "allow" : "deny");
      window.wp_set_consent("preferences", s.functional ? "allow" : "deny");
      window.wp_set_consent("statistics", s.analytics ? "allow" : "deny");
      window.wp_set_consent("statistics-anonymous", "allow");
      window.wp_set_consent("marketing", s.marketing ? "allow" : "deny");
      return true;
    } catch (e) {
      return false;
    }
  };
  var bridgeSquarespace = () => {
    warnOnce(
      "squarespace",
      "[Blakfy Cookie] Squarespace detected. Squarespace has no documented public consent API for this widget to bridge into \u2014 running in detection-only mode. If Squarespace publishes one, or the owner's own Squarespace consent settings need coordinating by hand, see tariktunc/blakfy-cookie#24."
    );
    return false;
  };
  var BRIDGES = {
    shopify: bridgeShopify,
    wordpress: bridgeWordPress,
    squarespace: bridgeSquarespace
  };
  var installHostAdapter = (state, scriptEl) => {
    const host = detectHost(scriptEl);
    if (!host) return { host: null, bridged: false };
    const bridge = BRIDGES[host];
    const bridged = typeof bridge === "function" ? !!bridge(state) : false;
    return { host, bridged };
  };

  // src/core/audit.js
  var postAudit = (endpoint, payload) => {
    if (!endpoint) return;
    let body;
    try {
      body = JSON.stringify(payload);
    } catch (e) {
      return;
    }
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function" && typeof Blob !== "undefined") {
        const blob = new Blob([body], { type: "application/json" });
        const sent = navigator.sendBeacon(endpoint, blob);
        if (sent) return;
      }
    } catch (e) {
    }
    try {
      if (typeof fetch === "function") {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true
        }).catch(() => {
        });
      }
    } catch (e) {
    }
  };

  // src/core/config.js
  var RUNTIME_VERSION = "2.4.6" ? "2.4.6" : "2";
  var STATUS_BASE = "https://cdn.jsdelivr.net/npm/@blakfy/cookie@" + RUNTIME_VERSION;
  var DEFAULTS = {
    locale: "auto",
    mainLang: null,
    // #49 (owner decision 2026-09-12): default to "auto" (in-widget generated notice)
    // instead of a hardcoded path most sites never created — that hardcoded default is
    // exactly what produced live 404s on suestebeauty.com and senelli.com. A site with
    // a real policy page still sets data-blakfy-policy-url explicitly and gets the old
    // off-site link behaviour.
    policyUrl: "auto",
    policyVersion: "1.0",
    auditEndpoint: null,
    // #30 (item 6): optional operator error-reporting hook. Read directly off the <script>
    // element by index.js's bootstrap-error handler (not through readConfig()'s output) so a
    // throw inside readConfig() itself still has a chance to be reported.
    errorEndpoint: null,
    // #49: required for the generated in-widget notice (GDPR Art. 13(1)(a) / KVKK
    // Md.10 controller identity). Left unset, the notice renders but is marked
    // incomplete and says so loudly — see src/compliance/policy-text.js.
    operator: null,
    operatorContact: null,
    operatorAddress: null,
    position: "bottom-center",
    margin: "16",
    theme: "auto",
    // #56: owner decision — default look is neutral, not the old brand-green. Site
    // owners who want a brand color still set data-blakfy-accent; this only changes
    // what renders when that attribute is absent. #6b7280 (neutral gray) rather than
    // pure #000/#fff because it stays legible against both the light card background
    // (#fff) and the dark theme card background (#1a1a1a) without a theme-specific fork.
    accent: "#6b7280",
    presets: null,
    tcf: "false",
    cmpId: "0",
    ccpa: "auto",
    gpc: "respect",
    dnt: "respect",
    statusUrl: STATUS_BASE + "/status.json",
    statusEnabled: true,
    // #30 (scale readiness — multi-domain/subdomain scope): host-only by default
    // (matches existing behaviour). Set data-blakfy-cookie-domain=".example.com" so a
    // decision made on www.example.com also carries to shop.example.com — otherwise a
    // visitor is asked again on every subdomain, which is a real defect for clients
    // running a shop on a subdomain. Document the apex/www implication for anyone not
    // redirecting to a canonical host: an unset value means example.com and
    // www.example.com are treated as two different sites for consent purposes.
    cookieDomain: null,
    // #34: reopen FAB — "off" disables it (a site wiring its own footer link
    // instead). Default flipped to "right" 2026-09-14: the Blakfy accessibility
    // widget's FAB is bottom-left on EVERY site (CLAUDE.md Core Decision #4,
    // non-negotiable) and this cookie FAB used to default to the same corner,
    // sitting directly on top of it. "left" is still available via
    // data-blakfy-fab="left" for sites where the right corner is genuinely
    // occupied (e.g. a Wix chat/map widget) and the accessibility widget is off.
    fabSide: "right",
    fabOffset: null,
    fabSize: null,
    fabWidth: null,
    fabHeight: null,
    fabColor: null,
    fabRadius: null,
    fabIconColor: null,
    fabIconSize: null,
    // #39: cookie transparency panel — off by default (issue proposal: "Off by default;
    // a site opts in"). Lists cookies actually present in document.cookie, with
    // per-cookie delete. data-blakfy-cookie-panel="true" to enable.
    cookiePanel: "false"
  };
  var CAPTURED_SCRIPT_EL = typeof document !== "undefined" ? document.currentScript : null;
  var getScriptEl = () => {
    if (CAPTURED_SCRIPT_EL) return CAPTURED_SCRIPT_EL;
    if (typeof document === "undefined") return null;
    const all = document.getElementsByTagName("script");
    return all[all.length - 1] || null;
  };
  var detectPlacementIssue = (el2) => {
    if (!el2) {
      return "no usable <script> element could be resolved (document.currentScript was null and no fallback script was found) \u2014 this usually means the tag has the `async` attribute, which is not supported. Load this script WITHOUT async/defer, placed body-last, per the install docs.";
    }
    if (typeof el2.hasAttribute === "function" && el2.hasAttribute("async")) {
      return "this script tag has the `async` attribute. document.currentScript is null for async scripts per spec, so this install cannot reliably read its own data-blakfy-* attributes and may silently fall back to the wrong <script> tag on the page. Remove `async` and load this script body-last instead.";
    }
    if (typeof document !== "undefined" && document.head && typeof el2.closest === "function" && el2.closest("head") === document.head) {
      return "this script tag is placed in <head>. The install docs call for body-last placement; loading in <head> risks executing before the DOM the widget mounts into exists, and commonly pairs with `async`/`defer` mistakes. Move the tag to just before </body>.";
    }
    return null;
  };
  var readConfig = (scriptEl) => {
    const el2 = scriptEl || getScriptEl();
    const attr = (name, fallback) => {
      if (!el2) return fallback;
      const v = el2.getAttribute(name);
      return v == null ? fallback : v;
    };
    return {
      locale: attr("data-blakfy-locale", DEFAULTS.locale),
      mainLang: attr("data-blakfy-main-lang", DEFAULTS.mainLang),
      policyUrl: attr("data-blakfy-policy-url", DEFAULTS.policyUrl),
      policyVersion: attr("data-blakfy-version", DEFAULTS.policyVersion),
      auditEndpoint: attr("data-blakfy-audit-endpoint", DEFAULTS.auditEndpoint),
      errorEndpoint: attr("data-blakfy-error-endpoint", DEFAULTS.errorEndpoint),
      operator: attr("data-blakfy-operator", DEFAULTS.operator),
      operatorContact: attr("data-blakfy-operator-contact", DEFAULTS.operatorContact),
      operatorAddress: attr("data-blakfy-operator-address", DEFAULTS.operatorAddress),
      position: attr("data-blakfy-position", DEFAULTS.position),
      margin: attr("data-blakfy-margin", DEFAULTS.margin),
      theme: attr("data-blakfy-theme", DEFAULTS.theme),
      accent: attr("data-blakfy-accent", DEFAULTS.accent),
      presets: attr("data-blakfy-presets", DEFAULTS.presets),
      tcf: attr("data-blakfy-tcf", DEFAULTS.tcf),
      cmpId: attr("data-blakfy-cmp-id", DEFAULTS.cmpId),
      ccpa: attr("data-blakfy-ccpa", DEFAULTS.ccpa),
      gpc: attr("data-blakfy-gpc", DEFAULTS.gpc),
      dnt: attr("data-blakfy-dnt", DEFAULTS.dnt),
      statusUrl: attr("data-blakfy-status-url", DEFAULTS.statusUrl),
      statusEnabled: attr("data-blakfy-status", "true") !== "false",
      cookieDomain: attr("data-blakfy-cookie-domain", DEFAULTS.cookieDomain),
      fabSide: attr("data-blakfy-fab", DEFAULTS.fabSide),
      fabOffset: attr("data-blakfy-fab-offset", DEFAULTS.fabOffset),
      fabSize: attr("data-blakfy-fab-size", DEFAULTS.fabSize),
      fabWidth: attr("data-blakfy-fab-width", DEFAULTS.fabWidth),
      fabHeight: attr("data-blakfy-fab-height", DEFAULTS.fabHeight),
      fabColor: attr("data-blakfy-fab-color", DEFAULTS.fabColor),
      // #63c: document :root custom-property overrides can't reach this value --
      // the widget's own :host rule re-declares --blakfy-fab-radius directly on
      // the shadow host, which shadows (blocks) inheritance from outside document
      // styles. Only an inline override on the button element itself (below) works,
      // same as fabWidth/fabHeight already had to be (owner finding 2026-09-14).
      fabRadius: attr("data-blakfy-fab-radius", DEFAULTS.fabRadius),
      fabIconColor: attr("data-blakfy-fab-icon-color", DEFAULTS.fabIconColor),
      // #63e: default icon is 20px -- bigger than a small custom fabHeight (e.g. 16px)
      // and touches/overflows the box edges. A site sizing the FAB down must size the
      // icon down too, hence a dedicated prop rather than assuming a smaller box implies
      // a smaller icon.
      fabIconSize: attr("data-blakfy-fab-icon-size", DEFAULTS.fabIconSize),
      cookiePanel: attr("data-blakfy-cookie-panel", DEFAULTS.cookiePanel) === "true"
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
  var writeCookie = (state, domain) => {
    const expires = new Date(Date.now() + COOKIE_TTL_DAYS * 864e5).toUTCString();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const domainPart = domain ? "; domain=" + domain : "";
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(JSON.stringify(state)) + "; expires=" + expires + "; path=/; SameSite=Strict" + domainPart + secure;
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
    prevId,
    source
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
    uspString: uspString || null,
    // #32: who produced this record — "click" (default, user interacted with the banner/modal)
    // or "gpc" (Global Privacy Control signal auto-applied the decision, CCPA/CPRA jurisdictions).
    source: source || "click"
  });

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
      const inner = node.querySelectorAll(
        'script[type="text/plain"][data-blakfy-category], iframe[data-blakfy-src][data-blakfy-category]'
      );
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
      essential: {
        title: "Essential Cookies",
        desc: "Required for the site to function. Cannot be disabled.",
        always: "Always active"
      },
      analytics: { title: "Analytics Cookies", desc: "Used to collect anonymous visit statistics." },
      marketing: {
        title: "Marketing Cookies",
        desc: "Used for personalized advertising and retargeting."
      },
      functional: {
        title: "Functional Cookies",
        desc: "Used to remember preferences like language, theme, region."
      },
      recording: {
        title: "Session Recording",
        desc: "Records or replays your session (heatmaps, screen capture) for UX analysis."
      }
    },
    placeholder: {
      title: "Content blocked",
      desc: "You need to allow {category} cookies to view this content.",
      cta: "Allow"
    },
    tabs: {
      categories: "Categories",
      services: "Services",
      about: "About"
    },
    service: {
      description: "Description",
      processor: "Data Processor",
      address: "Address",
      dpo: "DPO Contact",
      purposes: "Purposes",
      technologies: "Technologies Used",
      dataCollected: "Data Collected",
      legalBasis: "Legal Basis",
      retention: "Retention Period",
      transferCountries: "Transfer Countries",
      privacyPolicy: "Privacy Policy",
      cookiePolicy: "Cookie Policy",
      legalBasisValues: {
        consent: "Consent (Art. 6 para. 1 s. 1 lit. a GDPR)",
        legitimate_interest: "Legitimate Interest (Art. 6 para. 1 s. 1 lit. f GDPR)"
      },
      noServices: "No services are configured for this site."
    },
    svcAbout: {
      title: "About this CMP",
      description: "This website uses Blakfy Cookie Management Platform (CMP) to manage your consent preferences in compliance with GDPR, KVKK, CCPA and other applicable privacy regulations.",
      version: "Version",
      learnMore: "Learn more at blakfy.com"
    },
    cookiePanel: {
      caveat: "This list shows cookies readable by this page (document.cookie). It cannot see HttpOnly cookies and says nothing about localStorage, IndexedDB, or fingerprinting \u2014 it is a partial view, not a complete inventory.",
      empty: "No cookies detected on this page.",
      unrecognised: "Unrecognised \u2014 not matched to any known service",
      essential: "Essential \u2014 cannot be deleted",
      delete: "Delete"
    }
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
      essential: {
        title: "Zorunlu \xC7erezler",
        desc: "Sitenin temel i\u015Flevleri i\xE7in gerekli, devre d\u0131\u015F\u0131 b\u0131rak\u0131lamaz.",
        always: "Her zaman aktif"
      },
      analytics: {
        title: "Analitik \xC7erezler",
        desc: "Anonim ziyaret istatistikleri toplama amac\u0131yla kullan\u0131l\u0131r."
      },
      marketing: {
        title: "Pazarlama \xC7erezleri",
        desc: "Ki\u015Fiselle\u015Ftirilmi\u015F reklam ve yeniden hedefleme i\xE7in kullan\u0131l\u0131r."
      },
      functional: {
        title: "Fonksiyonel \xC7erezler",
        desc: "Dil, tema, b\xF6lge gibi tercihlerinizi hat\u0131rlamak i\xE7in kullan\u0131l\u0131r."
      },
      recording: {
        title: "Oturum Kayd\u0131",
        desc: "Is\u0131 haritas\u0131, ekran kayd\u0131 gibi y\xF6ntemlerle oturumunuzu kaydeder veya tekrar oynat\u0131r."
      }
    },
    placeholder: {
      title: "\u0130\xE7erik engellendi",
      desc: "Bu i\xE7eri\u011Fi g\xF6rmek i\xE7in {category} \xE7erezlerine izin vermeniz gerekiyor.",
      cta: "\u0130zin ver"
    },
    tabs: {
      categories: "Kategoriler",
      services: "Hizmetler",
      about: "Hakk\u0131nda"
    },
    service: {
      description: "A\xE7\u0131klama",
      processor: "Veri \u0130\u015Fleyici",
      address: "Adres",
      dpo: "VKO \u0130leti\u015Fim",
      purposes: "Ama\xE7lar",
      technologies: "Kullan\u0131lan Teknolojiler",
      dataCollected: "Toplanan Veriler",
      legalBasis: "Hukuki Dayanak",
      retention: "Saklama S\xFCresi",
      transferCountries: "Aktar\u0131m \xDClkeleri",
      privacyPolicy: "Gizlilik Politikas\u0131",
      cookiePolicy: "\xC7erez Politikas\u0131",
      legalBasisValues: {
        consent: "A\xE7\u0131k R\u0131za (GDPR Madde 6/1-a)",
        legitimate_interest: "Me\u015Fru Menfaat (GDPR Madde 6/1-f)"
      },
      noServices: "Bu site i\xE7in hen\xFCz hizmet yap\u0131land\u0131r\u0131lmam\u0131\u015F."
    },
    svcAbout: {
      title: "Bu CMP Hakk\u0131nda",
      description: "Bu web sitesi; GDPR, KVKK, CCPA ve di\u011Fer ge\xE7erli gizlilik mevzuatlar\u0131na uyum sa\u011Flamak amac\u0131yla r\u0131za tercihlerinizi y\xF6netmek i\xE7in Blakfy \xC7erez Y\xF6netim Platformu'nu (CMP) kullanmaktad\u0131r.",
      version: "S\xFCr\xFCm",
      learnMore: "blakfy.com'da daha fazla bilgi"
    },
    cookiePanel: {
      caveat: "Bu liste, bu sayfan\u0131n okuyabildi\u011Fi \xE7erezleri g\xF6sterir (document.cookie). HttpOnly \xE7erezleri g\xF6remez; localStorage, IndexedDB veya parmak izi (fingerprinting) hakk\u0131nda bilgi vermez \u2014 tam bir envanter de\u011Fil, k\u0131smi bir g\xF6r\xFCn\xFCmd\xFCr.",
      empty: "Bu sayfada hi\xE7bir \xE7erez tespit edilmedi.",
      unrecognised: "Tan\u0131nm\u0131yor \u2014 bilinen bir hizmetle e\u015Fle\u015Fmedi",
      essential: "Zorunlu \u2014 silinemez",
      delete: "Sil"
    }
  };

  // src/i18n/index.js
  var DEFAULT_LOCALE = "tr";
  var TRANSLATIONS = { tr: tr_default, en: en_default };
  var REMOTE_LOCALES = [
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
    "zh-TW"
  ];
  var isRemoteLocale = (locale) => REMOTE_LOCALES.indexOf(locale) > -1;
  var remoteCache = () => {
    if (typeof window === "undefined") return null;
    window.__blakfyI18n = window.__blakfyI18n || {};
    return window.__blakfyI18n;
  };
  var getTranslation = (locale) => {
    if (TRANSLATIONS[locale]) return TRANSLATIONS[locale];
    const cache = remoteCache();
    if (cache && cache[locale]) return cache[locale];
    return TRANSLATIONS[DEFAULT_LOCALE];
  };
  var inflight = /* @__PURE__ */ new Map();
  var loadTranslation = (locale, baseHref) => {
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
        resolvePromise(loaded && loaded[locale] || TRANSLATIONS[DEFAULT_LOCALE]);
      };
      script.onload = finish;
      script.onerror = finish;
      document.head.appendChild(script);
    }).finally(() => inflight.delete(locale));
    inflight.set(locale, p);
    return p;
  };

  // src/api.js
  var VERSION = RUNTIME_VERSION;
  var CATEGORIES = ["analytics", "marketing", "functional", "recording"];
  var createAPI = (ctx) => {
    const { config, emitter, deps } = ctx;
    const baseHref = ctx.baseHref;
    let state = ctx.state || null;
    let currentLocale = ctx.locale;
    const mainLang = ctx.mainLang;
    const jurisdiction = ctx.jurisdiction || "default";
    let t = getTranslation(currentLocale);
    let modalRoot = null;
    let warnedNoAuditEndpoint = false;
    let bannerRoot = null;
    const setUI = (which, root2) => {
      if (which === "modal") modalRoot = root2;
      if (which === "banner") bannerRoot = root2;
    };
    const closeUI = (force) => {
      const queryRoot = ctx.shadowRoot || (typeof document !== "undefined" ? document : null);
      const selector = force || state ? ".blakfy-overlay" : ".blakfy-overlay.modal";
      if (queryRoot) {
        const overlays = queryRoot.querySelectorAll(selector);
        for (let i = 0; i < overlays.length; i++) {
          const o = overlays[i];
          if (o && o.parentNode) o.parentNode.removeChild(o);
        }
      }
      modalRoot = null;
      if (force || state) bannerRoot = null;
      if (deps && typeof deps.removeFocusTrap === "function") deps.removeFocusTrap();
    };
    let warnedNoCategoryArg = false;
    const getConsent = (cat) => {
      if (cat === "essential") return true;
      if (cat === void 0 && !warnedNoCategoryArg) {
        warnedNoCategoryArg = true;
        if (typeof console !== "undefined" && console.warn) {
          console.warn(
            "[Blakfy Cookie] getConsent() called with no category argument \u2014 this always returns false, which reads as 'consent denied' even for a visitor who accepted everything. Pass a category ('analytics', 'marketing', 'functional', 'recording'), or use hasDecided() to check whether the visitor has answered at all."
          );
        }
      }
      return state ? !!state[cat] : false;
    };
    const hasDecided = () => !!state;
    const grantedCategories = (s) => {
      const out = [];
      if (!s) return out;
      for (let i = 0; i < CATEGORIES.length; i++) {
        if (s[CATEGORIES[i]]) out.push(CATEGORIES[i]);
      }
      return out;
    };
    const commit = (prefs, action, opts) => {
      const prevState = state;
      const prevGranted = grantedCategories(prevState);
      const o = opts || {};
      const next = buildState({
        prefs: prefs || {},
        currentLocale,
        mainLang,
        policyVersion: config.policyVersion,
        jurisdiction,
        tcString: deps && typeof deps.getTCString === "function" ? deps.getTCString() : null,
        uspString: null,
        prevId: prevState && prevState.id,
        source: o.source
      });
      state = next;
      try {
        writeCookie(state, config.cookieDomain);
      } catch (e) {
      }
      if (config.auditEndpoint) {
        postAudit(config.auditEndpoint, {
          id: state.id,
          action: action || "save",
          timestamp: state.timestamp,
          version: state.version,
          jurisdiction: state.jurisdiction,
          locale: state.locale,
          consent: {
            analytics: state.analytics,
            marketing: state.marketing,
            functional: state.functional,
            recording: state.recording
          }
        });
      } else if (!warnedNoAuditEndpoint && typeof console !== "undefined" && console.warn) {
        warnedNoAuditEndpoint = true;
        console.warn(
          "[Blakfy Cookie] No data-blakfy-audit-endpoint configured \u2014 consent changes are not being recorded server-side. This means there is no proof-of-consent record (GDPR Art. 7(1) / KVKK Md.12) if ever challenged. See docs/compliance.md \xA710 for the payload shape and a reference endpoint, or set data-blakfy-audit-endpoint if you have already built one."
        );
      }
      if (deps && typeof deps.pushGCM === "function") deps.pushGCM(state);
      if (deps && typeof deps.pushUET === "function") deps.pushUET(state);
      if (deps && typeof deps.installHostAdapter === "function") deps.installHostAdapter(state);
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
      for (let k = 0; k < CATEGORIES.length; k++) {
        const cat = CATEGORIES[k];
        const wasGranted = prevGranted.indexOf(cat) > -1;
        const isGranted = nowGranted.indexOf(cat) > -1;
        if (!wasGranted && isGranted) emitter.emit("consent:" + cat, true);
        if (wasGranted && !isGranted) emitter.emit("consent:" + cat, false);
      }
      closeUI(true);
    };
    const acceptAll = () => commit({ analytics: true, marketing: true, functional: true, recording: true }, "accept_all");
    const rejectAll = () => commit(
      { analytics: false, marketing: false, functional: false, recording: false },
      "reject_all"
    );
    const open = () => {
      if (deps && typeof deps.openModal === "function")
        deps.openModal({ commit, t, currentLocale, state });
    };
    const openPolicy = () => {
      if (deps && typeof deps.openModal === "function")
        deps.openModal({
          commit,
          t,
          currentLocale,
          state,
          tab: "policy"
        });
    };
    const onChange = (fn) => {
      emitter.on("change", fn);
      return () => emitter.off("change", fn);
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
      loadTranslation(resolved, baseHref).then((loaded) => {
        if (currentLocale !== resolved || !loaded || loaded === t) return;
        t = loaded;
        emitter.emit("locale", { locale: resolved, t, isRTL: RTL_LOCALES.indexOf(resolved) > -1 });
      });
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
    const diagnose = () => {
      if (deps && typeof deps.getDiagnostics === "function") {
        return deps.getDiagnostics({ state, jurisdiction });
      }
      return {
        placementOk: null,
        defaultsFired: null,
        presetsRegistered: [],
        unrecognizedCookies: [],
        googleConsentState: null,
        note: "diagnostics unavailable \u2014 deps.getDiagnostics was not wired by bootstrap"
      };
    };
    return {
      version: VERSION,
      open,
      openPolicy,
      acceptAll,
      rejectAll,
      getConsent,
      hasDecided,
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
      diagnose,
      __internal: { commit, setUI, closeUI }
    };
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
        window.dispatchEvent(
          new CustomEvent("blakfy:ccpa:optout", { detail: { uspString: currentString() } })
        );
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

  // src/compliance/google-cmv2.js
  var defaultsInstalled = false;
  var warnedForeignDefault = false;
  var STORAGE_KEYS = [
    "ad_storage",
    "ad_user_data",
    "ad_personalization",
    "analytics_storage",
    "functionality_storage",
    "personalization_storage"
  ];
  var warnIfForeignGrantedDefaultExists = (dataLayer) => {
    if (warnedForeignDefault) return;
    if (!Array.isArray(dataLayer) || dataLayer.length === 0) return;
    if (typeof console === "undefined" || !console.warn) return;
    for (const entry of dataLayer) {
      if (!entry || typeof entry.length !== "number") continue;
      if (entry[0] !== "consent" || entry[1] !== "default") continue;
      const params = entry[2];
      if (!params || typeof params !== "object") continue;
      const grantedKeys = STORAGE_KEYS.filter((k) => params[k] === "granted");
      if (grantedKeys.length === 0) continue;
      warnedForeignDefault = true;
      console.warn(
        `[Blakfy Cookie] A gtag('consent','default', ...) call already in dataLayer grants [${grantedKeys.join(", ")}] before this widget's own denied-by-default signal. This usually means the host platform (Wix, Shopify, Squarespace, a WordPress consent plugin, ...) pushed its own default consent state ahead of ours \u2014 on Wix specifically this happens whenever the site's consentPolicy is left unset. Tags bound to that foreign default can fire before the visitor answers. Check the platform's own consent/privacy settings and confirm it is not shipping a conflicting default (see tariktunc/blakfy-cookie#24).`
      );
      return;
    }
  };
  var installDefaults = () => {
    if (typeof window === "undefined") return;
    if (defaultsInstalled) return;
    defaultsInstalled = true;
    window.dataLayer = window.dataLayer || [];
    warnIfForeignGrantedDefaultExists(window.dataLayer);
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
  var isDefaultsInstalled = () => defaultsInstalled;
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

  // src/compliance/gpc.js
  var getGPC = () => {
    if (typeof navigator !== "undefined" && navigator.globalPrivacyControl === true) return true;
    if (typeof document !== "undefined" && document.documentElement && document.documentElement.dataset && document.documentElement.dataset.gpc === "1")
      return true;
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

  // src/compliance/gpp.js
  var SID_USNAT = 7;
  var buildUSNatSection = (state) => {
    const s = state || {};
    const saleOptOut = s.marketing ? 2 : 1;
    const sharingOptOut = s.marketing ? 2 : 1;
    const targetedAdvertisingOptOut = s.marketing ? 2 : 1;
    return {
      Version: 1,
      SaleOptOut: saleOptOut,
      SharingOptOut: sharingOptOut,
      TargetedAdvertisingOptOut: targetedAdvertisingOptOut,
      Gpc: s.gpc === true
    };
  };
  var installGPPAPI = (opts) => {
    if (typeof window === "undefined") return null;
    const o = opts || {};
    const getConsent = typeof o.getConsent === "function" ? o.getConsent : () => ({});
    const getGpcFlag = typeof o.getGpc === "function" ? o.getGpc : () => false;
    const applicableSections = Array.isArray(o.applicableSections) ? o.applicableSections : [SID_USNAT];
    const subscribe = typeof o.on === "function" ? o.on : null;
    const listeners2 = /* @__PURE__ */ Object.create(null);
    let nextId = 1;
    const cmpStatus = "loaded";
    const currentUSNat = () => buildUSNatSection(Object.assign({}, getConsent(), { gpc: getGpcFlag() }));
    const buildGPPData = (listenerId) => ({
      gppVersion: "1.1",
      cmpStatus,
      cmpDisplayStatus: "hidden",
      signalStatus: "ready",
      supportedAPIs: ["6:uspv1", "7:usnat"],
      cmpId: o.cmpId || 0,
      sectionList: applicableSections,
      applicableSections,
      gppString: "",
      // official bitstring encoding not implemented — see file header
      parsedSections: { usnat: currentUSNat() },
      listenerId: typeof listenerId === "number" ? listenerId : null
    });
    const handle = (command, callback, parameter) => {
      if (typeof callback !== "function") return;
      if (command === "ping") {
        callback(
          {
            gppVersion: "1.1",
            cmpStatus,
            cmpDisplayStatus: "hidden",
            supportedAPIs: ["6:uspv1", "7:usnat"],
            cmpId: o.cmpId || 0,
            sectionList: applicableSections,
            applicableSections
          },
          true
        );
        return;
      }
      if (command === "getGPPData" || command === "getField") {
        callback(buildGPPData(null), true);
        return;
      }
      if (command === "addEventListener") {
        const id = nextId++;
        listeners2[id] = callback;
        callback(buildGPPData(id), true);
        return;
      }
      if (command === "removeEventListener") {
        if (listeners2[parameter]) {
          delete listeners2[parameter];
          callback({ success: true }, true);
        } else callback({ success: false }, true);
        return;
      }
      callback(null, false);
    };
    const queue = window.__gpp && window.__gpp.queue ? window.__gpp.queue : [];
    if (!window.__gpp || !window.__gpp.__blakfy) {
      const gppFn = (command, callback, parameter) => handle(command, callback, parameter);
      gppFn.queue = [];
      gppFn.__blakfy = true;
      window.__gpp = gppFn;
      for (let i = 0; i < queue.length; i++) {
        const args = queue[i];
        try {
          handle(args[0], args[1], args[2]);
        } catch (e) {
        }
      }
    }
    if (typeof document !== "undefined" && !document.querySelector('iframe[name="__gppLocator"]')) {
      try {
        const iframe = document.createElement("iframe");
        iframe.style.cssText = "display:none;position:absolute;width:0;height:0;border:0";
        iframe.name = "__gppLocator";
        (document.body || document.documentElement).appendChild(iframe);
      } catch (e) {
      }
    }
    const fireAll = (eventName) => {
      const ids = Object.keys(listeners2);
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        try {
          const data = buildGPPData(parseInt(id, 10));
          data.pingData = { signalStatus: eventName || "ready" };
          listeners2[id](data, true);
        } catch (e) {
        }
      }
    };
    if (subscribe) {
      subscribe("change", () => fireAll("useractioncomplete"));
    }
    return { fireAll };
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

  // src/compliance/tcf-loader.js
  var inflight2 = null;
  var cached = () => typeof window !== "undefined" ? window.__blakfyTCF || null : null;
  var loadTCF = (baseHref) => {
    const existing = cached();
    if (existing) return Promise.resolve(existing);
    if (!baseHref || typeof document === "undefined") return Promise.resolve(null);
    if (inflight2) return inflight2;
    inflight2 = new Promise((resolvePromise) => {
      const base = baseHref.replace(/\/[^/]*$/, "/");
      const script = document.createElement("script");
      script.src = base + "tcf-v2.min.js";
      script.async = true;
      const finish = () => resolvePromise(cached());
      script.onload = finish;
      script.onerror = () => {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[blakfy-cookie] TCF v2.2 chunk failed to load from " + script.src);
        }
        resolvePromise(null);
      };
      document.head.appendChild(script);
    }).finally(() => {
      inflight2 = null;
    });
    return inflight2;
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
  var TWO_LABEL_PUBLIC_SUFFIXES = /* @__PURE__ */ new Set([
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
    "co.kr"
  ]);
  var getRootDomain = (host) => {
    if (!host) return "";
    const parts = host.split(".").filter(Boolean);
    if (parts.length <= 2) return host;
    const lastTwo = parts.slice(-2).join(".");
    if (parts.length >= 3 && TWO_LABEL_PUBLIC_SUFFIXES.has(lastTwo)) {
      return parts.slice(-3).join(".");
    }
    return lastTwo;
  };
  var expireCookie = (name) => {
    if (typeof document === "undefined") return;
    const host = typeof location !== "undefined" && location.hostname || "";
    const root2 = getRootDomain(host);
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
    if (root2 && root2 !== host) {
      try {
        document.cookie = name + "=; expires=" + past + "; path=/; domain=" + root2;
      } catch (e) {
      }
      try {
        document.cookie = name + "=; expires=" + past + "; path=/; domain=." + root2;
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
  var warnUnregisteredCookies = (presets) => {
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
          const isMatch = matcher instanceof RegExp ? matcher.test(allNames[n]) : matcher === allNames[n];
          if (!isMatch) continue;
          found.push({ preset: presetKeys[p], name: preset.name, cookie: allNames[n] });
        }
      }
    }
    for (let i = 0; i < found.length; i++) {
      console.warn(
        "[Blakfy Cookie] Cookie '" + found[i].cookie + "' matches " + found[i].name + " but no data-blakfy-presets entry registers a cleanup rule for it. This cookie will NOT be deleted on reject/withdrawal. Add '" + found[i].preset + "' to data-blakfy-presets, or confirm this is expected."
      );
    }
    return found;
  };
  var warnPreConsentCookies = (presets, getConsent) => {
    if (!presets || typeof getConsent !== "function") return [];
    if (typeof console === "undefined" || typeof console.warn !== "function") return [];
    const allNames = readCookieNames();
    if (!allNames.length) return [];
    const found = [];
    const presetKeys = Object.keys(presets);
    for (let p = 0; p < presetKeys.length; p++) {
      const preset = presets[presetKeys[p]];
      if (!preset || !preset.category) continue;
      if (getConsent(preset.category)) continue;
      const matchers = preset.cookies || [];
      for (let m = 0; m < matchers.length; m++) {
        const matcher = matchers[m];
        for (let n = 0; n < allNames.length; n++) {
          const isMatch = matcher instanceof RegExp ? matcher.test(allNames[n]) : matcher === allNames[n];
          if (!isMatch) continue;
          found.push({ preset: presetKeys[p], name: preset.name, cookie: allNames[n] });
        }
      }
    }
    for (let i = 0; i < found.length; i++) {
      console.warn(
        "[Blakfy Cookie] Tracking cookie '" + found[i].cookie + "' (" + found[i].name + ") is present but consent for its category has NOT been granted. Something is writing this cookie outside Blakfy's gating \u2014 commonly a host platform (Wix/Shopify) injecting its own copy of the same tool. This is a compliance risk (pre-consent tracking) even though the widget itself did not load it."
      );
    }
    return found;
  };

  // src/data/service-metadata.js
  var SERVICE_METADATA = {
    ga4: {
      displayName: "Google Analytics 4",
      category: "analytics",
      description: "Website analytics service that collects and reports traffic data to help website owners understand how visitors interact with their site.",
      processor: {
        name: "Google Ireland Limited",
        address: "Gordon House, Barrow St, Dublin 4, Ireland",
        dpo: "https://support.google.com/policies/contact/general_privacy_form"
      },
      purposes: ["Analytics", "Performance measurement", "User behavior analysis"],
      technologies: ["Cookies", "JavaScript"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Usage data",
        "Device information",
        "Geographic location",
        "Date and time of visit",
        "Pages visited"
      ],
      legalBasis: "consent",
      retention: "14 months",
      transferCountries: ["United States of America"],
      privacyUrl: "https://policies.google.com/privacy",
      cookiePolicyUrl: "https://policies.google.com/technologies/cookies"
    },
    gtm: {
      displayName: "Google Tag Manager",
      category: "analytics",
      description: "Tag management system that allows website owners to manage and deploy marketing and analytics tags without modifying the website code.",
      processor: {
        name: "Google Ireland Limited",
        address: "Gordon House, Barrow St, Dublin 4, Ireland",
        dpo: "https://support.google.com/policies/contact/general_privacy_form"
      },
      purposes: ["Tag management", "Analytics", "Marketing"],
      technologies: ["Website tags", "JavaScript"],
      dataCollected: ["Aggregated tag firing data", "Diagnostic data"],
      legalBasis: "consent",
      retention: "14 days",
      transferCountries: ["United States of America", "Singapore", "Chile", "Taiwan"],
      privacyUrl: "https://business.safety.google/privacy/",
      cookiePolicyUrl: "https://policies.google.com/technologies/cookies"
    },
    facebook: {
      displayName: "Facebook Pixel",
      category: "marketing",
      description: "Tracking technology by Meta that measures ad effectiveness and enables retargeting of users who have visited the website.",
      processor: {
        name: "Meta Platforms Ireland Ltd.",
        address: "4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Ireland",
        dpo: "https://www.facebook.com/help/contact/1650115808681298"
      },
      purposes: ["Analytics", "Marketing", "Retargeting", "Advertisement", "Conversion tracking"],
      technologies: ["Cookies", "Pixel"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Device information",
        "Pages visited",
        "Pixel ID",
        "Ads viewed",
        "Usage behaviour",
        "Referrer URL"
      ],
      legalBasis: "consent",
      retention: "180 days",
      transferCountries: ["United States of America", "Singapore", "United Kingdom"],
      privacyUrl: "https://www.facebook.com/privacy/explanation",
      cookiePolicyUrl: "https://www.facebook.com/policies/cookies"
    },
    clarity: {
      displayName: "Microsoft Clarity",
      category: "analytics",
      description: "Behavioral analytics tool that records user sessions and generates heatmaps to help understand how visitors interact with the website.",
      processor: {
        name: "Microsoft Ireland Operations Ltd.",
        address: "One Microsoft Place, South County Business Park, Leopardstown, Dublin 18, Ireland",
        dpo: "https://aka.ms/privacyresponse"
      },
      purposes: ["Analytics", "Heatmaps", "Session recording"],
      technologies: ["Cookies", "JavaScript"],
      dataCollected: [
        "IP address",
        "Mouse movements",
        "Clicks",
        "Scrolls",
        "Browser information",
        "Device information",
        "Referrer URL"
      ],
      legalBasis: "consent",
      retention: "13 months",
      transferCountries: ["United States of America"],
      privacyUrl: "https://privacy.microsoft.com/en-us/privacystatement",
      cookiePolicyUrl: ""
    },
    hotjar: {
      displayName: "Hotjar",
      category: "analytics",
      description: "User experience analytics platform providing heatmaps, session recordings, and feedback tools to understand visitor behavior.",
      processor: {
        name: "Hotjar Ltd.",
        address: "Dragonara Business Centre, 5th Floor, Dragonara Road, St. Julian's STJ 3141, Malta",
        dpo: "privacy@hotjar.com"
      },
      purposes: ["Analytics", "Heatmaps", "User feedback", "Session recording"],
      technologies: ["Cookies", "Pixel", "JavaScript"],
      dataCollected: [
        "IP address",
        "Usage data",
        "Mouse movements",
        "Click behavior",
        "Device information",
        "Browser information"
      ],
      legalBasis: "consent",
      retention: "365 days",
      transferCountries: [],
      privacyUrl: "https://www.hotjar.com/legal/policies/privacy/",
      cookiePolicyUrl: "https://www.hotjar.com/legal/policies/cookie/"
    },
    youtube: {
      displayName: "YouTube",
      category: "marketing",
      description: "Video hosting service by Google. When enabled, YouTube videos embedded on the website can be played and related cookies are set.",
      processor: {
        name: "Google Ireland Limited",
        address: "Gordon House, Barrow St, Dublin 4, Ireland",
        dpo: "https://support.google.com/policies/contact/general_privacy_form"
      },
      purposes: ["Marketing", "Video content delivery", "Personalisation"],
      technologies: ["Cookies", "Pixel"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Usage data",
        "Video viewing data",
        "Device information"
      ],
      legalBasis: "consent",
      retention: "180 days",
      transferCountries: ["United States of America"],
      privacyUrl: "https://policies.google.com/privacy",
      cookiePolicyUrl: "https://policies.google.com/technologies/cookies"
    },
    vimeo: {
      displayName: "Vimeo",
      category: "marketing",
      description: "Video hosting and sharing platform. When enabled, Vimeo videos embedded on the website can be played.",
      processor: {
        name: "Vimeo, Inc.",
        address: "555 West 18th Street, New York, NY 10011, USA",
        dpo: "privacy@vimeo.com"
      },
      purposes: ["Marketing", "Video content delivery"],
      technologies: ["Cookies", "JavaScript"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Video viewing data",
        "Device information"
      ],
      legalBasis: "consent",
      retention: "2 years",
      transferCountries: ["United States of America"],
      privacyUrl: "https://vimeo.com/privacy",
      cookiePolicyUrl: "https://vimeo.com/cookie_policy"
    },
    linkedin: {
      displayName: "LinkedIn Insight Tag",
      category: "marketing",
      description: "Analytics and retargeting tag by LinkedIn that enables conversion tracking and retargeting of website visitors through LinkedIn Ads.",
      processor: {
        name: "LinkedIn Ireland Unlimited Company",
        address: "Wilton Plaza, Wilton Place, Dublin 2, Ireland",
        dpo: "privacy@linkedin.com"
      },
      purposes: ["Marketing", "Analytics", "Retargeting", "Conversion tracking"],
      technologies: ["Cookies", "Pixel"],
      dataCollected: [
        "IP address",
        "Device information",
        "Pages visited",
        "Referrer URL",
        "Professional data"
      ],
      legalBasis: "consent",
      retention: "90 days",
      transferCountries: ["United States of America"],
      privacyUrl: "https://www.linkedin.com/legal/privacy-policy",
      cookiePolicyUrl: "https://www.linkedin.com/legal/cookie-policy"
    },
    yandex: {
      displayName: "Yandex Metrica",
      category: "analytics",
      description: "Web analytics service that collects and evaluates statistical data on user behavior for optimization and marketing purposes.",
      processor: {
        name: "Yandex LLC",
        address: "16 Lva Tolstogo St., Moscow 119021, Russia",
        dpo: ""
      },
      purposes: ["Analytics", "Optimization"],
      technologies: ["Cookies", "Web beacons", "Pixel"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Usage data",
        "Device information",
        "Date and time of visit",
        "Geographic location"
      ],
      legalBasis: "consent",
      retention: "As long as necessary",
      transferCountries: ["Russia"],
      privacyUrl: "https://yandex.com/legal/confidential/",
      cookiePolicyUrl: ""
    },
    bing: {
      displayName: "Bing Ads UET",
      category: "marketing",
      description: "Universal Event Tracking tag by Microsoft Bing that enables conversion tracking and audience targeting for Bing Ads campaigns.",
      processor: {
        name: "Microsoft Corporation",
        address: "One Microsoft Way, Redmond, WA 98052, USA",
        dpo: "https://aka.ms/privacyresponse"
      },
      purposes: ["Marketing", "Conversion tracking", "Audience targeting"],
      technologies: ["Cookies", "Pixel"],
      dataCollected: ["IP address", "Browser information", "Conversion data", "Device information"],
      legalBasis: "consent",
      retention: "180 days",
      transferCountries: ["United States of America"],
      privacyUrl: "https://privacy.microsoft.com/en-us/privacystatement",
      cookiePolicyUrl: ""
    },
    tiktok: {
      displayName: "TikTok Pixel",
      category: "marketing",
      description: "Tracking pixel by TikTok that measures ad performance and enables retargeting for TikTok advertising campaigns.",
      processor: {
        name: "TikTok Information Technologies UK Limited",
        address: "6th Floor, One London Wall, London EC2Y 5EB, United Kingdom",
        dpo: "privacy@tiktok.com"
      },
      purposes: ["Marketing", "Retargeting", "Conversion tracking"],
      technologies: ["Cookies", "Pixel"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Usage data",
        "Device information",
        "Pages visited"
      ],
      legalBasis: "consent",
      retention: "13 months",
      transferCountries: ["United States of America", "Singapore"],
      privacyUrl: "https://www.tiktok.com/legal/page/row/privacy-policy/en",
      cookiePolicyUrl: "https://www.tiktok.com/legal/page/row/cookie-policy/en"
    },
    pinterest: {
      displayName: "Pinterest Tag",
      category: "marketing",
      description: "Analytics and retargeting tag by Pinterest that tracks conversions and enables targeting of website visitors through Pinterest Ads.",
      processor: {
        name: "Pinterest Europe Ltd.",
        address: "Palmerston House, 2nd Floor, Fenian Street, Dublin 2, Ireland",
        dpo: "privacy@pinterest.com"
      },
      purposes: ["Marketing", "Retargeting", "Conversion tracking"],
      technologies: ["Cookies", "Pixel"],
      dataCollected: ["IP address", "Browser information", "Usage data", "Device information"],
      legalBasis: "consent",
      retention: "1 year",
      transferCountries: ["United States of America"],
      privacyUrl: "https://policy.pinterest.com/en/privacy-policy",
      cookiePolicyUrl: "https://policy.pinterest.com/en/cookies"
    },
    tawkto: {
      displayName: "Tawk.to",
      category: "functional",
      description: "Live chat widget that allows website visitors to communicate in real time with website support agents.",
      processor: {
        name: "Tawk.to, Inc.",
        address: "2880 Zanker Road Suite 203, San Jose, CA 95134, USA",
        dpo: "privacy@tawk.to"
      },
      purposes: ["Functional", "Live chat", "Customer support"],
      technologies: ["Cookies", "JavaScript"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Chat messages",
        "Usage data",
        "Device information"
      ],
      legalBasis: "consent",
      retention: "2 years",
      transferCountries: ["United States of America"],
      privacyUrl: "https://www.tawk.to/privacy-policy/",
      cookiePolicyUrl: ""
    },
    intercom: {
      displayName: "Intercom",
      category: "functional",
      description: "Customer messaging platform providing live chat, in-app messaging, and customer support tools.",
      processor: {
        name: "Intercom R&D Unlimited Company",
        address: "2nd Floor, Stephen Court, 18-21 St. Stephen's Green, Dublin 2, Ireland",
        dpo: "privacy@intercom.io"
      },
      purposes: ["Functional", "Customer support", "Marketing"],
      technologies: ["Cookies", "JavaScript"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Chat messages",
        "Usage data",
        "Device information",
        "Email address"
      ],
      legalBasis: "consent",
      retention: "2 years",
      transferCountries: ["United States of America"],
      privacyUrl: "https://www.intercom.com/legal/privacy",
      cookiePolicyUrl: ""
    },
    hubspot: {
      displayName: "HubSpot",
      category: "marketing",
      description: "CRM and marketing automation platform. Tracks website visitor behavior to enable lead generation and marketing automation.",
      processor: {
        name: "HubSpot, Inc.",
        address: "25 First Street, Cambridge, MA 02141, USA",
        dpo: "privacy@hubspot.com"
      },
      purposes: ["Marketing", "Analytics", "CRM", "Lead generation"],
      technologies: ["Cookies", "Pixel", "JavaScript"],
      dataCollected: [
        "IP address",
        "Browser information",
        "Form submissions",
        "Pages visited",
        "Usage data",
        "Email address"
      ],
      legalBasis: "consent",
      retention: "13 months",
      transferCountries: ["United States of America"],
      privacyUrl: "https://legal.hubspot.com/privacy-policy",
      cookiePolicyUrl: "https://legal.hubspot.com/cookie-policy"
    },
    mailchimp: {
      displayName: "Mailchimp",
      category: "marketing",
      description: "Email marketing and automation platform. Tracks email campaign interactions and website activity for subscriber management.",
      processor: {
        name: "The Rocket Science Group LLC (Mailchimp)",
        address: "675 Ponce de Leon Ave NE, Suite 5000, Atlanta, GA 30308, USA",
        dpo: "privacy@mailchimp.com"
      },
      purposes: ["Marketing", "Email campaigns", "Analytics"],
      technologies: ["Cookies", "Pixel", "Web beacons"],
      dataCollected: [
        "IP address",
        "Email behaviour",
        "Form submissions",
        "Device information",
        "Browser information"
      ],
      legalBasis: "consent",
      retention: "2 years",
      transferCountries: ["United States of America"],
      privacyUrl: "https://mailchimp.com/legal/privacy/",
      cookiePolicyUrl: "https://mailchimp.com/legal/cookies/"
    },
    maps: {
      displayName: "Google Maps",
      category: "functional",
      description: "Interactive maps service by Google embedded on the website to display locations and provide directions.",
      processor: {
        name: "Google Ireland Limited",
        address: "Gordon House, Barrow St, Dublin 4, Ireland",
        dpo: "https://support.google.com/policies/contact/general_privacy_form"
      },
      purposes: ["Functional", "Maps display", "Location services"],
      technologies: ["Cookies", "JavaScript"],
      dataCollected: ["IP address", "Location data", "Usage data", "Device information"],
      legalBasis: "consent",
      retention: "6 months",
      transferCountries: ["United States of America"],
      privacyUrl: "https://policies.google.com/privacy",
      cookiePolicyUrl: "https://policies.google.com/technologies/cookies"
    },
    recaptcha: {
      displayName: "Google reCAPTCHA",
      category: "functional",
      description: "Bot detection and security service by Google that protects forms and interactive elements from automated abuse.",
      processor: {
        name: "Google Ireland Limited",
        address: "Gordon House, Barrow St, Dublin 4, Ireland",
        dpo: "https://support.google.com/policies/contact/general_privacy_form"
      },
      purposes: ["Functional", "Security", "Bot detection"],
      technologies: ["Cookies", "JavaScript"],
      dataCollected: [
        "IP address",
        "Browser fingerprint",
        "Usage data",
        "Device information",
        "Mouse behaviour"
      ],
      legalBasis: "consent",
      retention: "6 months",
      transferCountries: ["United States of America"],
      privacyUrl: "https://policies.google.com/privacy",
      cookiePolicyUrl: "https://policies.google.com/technologies/cookies"
    }
  };
  var SERVICE_METADATA_I18N = {
    tr: {
      ga4: {
        description: "Web sitesi ziyaret\xE7ilerinin siteyle nas\u0131l etkile\u015Fime girdi\u011Fini anlamalar\u0131na yard\u0131mc\u0131 olmak i\xE7in trafik verilerini toplayan ve raporlayan web sitesi analitik hizmeti.",
        purposes: ["Analitik", "Performans \xF6l\xE7\xFCm\xFC", "Kullan\u0131c\u0131 davran\u0131\u015F\u0131 analizi"],
        technologies: ["\xC7erezler", "JavaScript"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 bilgisi",
          "Kullan\u0131m verisi",
          "Cihaz bilgisi",
          "Co\u011Frafi konum",
          "Ziyaret tarihi ve saati",
          "Ziyaret edilen sayfalar"
        ]
      },
      gtm: {
        description: "Site sahiplerinin site kodunu de\u011Fi\u015Ftirmeden pazarlama ve analitik etiketlerini y\xF6netip yay\u0131nlamas\u0131n\u0131 sa\u011Flayan etiket y\xF6netim sistemi.",
        purposes: ["Etiket y\xF6netimi", "Analitik", "Pazarlama"],
        technologies: ["Web sitesi etiketleri", "JavaScript"],
        dataCollected: ["Toplu etiket tetikleme verisi", "Tan\u0131lama verisi"]
      },
      facebook: {
        description: "Meta taraf\u0131ndan geli\u015Ftirilen, reklam etkinli\u011Fini \xF6l\xE7en ve siteyi ziyaret eden kullan\u0131c\u0131lar\u0131n yeniden hedeflenmesini sa\u011Flayan izleme teknolojisi.",
        purposes: ["Analitik", "Pazarlama", "Yeniden hedefleme", "Reklam", "D\xF6n\xFC\u015F\xFCm izleme"],
        technologies: ["\xC7erezler", "Piksel"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 bilgisi",
          "Cihaz bilgisi",
          "Ziyaret edilen sayfalar",
          "Piksel ID",
          "G\xF6r\xFCnt\xFClenen reklamlar",
          "Kullan\u0131m davran\u0131\u015F\u0131",
          "Y\xF6nlendiren URL"
        ]
      },
      clarity: {
        description: "Kullan\u0131c\u0131 oturumlar\u0131n\u0131 kaydeden ve \u0131s\u0131 haritalar\u0131 olu\u015Fturan, ziyaret\xE7ilerin siteyle nas\u0131l etkile\u015Fime girdi\u011Fini anlamaya yard\u0131mc\u0131 olan davran\u0131\u015Fsal analitik arac\u0131.",
        purposes: ["Analitik", "Is\u0131 haritalar\u0131", "Oturum kayd\u0131"],
        technologies: ["\xC7erezler", "JavaScript"],
        dataCollected: [
          "IP adresi",
          "Fare hareketleri",
          "T\u0131klamalar",
          "Kayd\u0131rmalar",
          "Taray\u0131c\u0131 bilgisi",
          "Cihaz bilgisi",
          "Y\xF6nlendiren URL"
        ]
      },
      hotjar: {
        description: "Is\u0131 haritalar\u0131, oturum kay\u0131tlar\u0131 ve geri bildirim ara\xE7lar\u0131 sunarak ziyaret\xE7i davran\u0131\u015F\u0131n\u0131 anlamay\u0131 sa\u011Flayan kullan\u0131c\u0131 deneyimi analitik platformu.",
        purposes: ["Analitik", "Is\u0131 haritalar\u0131", "Kullan\u0131c\u0131 geri bildirimi", "Oturum kayd\u0131"],
        technologies: ["\xC7erezler", "Piksel", "JavaScript"],
        dataCollected: [
          "IP adresi",
          "Kullan\u0131m verisi",
          "Fare hareketleri",
          "T\u0131klama davran\u0131\u015F\u0131",
          "Cihaz bilgisi",
          "Taray\u0131c\u0131 bilgisi"
        ]
      },
      youtube: {
        description: "Google'a ait video bar\u0131nd\u0131rma hizmeti. Etkinle\u015Ftirildi\u011Finde, sitede g\xF6m\xFCl\xFC YouTube videolar\u0131 oynat\u0131labilir ve ilgili \xE7erezler ayarlan\u0131r.",
        purposes: ["Pazarlama", "Video i\xE7erik sunumu", "Ki\u015Fiselle\u015Ftirme"],
        technologies: ["\xC7erezler", "Piksel"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 bilgisi",
          "Kullan\u0131m verisi",
          "Video izleme verisi",
          "Cihaz bilgisi"
        ]
      },
      vimeo: {
        description: "Video bar\u0131nd\u0131rma ve payla\u015F\u0131m platformu. Etkinle\u015Ftirildi\u011Finde, sitede g\xF6m\xFCl\xFC Vimeo videolar\u0131 oynat\u0131labilir.",
        purposes: ["Pazarlama", "Video i\xE7erik sunumu"],
        technologies: ["\xC7erezler", "JavaScript"],
        dataCollected: ["IP adresi", "Taray\u0131c\u0131 bilgisi", "Video izleme verisi", "Cihaz bilgisi"]
      },
      linkedin: {
        description: "LinkedIn taraf\u0131ndan sunulan, d\xF6n\xFC\u015F\xFCm izleme ve site ziyaret\xE7ilerinin LinkedIn Reklamlar\u0131 \xFCzerinden yeniden hedeflenmesini sa\u011Flayan analitik ve yeniden hedefleme etiketi.",
        purposes: ["Pazarlama", "Analitik", "Yeniden hedefleme", "D\xF6n\xFC\u015F\xFCm izleme"],
        technologies: ["\xC7erezler", "Piksel"],
        dataCollected: [
          "IP adresi",
          "Cihaz bilgisi",
          "Ziyaret edilen sayfalar",
          "Y\xF6nlendiren URL",
          "Mesleki veri"
        ]
      },
      yandex: {
        description: "Optimizasyon ve pazarlama ama\xE7lar\u0131yla kullan\u0131c\u0131 davran\u0131\u015F\u0131na ili\u015Fkin istatistiksel verileri toplay\u0131p de\u011Ferlendiren web analitik hizmeti.",
        purposes: ["Analitik", "Optimizasyon"],
        technologies: ["\xC7erezler", "Web i\u015Faret\xE7ileri", "Piksel"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 bilgisi",
          "Kullan\u0131m verisi",
          "Cihaz bilgisi",
          "Ziyaret tarihi ve saati",
          "Co\u011Frafi konum"
        ]
      },
      bing: {
        description: "Microsoft Bing taraf\u0131ndan sunulan, Bing Ads kampanyalar\u0131 i\xE7in d\xF6n\xFC\u015F\xFCm izleme ve kitle hedeflemeyi sa\u011Flayan Evrensel Etkinlik \u0130zleme (UET) etiketi.",
        purposes: ["Pazarlama", "D\xF6n\xFC\u015F\xFCm izleme", "Kitle hedefleme"],
        technologies: ["\xC7erezler", "Piksel"],
        dataCollected: ["IP adresi", "Taray\u0131c\u0131 bilgisi", "D\xF6n\xFC\u015F\xFCm verisi", "Cihaz bilgisi"]
      },
      tiktok: {
        description: "TikTok reklam performans\u0131n\u0131 \xF6l\xE7en ve TikTok reklam kampanyalar\u0131 i\xE7in yeniden hedeflemeyi sa\u011Flayan TikTok izleme pikseli.",
        purposes: ["Pazarlama", "Yeniden hedefleme", "D\xF6n\xFC\u015F\xFCm izleme"],
        technologies: ["\xC7erezler", "Piksel"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 bilgisi",
          "Kullan\u0131m verisi",
          "Cihaz bilgisi",
          "Ziyaret edilen sayfalar"
        ]
      },
      pinterest: {
        description: "Pinterest taraf\u0131ndan sunulan, d\xF6n\xFC\u015F\xFCmleri izleyen ve site ziyaret\xE7ilerinin Pinterest Reklamlar\u0131 \xFCzerinden hedeflenmesini sa\u011Flayan analitik ve yeniden hedefleme etiketi.",
        purposes: ["Pazarlama", "Yeniden hedefleme", "D\xF6n\xFC\u015F\xFCm izleme"],
        technologies: ["\xC7erezler", "Piksel"],
        dataCollected: ["IP adresi", "Taray\u0131c\u0131 bilgisi", "Kullan\u0131m verisi", "Cihaz bilgisi"]
      },
      tawkto: {
        description: "Site ziyaret\xE7ilerinin destek temsilcileriyle ger\xE7ek zamanl\u0131 ileti\u015Fim kurmas\u0131n\u0131 sa\u011Flayan canl\u0131 sohbet widget'\u0131.",
        purposes: ["Fonksiyonel", "Canl\u0131 sohbet", "M\xFC\u015Fteri deste\u011Fi"],
        technologies: ["\xC7erezler", "JavaScript"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 bilgisi",
          "Sohbet mesajlar\u0131",
          "Kullan\u0131m verisi",
          "Cihaz bilgisi"
        ]
      },
      intercom: {
        description: "Canl\u0131 sohbet, uygulama i\xE7i mesajla\u015Fma ve m\xFC\u015Fteri destek ara\xE7lar\u0131 sunan m\xFC\u015Fteri mesajla\u015Fma platformu.",
        purposes: ["Fonksiyonel", "M\xFC\u015Fteri deste\u011Fi", "Pazarlama"],
        technologies: ["\xC7erezler", "JavaScript"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 bilgisi",
          "Sohbet mesajlar\u0131",
          "Kullan\u0131m verisi",
          "Cihaz bilgisi",
          "E-posta adresi"
        ]
      },
      hubspot: {
        description: "CRM ve pazarlama otomasyonu platformu. Potansiyel m\xFC\u015Fteri olu\u015Fturma ve pazarlama otomasyonunu sa\u011Flamak i\xE7in site ziyaret\xE7i davran\u0131\u015F\u0131n\u0131 izler.",
        purposes: ["Pazarlama", "Analitik", "CRM", "Potansiyel m\xFC\u015Fteri olu\u015Fturma"],
        technologies: ["\xC7erezler", "Piksel", "JavaScript"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 bilgisi",
          "Form g\xF6nderimleri",
          "Ziyaret edilen sayfalar",
          "Kullan\u0131m verisi",
          "E-posta adresi"
        ]
      },
      mailchimp: {
        description: "E-posta pazarlama ve otomasyon platformu. Abone y\xF6netimi i\xE7in e-posta kampanyas\u0131 etkile\u015Fimlerini ve site aktivitesini izler.",
        purposes: ["Pazarlama", "E-posta kampanyalar\u0131", "Analitik"],
        technologies: ["\xC7erezler", "Piksel", "Web i\u015Faret\xE7ileri"],
        dataCollected: [
          "IP adresi",
          "E-posta davran\u0131\u015F\u0131",
          "Form g\xF6nderimleri",
          "Cihaz bilgisi",
          "Taray\u0131c\u0131 bilgisi"
        ]
      },
      maps: {
        description: "Konumlar\u0131 g\xF6stermek ve yol tarifi sa\u011Flamak i\xE7in sitede g\xF6m\xFCl\xFC, Google taraf\u0131ndan sunulan interaktif harita hizmeti.",
        purposes: ["Fonksiyonel", "Harita g\xF6sterimi", "Konum hizmetleri"],
        technologies: ["\xC7erezler", "JavaScript"],
        dataCollected: ["IP adresi", "Konum verisi", "Kullan\u0131m verisi", "Cihaz bilgisi"]
      },
      recaptcha: {
        description: "Formlar\u0131 ve etkile\u015Fimli \xF6\u011Feleri otomatik k\xF6t\xFCye kullan\u0131mdan koruyan, Google taraf\u0131ndan sunulan bot tespiti ve g\xFCvenlik hizmeti.",
        purposes: ["Fonksiyonel", "G\xFCvenlik", "Bot tespiti"],
        technologies: ["\xC7erezler", "JavaScript"],
        dataCollected: [
          "IP adresi",
          "Taray\u0131c\u0131 parmak izi",
          "Kullan\u0131m verisi",
          "Cihaz bilgisi",
          "Fare davran\u0131\u015F\u0131"
        ]
      }
    }
  };
  var getServiceMeta = (key, locale) => {
    const base = SERVICE_METADATA[key];
    if (!base) return null;
    const overlay = SERVICE_METADATA_I18N[locale] && SERVICE_METADATA_I18N[locale][key];
    if (!overlay) return base;
    return { ...base, ...overlay };
  };

  // src/data/cookie-inspector.js
  var matchesPreset = (matcher, name) => matcher instanceof RegExp ? matcher.test(name) : matcher === name;
  var findOwningPreset = (name, presets) => {
    if (!presets) return null;
    const keys = Object.keys(presets);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const preset = presets[key];
      if (!preset || !preset.cookies) continue;
      for (let m = 0; m < preset.cookies.length; m++) {
        if (matchesPreset(preset.cookies[m], name)) {
          return { key, preset };
        }
      }
    }
    return null;
  };
  var listObservedCookies = (presets) => {
    const names = readCookieNames();
    const out = [];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (name === COOKIE_NAME) {
        out.push({
          name,
          service: "Blakfy Cookie",
          category: "essential",
          purposes: ["Stores your consent decision"],
          essential: true,
          unrecognised: false
        });
        continue;
      }
      const owner = findOwningPreset(name, presets);
      if (owner) {
        const meta = SERVICE_METADATA[owner.key];
        out.push({
          name,
          service: meta && meta.displayName || owner.preset.name || owner.key,
          category: owner.preset.category || meta && meta.category || null,
          purposes: meta && meta.purposes || [],
          essential: false,
          unrecognised: false
        });
        continue;
      }
      out.push({
        name,
        service: null,
        category: null,
        purposes: [],
        essential: false,
        unrecognised: true
      });
    }
    return out;
  };
  var deleteObservedCookie = (name) => {
    if (!name || name === COOKIE_NAME) return false;
    expireCookie(name);
    return true;
  };

  // src/gating/placeholder.js
  var fmt = (tpl, vars) => {
    if (!tpl) return "";
    return tpl.replace(/\{(\w+)\}/g, (_, k) => vars && vars[k] != null ? vars[k] : "{" + k + "}");
  };
  var createPlaceholder = ({ category, srcUrl, t, onAccept }) => {
    const ph = t && t.placeholder || {};
    const cat = t && t.cat && t.cat[category] && t.cat[category].title || category || "";
    const titleText = ph.title || "Content blocked";
    const descText = fmt(ph.desc || "Allow {category} cookies to view this content.", {
      category: cat
    });
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

  // src/gating/leak-detector.js
  var isOwnUnblocked = (el2) => el2.getAttribute("data-blakfy-unblocked") === "true";
  var scanForLeaks = ({ activePresetNames, presets, getConsent }) => {
    if (typeof document === "undefined" || !Array.isArray(activePresetNames)) return [];
    const leaks = [];
    const scripts = document.querySelectorAll("script[src]");
    for (let i = 0; i < activePresetNames.length; i++) {
      const preset = presets[activePresetNames[i]];
      const hosts = preset && preset.scriptHosts;
      if (!preset || !hosts || !hosts.length) continue;
      for (let j = 0; j < scripts.length; j++) {
        const el2 = scripts[j];
        if (isOwnUnblocked(el2)) continue;
        const src = el2.src || "";
        for (let k = 0; k < hosts.length; k++) {
          if (src.indexOf(hosts[k]) === -1) continue;
          leaks.push({
            preset: activePresetNames[i],
            name: preset.name,
            host: hosts[k],
            src,
            category: preset.category,
            consentGranted: typeof getConsent === "function" ? !!getConsent(preset.category) : null
          });
          break;
        }
      }
    }
    return leaks;
  };
  var warnLeaks = (leaks) => {
    if (!Array.isArray(leaks) || !leaks.length) return;
    if (typeof console === "undefined" || typeof console.warn !== "function") return;
    for (let i = 0; i < leaks.length; i++) {
      const l = leaks[i];
      console.warn(
        "[Blakfy Cookie] Un-gated tracker detected: " + l.name + " (" + l.host + ") is running outside Blakfy's consent gating" + (l.consentGranted ? "" : ", and consent for '" + l.category + "' was NOT granted") + `. This script was not loaded via a type="text/plain" Blakfy tag, so this widget cannot control it \u2014 check the platform's own marketing/analytics integrations panel (e.g. Wix Marketing Tags, Shopify Preferences) for a native copy of this tool and disconnect it there. src=` + l.src
      );
    }
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
  var styleRootRef = null;
  var resolveStyleRoot = () => styleRootRef || (typeof document !== "undefined" ? document.head : null);
  var buildBadgeHref = (medium = "cookie-badge") => {
    try {
      const url = new URL(BADGE_HREF);
      const override = typeof document !== "undefined" && document.documentElement ? document.documentElement.getAttribute("data-blakfy-attribution") : null;
      if (override === "off") return url.toString();
      const source = override && override.trim() ? override.trim() : typeof location !== "undefined" ? location.hostname.replace(/^www\./, "") : "";
      if (source) url.searchParams.set("utm_source", source);
      url.searchParams.set("utm_medium", medium);
      url.searchParams.set("utm_campaign", "powered-by");
      return url.toString();
    } catch (e) {
      return BADGE_HREF;
    }
  };
  var buildBadge = () => {
    const a = document.createElement("a");
    a.href = buildBadgeHref();
    a.target = "_blank";
    a.rel = "noopener";
    a.referrerPolicy = "origin";
    a.className = BADGE_CLASS;
    a.setAttribute("aria-label", "Powered by Blakfy Studio \u2014 opens in new tab");
    const prefix = document.createTextNode(BADGE_TEXT_PREFIX);
    a.appendChild(prefix);
    const strong = document.createElement("strong");
    strong.textContent = BADGE_BRAND;
    a.appendChild(strong);
    const cssText = "display: flex !important; align-items: center; gap: 4px;position: absolute; bottom: 8px; right: 12px;font-size: 11px; font-family: system-ui, -apple-system, sans-serif;color: inherit; text-decoration: none;opacity: 0.6 !important; transition: opacity 0.2s;pointer-events: auto !important;z-index: 1;";
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
    const target = resolveStyleRoot() || document.head || document.documentElement;
    if (!target || target.querySelector("#" + PROTECT_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PROTECT_STYLE_ID;
    style.textContent = PROTECT_CSS;
    target.appendChild(style);
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
    const styleRoot = resolveStyleRoot();
    if (!styleRoot || !styleRoot.querySelector("#" + PROTECT_STYLE_ID)) {
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
  var installAntiTamper = (rootEl, styleRoot) => {
    if (!rootEl || typeof MutationObserver === "undefined") return;
    rootRef = rootEl;
    styleRootRef = styleRoot || resolveStyleRoot();
    injectProtectStyle();
    if (observer) observer.disconnect();
    observer = new MutationObserver(handleMutations);
    observer.observe(rootEl, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ["style", "class", "hidden"]
    });
    if (styleRootRef && typeof styleRootRef.querySelector === "function") {
      observer.observe(styleRootRef, { childList: true, subtree: false });
    }
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(verifyBadges, 2e3);
  };

  // src/i18n/policy-strings.js
  var POLICY_STRINGS = {
    tr: {
      tabLabel: "Politika",
      heading: "\xC7erez ve Gizlilik Bildirimi",
      incomplete: "Bildirim eksik: site sahibi bilgileri (data-blakfy-operator / -operator-contact) tan\u0131mlanmam\u0131\u015F. Yay\u0131n \xF6ncesi tamamlanmal\u0131.",
      controllerTitle: "Veri Sorumlusu",
      controllerName: "Unvan",
      controllerContact: "\u0130leti\u015Fim",
      controllerAddress: "Adres",
      cookiesTitle: "Kullan\u0131lan Hizmetler",
      noCookies: "\xDC\xE7\xFCnc\xFC taraf hizmet yap\u0131land\u0131r\u0131lmam\u0131\u015F.",
      purposeLabel: "Ama\xE7",
      legalBasisLabel: "Hukuki Sebep",
      retentionLabel: "Saklama S\xFCresi",
      rightsTitle: "Haklar\u0131n\u0131z",
      rightsGDPR: "GDPR: eri\u015Fim, d\xFCzeltme, silme, k\u0131s\u0131tlama, ta\u015F\u0131nabilirlik ve itiraz hakk\u0131.",
      rightsKVKK: "KVKK Md.11: bilgi talep etme, d\xFCzeltme, silme ve itiraz hakk\u0131.",
      rightsCCPA: "CCPA: bilgi edinme, silme talebi ve sat\u0131\u015Ftan vazge\xE7me (opt-out) hakk\u0131.",
      rightsDefault: "Haklar\u0131n\u0131z i\xE7in yukar\u0131daki ileti\u015Fim bilgilerini kullan\u0131n.",
      versionLabel: "S\xFCr\xFCm",
      lastDecisionLabel: "Son karar",
      footnote: "Bu bildirim yap\u0131land\u0131r\u0131lm\u0131\u015F hizmetlerden otomatik \xFCretilmi\u015Ftir."
    },
    en: {
      tabLabel: "Policy",
      heading: "Cookie & Privacy Notice",
      incomplete: "Notice incomplete: operator identity (data-blakfy-operator / -operator-contact) not configured. Complete before going live.",
      controllerTitle: "Data Controller",
      controllerName: "Name",
      controllerContact: "Contact",
      controllerAddress: "Address",
      cookiesTitle: "Services Used",
      noCookies: "No third-party service is configured on this site.",
      purposeLabel: "Purpose",
      legalBasisLabel: "Legal Basis",
      retentionLabel: "Retention",
      rightsTitle: "Your Rights",
      rightsGDPR: "GDPR: right to access, rectify, erase, restrict, port and object.",
      rightsKVKK: "KVKK Art. 11: right to information, rectification, erasure and objection.",
      rightsCCPA: "CCPA: right to know, delete, and opt out of sale/sharing.",
      rightsDefault: "Use the contact details above to exercise your data rights.",
      versionLabel: "Version",
      lastDecisionLabel: "Last decision",
      footnote: "This notice was generated automatically from configured services."
    }
  };
  var getPolicyStrings = (locale) => POLICY_STRINGS[locale] || POLICY_STRINGS.en;

  // src/compliance/policy-text.js
  var RIGHTS_KEY_BY_JURISDICTION = {
    GDPR: "rightsGDPR",
    KVKK: "rightsKVKK",
    CCPA: "rightsCCPA"
  };
  var isAutoPolicy = (policyUrl) => !policyUrl || policyUrl === "auto";
  var buildPolicyText = ({
    locale,
    operator,
    operatorContact,
    operatorAddress,
    jurisdiction,
    policyVersion,
    consentTimestamp,
    enrichedPresets
  }) => {
    const s = getPolicyStrings(locale);
    const hasOperator = !!(operator && operatorContact);
    const services = (enrichedPresets || []).filter((p) => p && p.meta).map((p) => ({
      key: p.key,
      displayName: p.meta.displayName || p.key,
      category: p.meta.category || "",
      purposes: p.meta.purposes || [],
      legalBasis: p.meta.legalBasis || "",
      retention: p.meta.retention || "",
      processorName: p.meta.processor && p.meta.processor.name || "",
      transferCountries: p.meta.transferCountries || []
    }));
    const rightsKey = RIGHTS_KEY_BY_JURISDICTION[jurisdiction] || "rightsDefault";
    return {
      incomplete: !hasOperator,
      strings: s,
      controller: {
        name: operator || null,
        contact: operatorContact || null,
        address: operatorAddress || null
      },
      services,
      rightsText: s[rightsKey] || s.rightsDefault,
      policyVersion: policyVersion || null,
      consentTimestamp: consentTimestamp || null
    };
  };

  // src/ui/banner.js
  var createBanner = ({
    t,
    isRTL,
    accent,
    theme,
    locale,
    policyUrl,
    onAccept,
    onReject,
    onPrefs,
    onOpenPolicy
  }) => {
    const card = document.createElement("div");
    card.className = "blakfy-card";
    card.setAttribute("dir", isRTL ? "rtl" : "ltr");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-labelledby", "blakfy-title");
    card.setAttribute("aria-describedby", "blakfy-desc");
    if (locale) card.setAttribute("lang", locale);
    card.style.cssText = "--blakfy-accent:" + accent;
    if (theme && theme !== "light") card.setAttribute("data-blakfy-theme", theme);
    const h2 = document.createElement("h2");
    h2.id = "blakfy-title";
    h2.textContent = t.title;
    card.appendChild(h2);
    const p = document.createElement("p");
    p.id = "blakfy-desc";
    p.textContent = t.intro + " ";
    const a = document.createElement("a");
    if (isAutoPolicy(policyUrl)) {
      a.href = "#";
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (onOpenPolicy) onOpenPolicy();
      });
    } else {
      a.href = policyUrl;
    }
    a.textContent = t.policyLink;
    p.appendChild(a);
    card.appendChild(p);
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
    card.appendChild(actions);
    const badgeSlot = document.createElement("div");
    badgeSlot.className = "blakfy-badge-slot";
    card.appendChild(badgeSlot);
    return card;
  };

  // src/ui/fab.js
  var FAB_CLASS = "blakfy-fab";
  var FINGERPRINT_SVG = '<svg viewBox="0 0 24 24" width="var(--blakfy-fab-icon-size,20px)" height="var(--blakfy-fab-icon-size,20px)" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3a6 6 0 0 0-6 6v2c0 3.5-1 6-2 7.5"/><path d="M12 3a6 6 0 0 1 6 6v2c0 1.2.15 2.6.5 4"/><path d="M8 21c1-1.5 2-4 2-8v-1a2 2 0 1 1 4 0v3"/><path d="M4 15.5c.7-1.2 1-3 1-4.5V9a7 7 0 0 1 3.5-6.06"/><path d="M16 5.5A7 7 0 0 1 19 11v1.5c0 2.5.3 4.5 1 6"/><path d="M12 8a3 3 0 0 1 3 3v1c0 3 .5 5 1.5 7"/></svg>';
  var createFab = (opts) => {
    const o = opts || {};
    if (typeof document === "undefined") return null;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = FAB_CLASS;
    btn.setAttribute("aria-label", o.ariaLabel || "Privacy settings");
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("data-blakfy-open", "");
    btn.innerHTML = FINGERPRINT_SVG;
    if (o.isRTL) btn.dir = "rtl";
    btn.addEventListener("click", () => {
      if (typeof o.onOpen === "function") o.onOpen();
    });
    return btn;
  };
  var resolveFabConfig = (config) => {
    const side = config && config.fabSide ? String(config.fabSide) : "right";
    if (side === "off") return null;
    return {
      side: side === "left" ? "left" : "right",
      offset: config && config.fabOffset != null ? config.fabOffset : null,
      size: config && config.fabSize != null ? config.fabSize : null,
      // #63b: independent width/height -> a real rectangle, not just a smaller square.
      // Also sizes the clickable box to match (see applyFabTokens) so there is no
      // invisible touch-target padding around a smaller visible shape.
      width: config && config.fabWidth != null ? config.fabWidth : null,
      height: config && config.fabHeight != null ? config.fabHeight : null,
      color: config && config.fabColor != null ? config.fabColor : null,
      // Raw CSS value (px or %), not a number -- "4px", "50%", "0" all valid.
      radius: config && config.fabRadius != null ? config.fabRadius : null,
      iconColor: config && config.fabIconColor != null ? config.fabIconColor : null,
      iconSize: config && config.fabIconSize != null ? config.fabIconSize : null
    };
  };
  var applyFabTokens = (btn, resolved) => {
    if (!btn || !resolved) return;
    btn.classList.toggle("blakfy-fab--right", resolved.side === "right");
    btn.classList.toggle("blakfy-fab--left", resolved.side !== "right");
    if (resolved.offset != null) {
      btn.style.setProperty("--blakfy-fab-offset-x", resolved.offset + "px");
      btn.style.setProperty("--blakfy-fab-offset-y", resolved.offset + "px");
    }
    if (resolved.size != null) {
      btn.style.setProperty("--blakfy-fab-size", resolved.size + "px");
    }
    if (resolved.width != null) {
      btn.style.setProperty("--blakfy-fab-target-w", resolved.width + "px");
      btn.style.setProperty("--blakfy-fab-size-w", resolved.width + "px");
    }
    if (resolved.height != null) {
      btn.style.setProperty("--blakfy-fab-target-h", resolved.height + "px");
      btn.style.setProperty("--blakfy-fab-size-h", resolved.height + "px");
    }
    if (resolved.radius != null) {
      btn.style.setProperty("--blakfy-fab-radius", resolved.radius);
    }
    if (resolved.iconColor != null) {
      btn.style.setProperty("--blakfy-fab-color", resolved.iconColor);
    }
    if (resolved.iconSize != null) {
      const iconSize = typeof resolved.iconSize === "number" ? resolved.iconSize + "px" : resolved.iconSize;
      btn.style.setProperty("--blakfy-fab-icon-size", iconSize);
    }
    if (resolved.color != null) {
      btn.style.setProperty("--blakfy-fab-bg", resolved.color);
    }
  };

  // src/ui/focus-trap.js
  var FOCUSABLE = 'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var activeRoot = null;
  var activeHandler = null;
  var activeEscape = null;
  var restoreFocusTarget = null;
  var inertedNodes = [];
  var scrollLockApplied = false;
  var prevBodyOverflow = "";
  var prevScrollY = 0;
  var supportsInert = () => typeof document !== "undefined" && "inert" in document.createElement("div");
  var getDeepActiveElement = () => {
    if (typeof document === "undefined") return null;
    let el2 = document.activeElement;
    while (el2 && el2.shadowRoot && el2.shadowRoot.activeElement) {
      el2 = el2.shadowRoot.activeElement;
    }
    return el2;
  };
  var applyBackgroundInert = (skipEl) => {
    if (typeof document === "undefined" || !document.body) return;
    const useInert = supportsInert();
    const children = document.body.children;
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node === skipEl || skipEl && node.contains && node.contains(skipEl)) continue;
      if (useInert) {
        inertedNodes.push({ node, hadInert: node.hasAttribute("inert") });
        node.setAttribute("inert", "");
      } else {
        inertedNodes.push({
          node,
          hadTabindex: node.hasAttribute("tabindex"),
          prevTabindex: node.getAttribute("tabindex"),
          hadAriaHidden: node.hasAttribute("aria-hidden")
        });
        node.setAttribute("tabindex", "-1");
        node.setAttribute("aria-hidden", "true");
      }
    }
  };
  var removeBackgroundInert = () => {
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
  var lockBodyScroll = () => {
    if (typeof document === "undefined" || !document.body) return;
    scrollLockApplied = true;
    prevScrollY = typeof window !== "undefined" && (window.scrollY || window.pageYOffset) || 0;
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  };
  var unlockBodyScroll = () => {
    if (!scrollLockApplied || typeof document === "undefined" || !document.body) return;
    document.body.style.overflow = prevBodyOverflow;
    scrollLockApplied = false;
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      try {
        window.scrollTo(0, prevScrollY);
      } catch (e) {
      }
    }
  };
  var installFocusTrap = (rootEl, options) => {
    const opts = options || {};
    const opener = opts.returnFocus === false || typeof document === "undefined" ? null : getDeepActiveElement();
    removeFocusTrap();
    if (!rootEl) return;
    activeRoot = rootEl;
    activeEscape = opts.onEscape;
    restoreFocusTarget = opener;
    if (opts.trapBackground) {
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
  var removeFocusTrap = () => {
    if (activeHandler) {
      document.removeEventListener("keydown", activeHandler);
    }
    removeBackgroundInert();
    unlockBodyScroll();
    if (restoreFocusTarget && typeof restoreFocusTarget.focus === "function" && restoreFocusTarget.isConnected) {
      restoreFocusTarget.focus();
    }
    restoreFocusTarget = null;
    activeRoot = null;
    activeHandler = null;
    activeEscape = null;
  };

  // src/ui/modal.js
  var CATEGORIES2 = ["essential", "analytics", "marketing", "functional", "recording"];
  var el = (tag, props) => {
    const node = document.createElement(tag);
    if (props) {
      for (const k in props) {
        if (k === "text") node.textContent = props[k];
        else if (k === "html") node.innerHTML = props[k];
        else if (k === "class") node.className = props[k];
        else node.setAttribute(k, props[k]);
      }
    }
    return node;
  };
  var safeGet = (obj, path, fallback) => {
    let cur = obj;
    const parts = path.split(".");
    for (let i = 0; i < parts.length; i++) {
      if (cur == null) return fallback;
      cur = cur[parts[i]];
    }
    return cur != null ? cur : fallback;
  };
  var buildCatRow = (key, t, alwaysOn, checked) => {
    const c = safeGet(t, "cat." + key, {});
    const row = el("div", { class: "blakfy-cat" });
    const titleId = "blakfy-cat-title-" + key;
    const text = el("div", { class: "blakfy-cat-text" });
    const strong = el("strong", { id: titleId, text: c.title || key });
    text.appendChild(strong);
    const span = el("span", {
      text: (c.desc || "") + (alwaysOn ? " (" + (c.always || "") + ")" : "")
    });
    text.appendChild(span);
    row.appendChild(text);
    const sw = el("button", {
      class: "blakfy-switch",
      role: "switch",
      "aria-checked": checked ? "true" : "false",
      "aria-labelledby": titleId,
      "data-cat": key
    });
    if (alwaysOn) sw.disabled = true;
    sw.addEventListener("click", () => {
      if (sw.disabled) return;
      sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") === "true" ? "false" : "true");
    });
    row.appendChild(sw);
    return row;
  };
  var buildCategoriesPanel = (t, current, card, onSave, onAccept) => {
    const panel = el("div", {
      class: "blakfy-tab-panel",
      "data-panel": "categories",
      "aria-hidden": "false"
    });
    panel.appendChild(buildCatRow("essential", t, true, true));
    panel.appendChild(buildCatRow("analytics", t, false, !!current.analytics));
    panel.appendChild(buildCatRow("marketing", t, false, !!current.marketing));
    panel.appendChild(buildCatRow("functional", t, false, !!current.functional));
    panel.appendChild(buildCatRow("recording", t, false, !!current.recording));
    return panel;
  };
  var buildActions = (t, card, onSave, onAccept) => {
    const actions = el("div", { class: "blakfy-actions" });
    const btnSave = el("button", { class: "blakfy-btn", "data-act": "save", text: t.save || "Save" });
    btnSave.addEventListener("click", () => {
      const prefs = {};
      for (let i = 0; i < CATEGORIES2.length; i++) {
        const k = CATEGORIES2[i];
        if (k === "essential") continue;
        const sw = card.querySelector('[data-cat="' + k + '"]');
        prefs[k] = sw ? sw.getAttribute("aria-checked") === "true" : false;
      }
      if (onSave) onSave(prefs);
    });
    actions.appendChild(btnSave);
    const btnAccept = el("button", {
      class: "blakfy-btn blakfy-btn-primary",
      "data-act": "accept",
      text: t.acceptAll || "Accept All"
    });
    btnAccept.addEventListener("click", () => {
      if (onAccept) onAccept();
    });
    actions.appendChild(btnAccept);
    return actions;
  };
  var buildServiceCard = (presetKey, meta, t) => {
    const s = safeGet(t, "service", {});
    const card = el("div", { class: "blakfy-service-card" });
    const header = el("div", { class: "blakfy-service-card-header" });
    header.appendChild(el("span", { class: "blakfy-service-name", text: meta.displayName }));
    header.appendChild(el("span", { class: "blakfy-service-cat", text: meta.category }));
    const toggle = el("span", { class: "blakfy-service-toggle", text: "\u25B8" });
    header.appendChild(toggle);
    card.appendChild(header);
    const body = el("div", { class: "blakfy-service-body", "aria-hidden": "true" });
    const dl = el("dl", { class: "blakfy-service-dl" });
    const addRow = (label, value) => {
      if (!value) return;
      const dt = el("dt", { class: "blakfy-service-dt", text: label });
      const dd = el("dd", { class: "blakfy-service-dd", text: value });
      dl.appendChild(dt);
      dl.appendChild(dd);
    };
    addRow(s.description || "Description", meta.description);
    addRow(
      s.processor || "Data Processor",
      meta.processor && meta.processor.name ? meta.processor.name : ""
    );
    addRow(
      s.address || "Address",
      meta.processor && meta.processor.address ? meta.processor.address : ""
    );
    if (meta.processor && meta.processor.dpo && meta.processor.dpo.indexOf("http") !== 0) {
      addRow(s.dpo || "DPO Contact", meta.processor.dpo);
    }
    addRow(
      s.purposes || "Purposes",
      meta.purposes && meta.purposes.length ? meta.purposes.join(", ") : ""
    );
    addRow(
      s.technologies || "Technologies Used",
      meta.technologies && meta.technologies.length ? meta.technologies.join(", ") : ""
    );
    addRow(
      s.dataCollected || "Data Collected",
      meta.dataCollected && meta.dataCollected.length ? meta.dataCollected.join(", ") : ""
    );
    const lbv = safeGet(t, "service.legalBasisValues", {});
    const lbLabel = lbv[meta.legalBasis] || s.legalBasisValues && s.legalBasisValues[meta.legalBasis] || meta.legalBasis || "";
    addRow(s.legalBasis || "Legal Basis", lbLabel);
    addRow(s.retention || "Retention Period", meta.retention);
    addRow(
      s.transferCountries || "Transfer Countries",
      meta.transferCountries && meta.transferCountries.length ? meta.transferCountries.join(", ") : ""
    );
    body.appendChild(dl);
    if (meta.privacyUrl && meta.privacyUrl.length || meta.cookiePolicyUrl && meta.cookiePolicyUrl.length) {
      const links = el("div", { class: "blakfy-service-links" });
      if (meta.privacyUrl) {
        const a = el("a", {
          href: meta.privacyUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          text: s.privacyPolicy || "Privacy Policy"
        });
        links.appendChild(a);
      }
      if (meta.cookiePolicyUrl) {
        const a = el("a", {
          href: meta.cookiePolicyUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          text: s.cookiePolicy || "Cookie Policy"
        });
        links.appendChild(a);
      }
      body.appendChild(links);
    }
    card.appendChild(body);
    return { card, header, body, toggle };
  };
  var buildServicesPanel = (activePresets, t) => {
    const panel = el("div", {
      class: "blakfy-tab-panel",
      "data-panel": "services",
      "aria-hidden": "true"
    });
    const list = el("div", { class: "blakfy-service-list" });
    if (!activePresets || activePresets.length === 0) {
      const empty = el("p", {
        class: "blakfy-svc-empty",
        text: safeGet(t, "service.noServices", "No services configured.")
      });
      list.appendChild(empty);
    } else {
      const entries = [];
      for (let i = 0; i < activePresets.length; i++) {
        const { key, meta } = activePresets[i];
        if (meta) {
          const entry = buildServiceCard(key, meta, t);
          entries.push(entry);
          list.appendChild(entry.card);
        }
      }
      const closeOthers = (except) => {
        for (const entry of entries) {
          if (entry === except) continue;
          entry.body.setAttribute("aria-hidden", "true");
          entry.toggle.textContent = "\u25B8";
        }
      };
      for (const entry of entries) {
        entry.header.addEventListener("click", () => {
          const hidden = entry.body.getAttribute("aria-hidden") === "true";
          closeOthers(entry);
          entry.body.setAttribute("aria-hidden", hidden ? "false" : "true");
          entry.toggle.textContent = hidden ? "\u25BE" : "\u25B8";
        });
      }
    }
    panel.appendChild(list);
    return panel;
  };
  var buildAboutPanel = (t, version) => {
    const panel = el("div", {
      class: "blakfy-tab-panel",
      "data-panel": "about",
      "aria-hidden": "true"
    });
    const content = el("div", { class: "blakfy-about-panel" });
    const brand = el("div", { class: "blakfy-about-brand" });
    brand.appendChild(el("strong", { text: "Blakfy Studio" }));
    content.appendChild(brand);
    const ab = safeGet(t, "svcAbout", {});
    if (ab.title) content.appendChild(el("p", { text: "" })).textContent = ab.title ? "" : "";
    const desc = el("p", {
      text: ab.description || "This website uses Blakfy Cookie Management Platform (CMP) to manage your consent preferences."
    });
    content.appendChild(desc);
    const meta = el("p", { class: "blakfy-about-meta" });
    meta.textContent = (ab.version || "Version") + ": " + (version || "");
    content.appendChild(meta);
    const a = el("a", {
      href: "https://blakfy.com",
      target: "_blank",
      rel: "noopener noreferrer",
      text: ab.learnMore || "Learn more at blakfy.com"
    });
    content.appendChild(a);
    panel.appendChild(content);
    return panel;
  };
  var buildPolicyPanel = (policy) => {
    const panel = el("div", {
      class: "blakfy-tab-panel",
      "data-panel": "policy",
      "aria-hidden": "true"
    });
    const s = policy.strings;
    const content = el("div", { class: "blakfy-policy-panel" });
    content.appendChild(el("h3", { text: s.heading }));
    if (policy.incomplete) {
      content.appendChild(el("p", { class: "blakfy-policy-warning", text: s.incomplete }));
    }
    content.appendChild(el("h4", { text: s.controllerTitle }));
    const dlController = el("dl", { class: "blakfy-service-dl" });
    const addRow = (label, value) => {
      if (!value) return;
      dlController.appendChild(el("dt", { class: "blakfy-service-dt", text: label }));
      dlController.appendChild(el("dd", { class: "blakfy-service-dd", text: value }));
    };
    addRow(s.controllerName, policy.controller.name);
    addRow(s.controllerContact, policy.controller.contact);
    addRow(s.controllerAddress, policy.controller.address);
    content.appendChild(dlController);
    content.appendChild(el("h4", { text: s.cookiesTitle }));
    if (!policy.services.length) {
      content.appendChild(el("p", { text: s.noCookies }));
    } else {
      for (let i = 0; i < policy.services.length; i++) {
        const svc = policy.services[i];
        const card = el("div", { class: "blakfy-service-card" });
        card.appendChild(el("strong", { text: svc.displayName }));
        const dl = el("dl", { class: "blakfy-service-dl" });
        const row = (label, value) => {
          if (!value) return;
          dl.appendChild(el("dt", { class: "blakfy-service-dt", text: label }));
          dl.appendChild(el("dd", { class: "blakfy-service-dd", text: value }));
        };
        row(s.purposeLabel, svc.purposes.join(", "));
        row(s.legalBasisLabel, svc.legalBasis);
        row(s.retentionLabel, svc.retention);
        card.appendChild(dl);
        content.appendChild(card);
      }
    }
    content.appendChild(el("h4", { text: s.rightsTitle }));
    content.appendChild(el("p", { text: policy.rightsText }));
    const meta = el("p", { class: "blakfy-about-meta" });
    meta.textContent = s.versionLabel + ": " + (policy.policyVersion || "-") + (policy.consentTimestamp ? " \xB7 " + s.lastDecisionLabel + ": " + policy.consentTimestamp : "");
    content.appendChild(meta);
    content.appendChild(el("p", { class: "blakfy-policy-footnote", text: s.footnote }));
    panel.appendChild(content);
    return panel;
  };
  var buildCookieRow = (entry, t, onDelete) => {
    const s = safeGet(t, "cookiePanel", {});
    const row = el("div", { class: "blakfy-cookie-row" });
    const info = el("div", { class: "blakfy-cookie-info" });
    info.appendChild(el("strong", { class: "blakfy-cookie-name", text: entry.name }));
    const meta = el("span", { class: "blakfy-cookie-meta" });
    if (entry.unrecognised) {
      meta.textContent = s.unrecognised || "Unrecognised \u2014 not matched to any known service";
      meta.classList.add("blakfy-cookie-unrecognised");
    } else {
      const bits = [entry.service];
      if (entry.category) bits.push(entry.category);
      if (entry.purposes && entry.purposes.length) bits.push(entry.purposes.join(", "));
      meta.textContent = bits.filter(Boolean).join(" \xB7 ");
    }
    info.appendChild(meta);
    row.appendChild(info);
    if (entry.essential) {
      row.appendChild(
        el("span", {
          class: "blakfy-cookie-essential",
          text: s.essential || "Essential \u2014 cannot be deleted"
        })
      );
    } else {
      const del = el("button", {
        class: "blakfy-btn blakfy-cookie-delete",
        "data-cookie": entry.name,
        text: s.delete || "Delete"
      });
      del.addEventListener("click", () => {
        if (onDelete) onDelete(entry.name);
        row.remove();
      });
      row.appendChild(del);
    }
    return row;
  };
  var buildCookiesPanel = (observedCookies, t, onDelete) => {
    const s = safeGet(t, "cookiePanel", {});
    const panel = el("div", {
      class: "blakfy-tab-panel",
      "data-panel": "cookies",
      "aria-hidden": "true"
    });
    panel.appendChild(
      el("p", {
        class: "blakfy-cookie-caveat",
        text: s.caveat || "This list shows cookies readable by this page (document.cookie). It cannot see HttpOnly cookies and says nothing about localStorage, IndexedDB, or fingerprinting \u2014 it is a partial view, not a complete inventory."
      })
    );
    const list = el("div", { class: "blakfy-cookie-list" });
    if (!observedCookies || !observedCookies.length) {
      list.appendChild(
        el("p", { class: "blakfy-svc-empty", text: s.empty || "No cookies detected on this page." })
      );
    } else {
      for (let i = 0; i < observedCookies.length; i++) {
        list.appendChild(buildCookieRow(observedCookies[i], t, onDelete));
      }
    }
    panel.appendChild(list);
    return panel;
  };
  var initTabs = (card, initialTab) => {
    const btns = card.querySelectorAll(".blakfy-tab-btn");
    const panels = card.querySelectorAll(".blakfy-tab-panel");
    const switchTab = (target) => {
      for (let i = 0; i < btns.length; i++) {
        const active = btns[i].getAttribute("data-tab") === target;
        btns[i].setAttribute("aria-selected", active ? "true" : "false");
        if (active) btns[i].classList.add("blakfy-tab-btn--active");
        else btns[i].classList.remove("blakfy-tab-btn--active");
      }
      for (let i = 0; i < panels.length; i++) {
        panels[i].setAttribute(
          "aria-hidden",
          panels[i].getAttribute("data-panel") === target ? "false" : "true"
        );
      }
    };
    for (let i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function() {
        switchTab(this.getAttribute("data-tab"));
      });
    }
    if (initialTab) {
      const exists = card.querySelector('.blakfy-tab-btn[data-tab="' + initialTab + '"]');
      if (exists) switchTab(initialTab);
    }
  };
  var createModal = ({
    t,
    isRTL,
    accent,
    theme,
    locale,
    currentState,
    presets,
    version,
    onSave,
    onAccept,
    onClose,
    policyUrl,
    operator,
    operatorContact,
    operatorAddress,
    jurisdiction,
    policyVersion,
    initialTab,
    cookiePanel,
    observedCookies,
    onDeleteCookie
  }) => {
    const current = currentState || {
      analytics: false,
      marketing: false,
      functional: false,
      recording: false
    };
    const card = el("div", {
      class: "blakfy-card",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "blakfy-mtitle"
    });
    card.setAttribute("dir", isRTL ? "rtl" : "ltr");
    if (locale) card.setAttribute("lang", locale);
    card.style.cssText = "--blakfy-accent:" + accent + ";position:relative";
    if (theme && theme !== "light") card.setAttribute("data-blakfy-theme", theme);
    const closeBtn = el("button", {
      class: "blakfy-close",
      "aria-label": t.close || "Close",
      "data-act": "close",
      text: "\xD7"
    });
    closeBtn.addEventListener("click", () => {
      if (onClose) onClose();
    });
    card.appendChild(closeBtn);
    const h2 = el("h2", { id: "blakfy-mtitle", text: t.title || "Cookie Preferences" });
    card.appendChild(h2);
    const tabs = safeGet(t, "tabs", {
      categories: "Categories",
      services: "Services",
      about: "About"
    });
    const tabBar = el("nav", { class: "blakfy-tabs", role: "tablist" });
    const makeTabBtn = (id, label, active) => {
      const btn = el("button", {
        class: "blakfy-tab-btn" + (active ? " blakfy-tab-btn--active" : ""),
        role: "tab",
        "data-tab": id,
        "aria-selected": active ? "true" : "false",
        text: label
      });
      return btn;
    };
    tabBar.appendChild(makeTabBtn("categories", tabs.categories || "Categories", true));
    tabBar.appendChild(makeTabBtn("services", tabs.services || "Services", false));
    tabBar.appendChild(makeTabBtn("about", tabs.about || "About", false));
    card.appendChild(tabBar);
    const enriched = [];
    if (presets && presets.length) {
      for (let i = 0; i < presets.length; i++) {
        const key = typeof presets[i] === "string" ? presets[i] : presets[i].key;
        const meta = getServiceMeta(key, locale) || (typeof presets[i] === "object" ? presets[i].meta : null);
        if (meta) enriched.push({ key, meta });
      }
    }
    const body = el("div", { class: "blakfy-card-body" });
    body.appendChild(buildCategoriesPanel(t, current, card, onSave, onAccept));
    body.appendChild(buildServicesPanel(enriched, t));
    body.appendChild(buildAboutPanel(t, version));
    if (isAutoPolicy(policyUrl)) {
      const policy = buildPolicyText({
        locale,
        operator,
        operatorContact,
        operatorAddress,
        jurisdiction,
        policyVersion,
        consentTimestamp: currentState && currentState.timestamp,
        enrichedPresets: enriched
      });
      if (policy.incomplete && typeof console !== "undefined" && console.error) {
        console.error(
          "[Blakfy Cookie] In-widget policy notice is INCOMPLETE \u2014 data-blakfy-operator and/or data-blakfy-operator-contact are not configured. GDPR Art. 13(1)(a) / KVKK Md.10 require the controller's identity in this notice. Set both attributes (or configure a real data-blakfy-policy-url instead) before this site goes live."
        );
      }
      tabBar.appendChild(makeTabBtn("policy", policy.strings.tabLabel, false));
      body.appendChild(buildPolicyPanel(policy));
    }
    if (cookiePanel) {
      const cookieTabLabel = safeGet(t, "tabs.cookies", "Cookies");
      tabBar.appendChild(makeTabBtn("cookies", cookieTabLabel, false));
      body.appendChild(buildCookiesPanel(observedCookies, t, onDeleteCookie));
    }
    card.appendChild(body);
    card.appendChild(buildActions(t, card, onSave, onAccept));
    card.appendChild(el("div", { class: "blakfy-badge-slot" }));
    initTabs(card, initialTab);
    return card;
  };

  // src/ui/shadow-root.js
  var HOST_ID = "blakfy-cookie-root";
  var hostEl = null;
  var root = null;
  var usingShadow = false;
  var ensureHost = () => {
    if (typeof document === "undefined") return null;
    if (hostEl && hostEl.isConnected) return hostEl;
    hostEl = document.getElementById(HOST_ID);
    if (!hostEl) {
      hostEl = document.createElement("div");
      hostEl.id = HOST_ID;
      hostEl.style.all = "initial";
      hostEl.style.display = "block";
      (document.body || document.documentElement).appendChild(hostEl);
    }
    return hostEl;
  };
  var getShadowRoot = () => {
    if (root) return root;
    const host = ensureHost();
    if (!host) return null;
    if (host.shadowRoot) {
      root = host.shadowRoot;
      usingShadow = true;
      return root;
    }
    if (typeof host.attachShadow === "function") {
      try {
        root = host.attachShadow({ mode: "open" });
        usingShadow = true;
        return root;
      } catch (e) {
      }
    }
    root = host;
    usingShadow = false;
    return root;
  };
  var getShadowHost = () => hostEl;

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
    const root2 = document.createElement("div");
    root2.className = "blakfy-status";
    root2.setAttribute("role", "status");
    root2.setAttribute("dir", rtl ? "rtl" : "ltr");
    root2.style.cssText = "background:" + bg + ";color:#fff";
    const span = document.createElement("span");
    span.className = "blakfy-status-msg";
    span.textContent = msg;
    root2.appendChild(span);
    const btn = document.createElement("button");
    btn.className = "blakfy-status-dismiss";
    btn.setAttribute("aria-label", "close");
    btn.textContent = "\u2715";
    btn.addEventListener("click", dismissStatus);
    root2.appendChild(btn);
    document.body.appendChild(root2);
    statusRoot = root2;
    statusData = data;
  };
  var STATUS_CACHE_TTL_MS = 5 * 60 * 1e3;
  var statusCacheKey = (url) => "blakfy_status_cache_" + url;
  var readStatusCache = (url) => {
    try {
      const raw = sessionStorage.getItem(statusCacheKey(url));
      if (!raw) return void 0;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.ts !== "number") return void 0;
      if (Date.now() - parsed.ts > STATUS_CACHE_TTL_MS) return void 0;
      return parsed.data === void 0 ? null : parsed.data;
    } catch (e) {
      return void 0;
    }
  };
  var writeStatusCache = (url, data) => {
    try {
      sessionStorage.setItem(statusCacheKey(url), JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
    }
  };
  var normalizeStatus = (data) => {
    if (!data || !data.active) return null;
    if (data.expires && new Date(data.expires) < /* @__PURE__ */ new Date()) return null;
    data._id = (data.expires || "") + (data.type || "");
    return data;
  };
  var fetchStatus = (url) => {
    if (!url) return Promise.resolve(null);
    const cached2 = readStatusCache(url);
    if (cached2 !== void 0) return Promise.resolve(cached2);
    return fetch(url).then((r) => r.json()).then((data) => {
      const result = normalizeStatus(data);
      writeStatusCache(url, result);
      return result;
    }).catch(() => {
      writeStatusCache(url, null);
      return null;
    });
  };

  // src/ui/styles.js
  var STYLE_ID = "blakfy-cookie-styles";
  var RULES = [
    "/* Layout architecture is locked \u2014 only --blakfy-accent is overridable */",
    // Modal mode (centered, dimmed backdrop)
    ".blakfy-overlay.modal{position:fixed !important;inset:0;background:rgba(0,0,0,.4);z-index:2147483646 !important;display:flex !important;align-items:center;justify-content:center;padding:16px}",
    // #57: on a short viewport the card had no height cap, so it overflowed above and below
    // the visible area with no way to reach the header, the close button or the actions — a
    // dead end for anyone without a physical Escape key. The cap below fixes that.
    //
    // Two things about the cap:
    //   - 100vh is the LARGE viewport on mobile: it excludes the retractable URL bar, so a
    //     card sized by it is taller than what the user can actually see and its bottom
    //     sits under the browser chrome. 100dvh tracks the visible area. The 100vh line
    //     stays first as the fallback for engines without dvh; the dvh line overrides it.
    //   - The card does NOT scroll. It is a flex column that CLIPS, with .blakfy-card-body
    //     as the single scrolling box and .blakfy-actions below it as a sibling. A footer
    //     inside the scroller scrolls away with the content, which is the whole bug this
    //     structure removes — see buildActions() in modal.js for why sticky was not enough.
    ".blakfy-overlay.modal .blakfy-card{max-height:calc(100vh - 32px);display:flex;flex-direction:column;overflow:hidden}",
    ".blakfy-overlay.modal .blakfy-card{max-height:calc(100dvh - 32px)}",
    // min-height:0 is load-bearing. A flex item's automatic minimum size is its content
    // size, so without it this box refuses to shrink below its content and overflows the
    // card instead of scrolling — the classic reason an overflow:auto flex child does
    // nothing. overscroll-behavior stops a scroll that hits the end from chaining to the
    // page behind the overlay.
    ".blakfy-overlay.modal .blakfy-card-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain}",
    // Never shrink the bar to make room for content — content scrolls, the bar does not.
    ".blakfy-overlay.modal .blakfy-actions{flex:0 0 auto;margin-top:16px}",
    // Keeps the bar clear of the home indicator on notched phones.
    ".blakfy-overlay.modal .blakfy-actions{padding-bottom:env(safe-area-inset-bottom,0px)}",
    // Widget mode (transparent, no backdrop)
    ".blakfy-overlay.widget{position:fixed !important;inset:auto;background:transparent;padding:0;display:block !important;z-index:2147483646 !important;pointer-events:none}",
    ".blakfy-overlay.widget .blakfy-card{width:min(96vw,1100px);max-width:none;border-radius:8px;position:relative;pointer-events:auto;padding-bottom:40px;box-sizing:border-box}",
    // Widget butonları kart genişliğine eşit dağılımlı
    ".blakfy-overlay.widget .blakfy-actions{flex-wrap:nowrap}",
    ".blakfy-overlay.widget .blakfy-actions .blakfy-btn{flex:1;min-width:0;min-height:36px;padding:8px 16px}",
    // Position modifiers (widget) — offset uses --blakfy-margin (default 16px, min 5px enforced in JS)
    ".blakfy-overlay.widget.bottom-center{bottom:var(--blakfy-margin,16px);left:50%;right:auto;top:auto;transform:translateX(-50%)}",
    ".blakfy-overlay.widget.bottom-right{bottom:var(--blakfy-margin,16px);right:var(--blakfy-margin,16px);left:auto;top:auto}",
    ".blakfy-overlay.widget.bottom-left{bottom:var(--blakfy-margin,16px);left:var(--blakfy-margin,16px);right:auto;top:auto}",
    ".blakfy-overlay.widget.top-center{top:var(--blakfy-margin,16px);left:50%;right:auto;bottom:auto;transform:translateX(-50%)}",
    ".blakfy-overlay.widget.top-right{top:var(--blakfy-margin,16px);right:var(--blakfy-margin,16px);left:auto;bottom:auto}",
    ".blakfy-overlay.widget.top-left{top:var(--blakfy-margin,16px);left:var(--blakfy-margin,16px);right:auto;bottom:auto}",
    ".blakfy-overlay.widget.center{top:50%;left:50%;right:auto;bottom:auto;transform:translate(-50%,-50%)}",
    // Card base (shared by banner + modal)
    // Bottom padding is wider than the rest — the "Powered by Blakfy Studio" badge is
    // absolutely positioned at bottom:8px/right:12px inside this card (see badge.js),
    // and without this reserved strip the last action button (often the rightmost —
    // Accept All) sits directly under it. This used to be reserved only in widget mode
    // (".blakfy-overlay.widget .blakfy-card"); the preferences MODAL had no such
    // reservation, so the badge overlapped its Accept/Save buttons every time.
    ".blakfy-card{box-sizing:border-box;background:#fff;color:#222;border-radius:16px;max-width:560px;width:100%;padding:24px 24px 40px;border:3px solid var(--blakfy-accent,#6b7280);font-family:system-ui,-apple-system,sans-serif;line-height:1.5;position:relative}",
    ".blakfy-card[dir=rtl]{text-align:right}",
    ".blakfy-card h2{margin:0 0 8px;font-size:18px;font-weight:600}",
    ".blakfy-card p{margin:0 0 16px;font-size:14px;color:#444}",
    ".blakfy-card a{color:var(--blakfy-accent,#6b7280);text-decoration:underline}",
    // Actions
    ".blakfy-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}",
    // Buttons (3px radius per spec)
    ".blakfy-btn{flex:1;min-width:120px;min-height:44px;padding:12px 16px;border:1px solid #ddd;border-radius:3px;background:#fff;color:#222;font-size:14px;font-weight:500;cursor:pointer;transition:transform .1s,background .15s}",
    ".blakfy-btn:hover{transform:translateY(-1px)}",
    ".blakfy-btn-primary{background:var(--blakfy-accent,#6b7280);color:#fff;border-color:transparent}",
    ".blakfy-cat{padding:12px 0;border-top:1px solid #eee;display:flex;align-items:flex-start;gap:12px}",
    ".blakfy-cat:first-of-type{border-top:none}",
    ".blakfy-cat-text{flex:1}",
    ".blakfy-cat-text strong{display:block;font-size:14px;margin-bottom:2px}",
    ".blakfy-cat-text span{font-size:13px;color:#666}",
    // Switches (pill-shaped — UX standard)
    ".blakfy-switch{flex-shrink:0;width:44px;height:24px;border-radius:999px;background:#ccc;position:relative;cursor:pointer;border:none;padding:0}",
    ".blakfy-switch[aria-checked=true]{background:var(--blakfy-accent,#6b7280)}",
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
    // Responsive
    "@media (max-width:1024px){.blakfy-card{max-width:440px}}",
    "@media (max-width:768px){.blakfy-card{max-width:calc(100vw - 2 * var(--blakfy-margin,16px));padding:18px 18px 40px}.blakfy-card h2{font-size:16px}.blakfy-card p{font-size:13px}.blakfy-btn{flex:1 1 100%;min-height:44px;padding:10px 14px;font-size:13px}.blakfy-overlay.widget.bottom-center,.blakfy-overlay.widget.top-center{left:var(--blakfy-margin,16px);right:var(--blakfy-margin,16px);transform:none}.blakfy-overlay.widget .blakfy-card{width:100%}.blakfy-overlay.widget .blakfy-actions .blakfy-btn{flex:1 1 100%;min-width:0}}",
    "@media (max-width:480px){.blakfy-overlay.widget .blakfy-card{width:100%;max-width:calc(100vw - 2 * var(--blakfy-margin,16px))}}",
    // Tab bar
    ".blakfy-tabs{display:flex;border-bottom:2px solid #eee;margin:12px 0 16px;gap:0}",
    ".blakfy-tab-btn{flex:1;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;padding:8px 10px;font-size:13px;font-weight:500;color:#666;cursor:pointer;transition:color .15s,border-color .15s;white-space:nowrap;font-family:inherit}",
    ".blakfy-tab-btn:hover{color:#222}",
    ".blakfy-tab-btn--active{color:var(--blakfy-accent,#6b7280);border-bottom-color:var(--blakfy-accent,#6b7280);font-weight:600}",
    // Tab panels
    ".blakfy-tab-panel[aria-hidden=true]{display:none}",
    ".blakfy-tab-panel[aria-hidden=false]{display:block}",
    // Service list + cards
    ".blakfy-service-list{display:flex;flex-direction:column;gap:8px;max-height:420px;overflow-y:auto;padding-right:2px}",
    // flex-shrink:0 is load-bearing, not decoration. Per the flexbox spec, a flex
    // item's automatic minimum size is its CONTENT size only while overflow:visible —
    // the moment overflow is anything else (hidden, here, to get rounded corners on
    // the header), that automatic minimum drops to 0. Without flex-shrink:0, once an
    // opened card pushes .blakfy-service-list's total content past its max-height,
    // flexbox shrinks every card to fit inside 420px instead of the list scrolling —
    // each card's own overflow:hidden then silently clips its last field(s) (e.g.
    // "Saklama Süresi") with no visible scrollbar to explain why.
    ".blakfy-service-card{border:1px solid #eee;border-radius:6px;overflow:hidden;flex-shrink:0}",
    // Fixed min-height (not just padding+line-height) so a CLOSED header's rendered
    // size can never depend on sub-pixel text-layout rounding. Without this, opening
    // another card further down could add a scroll bar to the modal, which narrows
    // the content box by the scrollbar's width and reflows every header's text at a
    // slightly different sub-pixel width — visible as closed cards above it shrinking
    // by a fraction of a pixel.
    ".blakfy-service-card-header{display:flex;align-items:center;gap:8px;min-height:40px;box-sizing:border-box;padding:10px 12px;cursor:pointer;background:#fafafa;user-select:none}",
    ".blakfy-service-card-header:hover{background:#f3f3f3}",
    // line-height:1 on both — without it they inherit .blakfy-card's line-height:1.5,
    // which makes each span's own line-box taller than its glyphs. align-items:center
    // on the header then centers that oversized line-box, not the text itself, so the
    // glyphs (sitting low within their line-box, per normal font metrics) render
    // visibly below-center inside the header row.
    ".blakfy-service-name{flex:1;font-size:13px;font-weight:600;color:#222;line-height:1}",
    ".blakfy-service-cat{font-size:11px;padding:2px 8px;border-radius:999px;background:#eee;color:#555;text-transform:capitalize;line-height:1}",
    ".blakfy-service-toggle{font-size:11px;color:#aaa;line-height:1}",
    ".blakfy-service-body[aria-hidden=true]{display:none}",
    ".blakfy-service-body[aria-hidden=false]{display:block;padding:12px;border-top:1px solid #eee}",
    ".blakfy-service-dl{margin:0 0 10px;display:grid;grid-template-columns:auto 1fr;gap:4px 12px}",
    ".blakfy-service-dt{font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}",
    ".blakfy-service-dd{margin:0;font-size:12px;color:#444;word-break:break-word}",
    ".blakfy-service-links{display:flex;gap:12px;margin-top:8px;flex-wrap:wrap}",
    ".blakfy-service-links a{font-size:12px;color:var(--blakfy-accent,#6b7280);text-decoration:underline}",
    ".blakfy-svc-empty{font-size:13px;color:#888;padding:16px 0}",
    // Cookie transparency panel (#39)
    ".blakfy-cookie-caveat{font-size:11px;color:#888;line-height:1.5;margin:0 0 12px;padding:8px 10px;background:#f7f7f7;border-radius:6px}",
    ".blakfy-cookie-list{display:flex;flex-direction:column;gap:6px;max-height:360px;overflow-y:auto;padding-right:2px}",
    ".blakfy-cookie-row{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #eee;border-radius:6px}",
    ".blakfy-cookie-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}",
    ".blakfy-cookie-name{font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#222;word-break:break-all}",
    ".blakfy-cookie-meta{font-size:11px;color:#888}",
    ".blakfy-cookie-unrecognised{color:#b45309}",
    ".blakfy-cookie-essential{font-size:11px;color:#888;white-space:nowrap}",
    ".blakfy-cookie-delete{font-size:11px;padding:4px 10px;white-space:nowrap}",
    // About panel
    ".blakfy-about-panel{padding:4px 0}",
    ".blakfy-about-brand{display:flex;align-items:center;gap:8px;margin-bottom:14px}",
    ".blakfy-about-brand strong{font-size:15px;color:#222}",
    ".blakfy-about-panel p{font-size:13px;color:#555;margin:0 0 10px;line-height:1.6}",
    ".blakfy-about-panel a{font-size:13px;color:var(--blakfy-accent,#6b7280);text-decoration:underline}",
    ".blakfy-about-meta{font-size:12px;color:#aaa;margin-top:12px}",
    // Width-based sizing only — what a narrow screen changes is type and padding, not the
    // scroll model. The scroll model is a question about HEIGHT, handled in the rule below.
    "@media (max-width:480px){.blakfy-tab-btn{font-size:12px;padding:8px 6px}}",
    // Nested scrolling is a function of available HEIGHT, not width. A phone held sideways
    // is wide and short, and a max-width query misses it entirely while it is exactly the
    // case that runs out of room. Whenever the viewport is short, the card is already a
    // scroll container (see the modal rule above), and a capped service/cookie list nests a
    // second scroll region inside it. On touch that traps the gesture: a drag started over
    // the inner list scrolls the list and never the card, so the rest of the panel is
    // unreachable. Releasing the caps hands all scrolling to the card — one scroll surface.
    // The threshold is px on purpose: viewport-relative units are not valid lengths in a
    // media feature, and `height` here already reports the viewport the layout is using.
    // The same height budget governs the sticky bar's own size. At the default min-width
    // the buttons wrap onto two or three 44px rows, and a bar that tall eats most of a
    // short card — past a point it is taller than the scrollport, which sticky cannot pin
    // at all, so it starts sliding again. One row keeps the bar near 64px. min-height stays
    // 44px: that is the touch-target floor (WCAG 2.2 SC 2.5.8), not a stylistic number.
    // Padding is part of the height budget too. The card's 24px top / 40px bottom are sized
    // for a desktop dialog; on a short screen they can consume more of the card than the
    // content does, and since the card clips, what gets cut is the bottom — the action bar.
    // The bottom value stays larger than the top because the "Powered by Blakfy Studio"
    // badge sits in that strip (see the card base rule) and must not land under a button.
    "@media (max-height:700px){.blakfy-service-list,.blakfy-cookie-list{max-height:none;overflow-y:visible}.blakfy-actions{flex-wrap:nowrap;margin-top:10px}.blakfy-btn{min-width:0;font-size:13px;padding:10px 8px}.blakfy-overlay.modal .blakfy-card{padding:16px 16px 28px}.blakfy-overlay.modal .blakfy-card h2{font-size:16px;margin-bottom:4px}}",
    // Mobile panel footprint — owner spec: 85% of the screen wide, 75% tall.
    // Both conditions are needed to mean "a phone": portrait phones are narrow but tall
    // (caught by max-width), landscape phones are wide but short (caught by max-height).
    // A single query would miss one of the two orientations.
    // The height is a CAP, not a fixed size: a panel with little content stays short, and
    // only one with more content than fits grows to 75% and scrolls its body from there.
    // max-width has to be restated because .blakfy-card's base rule pins it to 560px.
    // vh/vw first as the fallback, then the dynamic-viewport line for engines that have it:
    // on mobile the URL bar is the difference between "75% of the screen" and "75% of a
    // taller box than the screen", and only dvh measures what the user can actually see.
    "@media (max-width:480px),(max-height:700px){.blakfy-overlay.modal .blakfy-card{width:85vw;max-width:85vw;height:auto;max-height:75vh}}",
    "@media (max-width:480px),(max-height:700px){.blakfy-overlay.modal .blakfy-card{width:85dvw;max-width:85dvw;max-height:75dvh}}",
    // ── Themes: gray ──────────────────────────────────────────────────────────
    ".blakfy-card[data-blakfy-theme=gray]{background:#f0f0f0}",
    ".blakfy-card[data-blakfy-theme=gray] .blakfy-btn{background:#e4e4e4;border-color:#ccc}",
    ".blakfy-card[data-blakfy-theme=gray] .blakfy-service-card-header{background:#e8e8e8}",
    ".blakfy-card[data-blakfy-theme=gray] .blakfy-service-card-header:hover{background:#ddd}",
    // ── Themes: dark ──────────────────────────────────────────────────────────
    ".blakfy-card[data-blakfy-theme=dark]{background:#1a1a1a;color:#f0f0f0;border-color:var(--blakfy-accent,#6b7280)}",
    ".blakfy-card[data-blakfy-theme=dark] p{color:#aaa}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-cat-text span{color:#999}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-cat{border-top-color:#333}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-btn{background:#2a2a2a;color:#f0f0f0;border-color:#444}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-btn:hover{background:#333}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-switch{background:#444}",
    // #59: this rule's specificity (2 classes+attribute) beats the base
    // `.blakfy-switch[aria-checked=true]` rule above (1 class+attribute) and comes
    // later in the sheet, so a checked switch in dark theme always fell back to
    // #444 instead of the accent colour. Re-declaring checked state here, scoped to
    // dark theme, restores it without touching the light-theme rule.
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-switch[aria-checked=true]{background:var(--blakfy-accent,#6b7280)}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-close{color:#aaa}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-close:hover{background:#2a2a2a}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-tabs{border-bottom-color:#333}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn{color:#888}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn:hover{color:#f0f0f0}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn--active{color:var(--blakfy-accent,#6b7280);border-bottom-color:var(--blakfy-accent,#6b7280)}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-card{border-color:#333}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-card-header{background:#252525}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-card-header:hover{background:#2e2e2e}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-body[aria-hidden=false]{border-top-color:#333}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-dt{color:#777}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-dd{color:#ccc}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-name{color:#f0f0f0}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-cat{background:#333;color:#aaa}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-badge{color:#777}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-about-brand strong{color:#f0f0f0}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-about-panel p{color:#aaa}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-about-meta{color:#666}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-svc-empty{color:#666}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-caveat{background:#252525;color:#999}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-row{border-color:#333}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-name{color:#f0f0f0}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-meta{color:#999}",
    ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-essential{color:#999}",
    // ── Reopen FAB (#34) — token API, see docs in src/ui/fab.js ────────────────
    // #35: declared on :host (the shadow root's own element), not :root — a shadow-scoped
    // stylesheet's :root never matches the document, only the shadow tree. --blakfy-accent
    // and any --blakfy-fab-* override a site sets on ITS OWN :root still inherit in across
    // the shadow boundary (custom properties are inheritable), so a site override always
    // wins; these are only the widget's own defaults.
    // #63b: target-w/h (the actual positioned, clickable box) and size-w/h (the visual
    // fill) default to the old single --blakfy-fab-target/--blakfy-fab-size values, so
    // every existing site keeps its current look with zero changes. A site that sets
    // fabWidth/fabHeight gets BOTH pairs pointed at the same custom value (fab.js) --
    // the clickable box becomes exactly the visible shape, no invisible touch-target
    // padding around a smaller dot (that mismatch read as "unpositioned/floating" at
    // small custom sizes -- owner finding 2026-09-14, birinciogluticaret-com).
    // --blakfy-fab-bg no longer auto-links to --blakfy-accent (owner decision
    // 2026-09-14): the FAB's own default should not silently change just because
    // a site set an accent color for the banner. Default is a fixed black with a
    // white icon glyph; a site that wants a matching FAB explicitly passes
    // fabColor/fabIconColor.
    ":host,:root{--blakfy-fab-side:right;--blakfy-fab-offset-x:20px;--blakfy-fab-offset-y:20px;--blakfy-fab-z:2147483640;--blakfy-fab-size:40px;--blakfy-fab-target:44px;--blakfy-fab-target-w:var(--blakfy-fab-target);--blakfy-fab-target-h:var(--blakfy-fab-target);--blakfy-fab-size-w:var(--blakfy-fab-size);--blakfy-fab-size-h:var(--blakfy-fab-size);--blakfy-fab-icon-size:20px;--blakfy-fab-bg:#111827;--blakfy-fab-color:#fff;--blakfy-fab-radius:50%;--blakfy-fab-shadow:0 2px 8px rgb(0 0 0 / 0.18);--blakfy-fab-opacity:0.55;--blakfy-fab-opacity-hover:1}",
    ".blakfy-fab{position:fixed;z-index:var(--blakfy-fab-z);width:var(--blakfy-fab-target-w);height:var(--blakfy-fab-target-h);display:flex;align-items:center;justify-content:center;padding:0;border:none;cursor:pointer;background:transparent;bottom:calc(var(--blakfy-fab-offset-y) + env(safe-area-inset-bottom,0px))}",
    ".blakfy-fab::before{content:'';position:absolute;inset:0;margin:auto;width:var(--blakfy-fab-size-w);height:var(--blakfy-fab-size-h);border-radius:var(--blakfy-fab-radius);background:var(--blakfy-fab-bg);box-shadow:var(--blakfy-fab-shadow);opacity:var(--blakfy-fab-opacity);transition:opacity .15s}",
    ".blakfy-fab:hover::before,.blakfy-fab:focus-visible::before{opacity:var(--blakfy-fab-opacity-hover)}",
    ".blakfy-fab svg{position:relative;color:var(--blakfy-fab-color);pointer-events:none}",
    ".blakfy-fab:focus-visible{outline:2px solid var(--blakfy-fab-bg);outline-offset:2px}",
    ".blakfy-fab--left{left:calc(var(--blakfy-fab-offset-x) + env(safe-area-inset-left,0px))}",
    ".blakfy-fab--right{right:calc(var(--blakfy-fab-offset-x) + env(safe-area-inset-right,0px))}",
    "[dir=rtl] .blakfy-fab--left{left:auto;right:calc(var(--blakfy-fab-offset-x) + env(safe-area-inset-right,0px))}",
    "[dir=rtl] .blakfy-fab--right{right:auto;left:calc(var(--blakfy-fab-offset-x) + env(safe-area-inset-left,0px))}",
    "@media (prefers-reduced-motion:reduce){.blakfy-fab::before{transition:none}}",
    "@media (max-width:640px){:root{--blakfy-fab-offset-x:12px;--blakfy-fab-offset-y:12px;--blakfy-fab-size:36px}}"
  ];
  var injectStyles = (root2) => {
    const target = root2 || (typeof document !== "undefined" ? document.head : null);
    if (!target || target.querySelector("#" + STYLE_ID)) return;
    const css = document.createElement("style");
    css.id = STYLE_ID;
    css.textContent = RULES.join("");
    target.appendChild(css);
  };

  // src/ui/theme-bridge.js
  var DEBOUNCE_MS = 50;
  var hasClass = (el2, cls) => {
    return Boolean(el2 && el2.classList && el2.classList.contains(cls));
  };
  var luminanceFromBg = () => {
    if (!document.body) return null;
    try {
      const bg = window.getComputedStyle(document.body).backgroundColor;
      if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") return null;
      const m = bg.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      if (!m) return null;
      const r = parseInt(m[1], 10) / 255;
      const g = parseInt(m[2], 10) / 255;
      const b = parseInt(m[3], 10) / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return lum < 0.5 ? "dark" : "light";
    } catch (e) {
      return null;
    }
  };
  var readDataAttr = (el2, name) => {
    if (!el2 || !el2.getAttribute) return null;
    const v = el2.getAttribute(name);
    if (v === "dark" || v === "light") return v;
    return null;
  };
  var detectSiteTheme = () => {
    if (typeof document === "undefined") return "light";
    const html = document.documentElement;
    const body = document.body;
    if (hasClass(html, "dark")) return "dark";
    if (hasClass(html, "light")) return "light";
    if (hasClass(body, "dark")) return "dark";
    if (hasClass(body, "light")) return "light";
    const dt = readDataAttr(html, "data-theme") || readDataAttr(body, "data-theme");
    if (dt) return dt;
    const dm = readDataAttr(html, "data-mode") || readDataAttr(body, "data-mode");
    if (dm) return dm;
    const lum = luminanceFromBg();
    if (lum) return lum;
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  };
  var watchSiteTheme = (callback) => {
    if (typeof window === "undefined" || typeof MutationObserver === "undefined") {
      return () => {
      };
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
          }
        }
      }, DEBOUNCE_MS);
    };
    const observer2 = new MutationObserver(debouncedCheck);
    const observerOpts = {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode"]
    };
    try {
      observer2.observe(document.documentElement, observerOpts);
    } catch (e) {
    }
    if (document.body) {
      try {
        observer2.observe(document.body, observerOpts);
      } catch (e) {
      }
    }
    let mql = null;
    try {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      if (mql && mql.addEventListener) mql.addEventListener("change", debouncedCheck);
      else if (mql && mql.addListener) mql.addListener(debouncedCheck);
    } catch (e) {
      mql = null;
    }
    return () => {
      try {
        observer2.disconnect();
      } catch (e) {
      }
      if (timer) clearTimeout(timer);
      try {
        if (mql) {
          if (mql.removeEventListener) mql.removeEventListener("change", debouncedCheck);
          else if (mql.removeListener) mql.removeListener(debouncedCheck);
        }
      } catch (e) {
      }
    };
  };
  var applyThemeToCard = (card, theme) => {
    if (!card || !card.setAttribute) return;
    if (theme === "dark") {
      card.setAttribute("data-blakfy-theme", "dark");
    } else if (theme === "gray") {
      card.setAttribute("data-blakfy-theme", "gray");
    } else {
      card.removeAttribute("data-blakfy-theme");
    }
  };
  var normalizeThemeValue = (raw) => {
    if (raw === "black") return "dark";
    if (raw === "white") return "light";
    return raw || "auto";
  };

  // src/index.js
  var ROOT_OVERLAY_CLASS = "blakfy-overlay";
  var VALID_POSITIONS = {
    "bottom-center": 1,
    "bottom-right": 1,
    "bottom-left": 1,
    "top-center": 1,
    "top-right": 1,
    "top-left": 1,
    center: 1
  };
  var resolvePosition = (raw) => {
    if (raw && Object.prototype.hasOwnProperty.call(VALID_POSITIONS, raw)) return raw;
    return "bottom-center";
  };
  var MIN_MARGIN_PX = 5;
  var resolveMargin = (raw) => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return 16;
    return Math.max(MIN_MARGIN_PX, n);
  };
  var bootstrapInFlight = null;
  var reportBootstrapError = (err) => {
    const message = err && err.message || String(err);
    if (typeof console !== "undefined" && console.error) {
      console.error(
        "[Blakfy Cookie] bootstrap failed and did not complete: " + message + ". No consent banner will show until this is fixed. Any data-blakfy-category-gated tags stay blocked (fail-closed by design) \u2014 see README 'Browser Deste\u011Fi' (#30).",
        err
      );
    }
    try {
      const scriptEl = getScriptEl();
      const endpoint = scriptEl && scriptEl.getAttribute("data-blakfy-error-endpoint");
      if (endpoint) {
        postAudit(endpoint, {
          type: "bootstrap_error",
          message,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    } catch (e2) {
    }
  };
  var bootstrap = () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return Promise.resolve();
    }
    if (window.BlakfyCookie && window.BlakfyCookie.__bootstrapped) return Promise.resolve();
    if (bootstrapInFlight) return bootstrapInFlight;
    bootstrapInFlight = runBootstrap().catch((err) => {
      reportBootstrapError(err);
    }).finally(() => {
      bootstrapInFlight = null;
    });
    return bootstrapInFlight;
  };
  var runBootstrap = async () => {
    const scriptEl = getScriptEl();
    const config = readConfig(scriptEl);
    const placementIssue = detectPlacementIssue(scriptEl);
    if (placementIssue && typeof console !== "undefined" && console.error) {
      console.error("[Blakfy Cookie] Installation problem: " + placementIssue);
    }
    const defaultsFileRanFirst = typeof window !== "undefined" && !!window.__blakfyConsentDefaultsLoaded;
    if (!defaultsFileRanFirst && typeof console !== "undefined" && console.warn) {
      console.warn(
        "[Blakfy Cookie] cookie-defaults.min.js did not run before this bundle initialised (window.__blakfyConsentDefaultsLoaded was not set). Consent Mode denied-by-default signals are being installed late by this bundle instead of at head-load time \u2014 any tag that fired before now had no default to respect. Add cookie-defaults.min.js in <head>, loaded first, per the install docs."
      );
    }
    const currentLocale = detectLocale({ configLocale: config.locale });
    const mainLang = detectMainLang({ configMainLang: config.mainLang });
    let t = await loadTranslation(currentLocale, scriptEl && scriptEl.src);
    let isRTL = RTL_LOCALES.indexOf(currentLocale) > -1;
    const normalized = normalizeThemeValue(config.theme);
    const isExplicit = normalized === "light" || normalized === "dark" || normalized === "gray";
    let theme = isExplicit ? normalized : detectSiteTheme();
    const trackedCards = /* @__PURE__ */ new Set();
    let unwatchTheme = null;
    if (!isExplicit) {
      unwatchTheme = watchSiteTheme((next) => {
        theme = next;
        trackedCards.forEach((card) => {
          if (!card || !card.isConnected) {
            trackedCards.delete(card);
            return;
          }
          applyThemeToCard(card, next);
        });
      });
    }
    const shadowRoot = getShadowRoot();
    injectStyles(shadowRoot);
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
    let getTCString = null;
    if (config.tcf === "true") {
      const tcfApi = await loadTCF(scriptEl && scriptEl.src);
      if (tcfApi) {
        getTCString = tcfApi.getTCString;
        tcfApi.installTCFAPI({
          cmpId: parseInt(config.cmpId, 10) || 0,
          cmpVersion: 1,
          getConsent: () => state || {},
          on: emitter.on
        });
      }
    }
    const ccpaOn = config.ccpa === "true" || config.ccpa === "auto" && jurisdiction === "CCPA";
    if (ccpaOn) {
      installUSP({});
      installDoNotSellLink({ t });
      installGPPAPI({
        getConsent: () => state || {},
        getGpc: getGPC,
        applicableSections: [7],
        on: emitter.on
      });
    }
    if (getDNT() && config.dnt === "auto-deny" && !state) {
      applyDNT({
        mode: "auto-deny",
        setPrefs: () => {
        }
      });
    }
    if (getGPC() && config.gpc === "respect" && !state) {
      const gpcResult = applyGPC({
        mode: "respect",
        currentState: null,
        setPrefs: () => {
        }
      });
      if (gpcResult.applied && jurisdiction === "CCPA") {
        state = buildState({
          prefs: { analytics: false, marketing: false, functional: false, recording: false },
          currentLocale,
          mainLang,
          policyVersion: config.policyVersion,
          jurisdiction,
          source: "gpc"
        });
        try {
          writeCookie(state, config.cookieDomain);
        } catch (e) {
        }
        optOut();
      }
    }
    let activePresetList = [];
    if (config.presets) {
      activePresetList = String(config.presets).split(",").map((s) => s.trim()).filter(Boolean);
      for (let i = 0; i < activePresetList.length; i++) {
        try {
          applyPreset(activePresetList[i], { registerCleanup });
        } catch (e) {
        }
      }
    }
    const api = createAPI({
      state,
      config,
      emitter,
      locale: currentLocale,
      baseHref: scriptEl && scriptEl.src,
      mainLang,
      jurisdiction,
      // #35: closeUI() needs to query overlays inside the shadow root, not document —
      // document.querySelectorAll cannot see across the shadow boundary.
      shadowRoot,
      deps: {
        unblockScripts,
        unblockIframes,
        runCleanup,
        registerCleanup,
        applyPreset,
        pushGCM,
        pushUET,
        applyYandex,
        // #24 (item 3): auto-bridge to a documented host-platform consent API when one
        // exists (Shopify Customer Privacy API, WP Consent API); detection-only warning
        // otherwise. `scriptEl` carries the optional data-blakfy-host override.
        installHostAdapter: (s) => installHostAdapter(s, scriptEl),
        getTCString,
        optOutCCPA: optOut,
        isOptedOutCCPA: isOptedOut,
        removeFocusTrap,
        openModal: (opts) => mountModal(opts),
        // #43: BlakfyCookie.diagnose() — the self-check the issue asks for, one call
        // instead of a manual browser session.
        getDiagnostics: ({ jurisdiction: jur }) => ({
          placementOk: !placementIssue,
          placementIssue,
          defaultsFileRanFirst,
          gcmDefaultsFired: isDefaultsInstalled(),
          presetsRegistered: activePresetList.slice(),
          unrecognizedCookies: warnUnregisteredCookies(PRESETS).map((f) => f.cookie),
          preConsentCookies: warnPreConsentCookies(PRESETS, api.getConsent).map((f) => f.cookie),
          jurisdiction: jur
        })
      }
    });
    api.__bootstrapped = true;
    emitter.on("change", (s) => {
      state = s;
      mountFab();
    });
    emitter.on("locale", (info) => {
      t = info.t;
      isRTL = info.isRTL;
    });
    api.getLeaks = () => scanForLeaks({
      activePresetNames: activePresetList,
      presets: PRESETS,
      getConsent: api.getConsent
    });
    if (!window.BlakfyCookie) {
      window.BlakfyCookie = api;
      try {
        window.dispatchEvent(new CustomEvent("blakfy:ready", { detail: { version: api.version } }));
      } catch (e) {
      }
    }
    if (activePresetList.length && typeof window.setTimeout === "function") {
      window.setTimeout(() => {
        try {
          warnLeaks(api.getLeaks());
        } catch (e) {
        }
      }, 3e3);
    }
    if (typeof window.setTimeout === "function") {
      window.setTimeout(() => {
        try {
          warnUnregisteredCookies(PRESETS);
        } catch (e) {
        }
        try {
          warnPreConsentCookies(PRESETS, api.getConsent);
        } catch (e) {
        }
      }, 3e3);
    }
    const mountBanner = () => {
      const overlay = document.createElement("div");
      overlay.className = ROOT_OVERLAY_CLASS + " widget " + resolvePosition(config.position);
      overlay.style.setProperty("--blakfy-margin", resolveMargin(config.margin) + "px");
      const card = createBanner({
        t,
        isRTL,
        accent: config.accent,
        theme,
        locale: currentLocale,
        policyUrl: config.policyUrl,
        onAccept: () => api.acceptAll(),
        onReject: () => api.rejectAll(),
        onPrefs: () => mountModal({
          commit: api.__internal.commit,
          t,
          currentLocale,
          state
        }),
        onOpenPolicy: () => mountModal({ t, tab: "policy" })
      });
      overlay.appendChild(card);
      shadowRoot.appendChild(overlay);
      api.__internal.setUI("banner", overlay);
      if (!isExplicit) trackedCards.add(card);
      mountBadges(card);
      installAntiTamper(card, shadowRoot);
      installFocusTrap(card, {
        onEscape: () => {
        }
      });
      return overlay;
    };
    function mountModal(opts) {
      const existing = shadowRoot.querySelectorAll("." + ROOT_OVERLAY_CLASS + ".modal");
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
        theme,
        locale: currentLocale,
        currentState: state,
        presets: activePresetList,
        version: api.version,
        onSave: (prefs) => api.__internal.commit(prefs, "save"),
        onAccept: () => api.acceptAll(),
        onClose: () => api.__internal.closeUI(),
        // #49: in-widget policy notice — passed through regardless of tab so the
        // Policy tab is available every time the modal opens, not only via openPolicy().
        policyUrl: config.policyUrl,
        operator: config.operator,
        operatorContact: config.operatorContact,
        operatorAddress: config.operatorAddress,
        jurisdiction,
        policyVersion: config.policyVersion,
        initialTab: opts && opts.tab,
        // #39: transparency panel reads against the FULL preset registry (not just the
        // active list above) so a platform-injected tracker with no matching
        // data-blakfy-presets entry still shows up correctly attributed instead of
        // falling into "unrecognised".
        cookiePanel: config.cookiePanel,
        observedCookies: config.cookiePanel ? listObservedCookies(PRESETS) : null,
        onDeleteCookie: (name) => deleteObservedCookie(name)
      });
      overlay.appendChild(card);
      shadowRoot.appendChild(overlay);
      api.__internal.setUI("modal", overlay);
      if (!isExplicit) trackedCards.add(card);
      mountBadges(card);
      installAntiTamper(card, shadowRoot);
      installFocusTrap(card, {
        onEscape: () => api.__internal.closeUI(),
        trapBackground: true,
        lockScroll: true,
        // #35: the light-DOM body child to leave interactive while the modal traps
        // focus is the shadow host itself — everything the widget renders (banner,
        // modal, FAB) lives inside it, in the same shadow root.
        inertSkipEl: getShadowHost()
      });
      return overlay;
    }
    let fabMounted = false;
    const mountFab = () => {
      if (fabMounted || typeof document === "undefined") return;
      const resolved = resolveFabConfig(config);
      if (!resolved) return;
      const fab = createFab({
        // No dedicated i18n key added (would require touching all 23 locale
        // files for one string) — reuses the existing "preferences" string,
        // which already reads correctly as a reopen-the-consent-choices label.
        ariaLabel: t.preferences,
        isRTL,
        onOpen: () => mountModal({
          commit: api.__internal.commit,
          t,
          currentLocale,
          state
        })
      });
      if (!fab) return;
      applyFabTokens(fab, resolved);
      shadowRoot.appendChild(fab);
      fabMounted = true;
    };
    if (state) {
      pushGCM(state);
      pushUET(state);
      installHostAdapter(state, scriptEl);
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
        mountModal({
          commit: api.__internal.commit,
          t,
          currentLocale,
          state
        });
      });
      mountFab();
    } else {
      mountBanner();
      installPlaceholders(t, () => {
        mountModal({
          commit: api.__internal.commit,
          t,
          currentLocale,
          state
        });
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
    if (unwatchTheme && typeof window.addEventListener === "function") {
      window.addEventListener(
        "pagehide",
        () => {
          try {
            unwatchTheme();
          } catch (e) {
          }
        },
        { once: true }
      );
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
//# sourceMappingURL=cookie.js.map
