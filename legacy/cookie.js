/*!
 * Blakfy Cookie Consent
 * v1.2.0 | https://github.com/tariktunc/blakfy-cookie
 * MIT License | © Blakfy Studio
 *
 * Vanilla JS, zero dependencies.
 * KVKK + GDPR + ePrivacy + Google Consent Mode v2 compliant.
 * 23 languages | BCP 47 locale detection | Central status bar via status.json
 */
(function (window, document) {
  "use strict";

  if (window.BlakfyCookie) return;

  // ─────────────────────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────────────────────
  var VERSION = "1.2.0";
  var COOKIE_NAME = "blakfy_consent";
  var COOKIE_TTL_DAYS = 365;
  var DEFAULT_LOCALE = "tr";
  // BCP 47 tags: full tags (e.g. "zh-TW") are tried before the 2-letter fallback.
  var SUPPORTED_LOCALES = [
    "tr", "en", "ar", "fa", "ur",
    "fr", "ru", "de", "he", "uk",
    "es", "it", "pt", "nl", "pl", "sv", "cs",
    "zh", "zh-TW", "ja", "ko",
    "id", "hi"
  ];
  var RTL_LOCALES = ["ar", "he", "fa", "ur"];
  var CDN_BASE = "https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@latest";

  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName("script");
    return s[s.length - 1];
  })();

  var attr = function (name, fallback) {
    if (!script) return fallback;
    var v = script.getAttribute(name);
    return v == null ? fallback : v;
  };

  var config = {
    locale:        attr("data-blakfy-locale",       "auto"),
    mainLang:      attr("data-blakfy-main-lang",     null),   // site's declared primary language
    policyUrl:     attr("data-blakfy-policy-url",    "/cerez-politikasi"),
    policyVersion: attr("data-blakfy-version",       "1.0"),
    auditEndpoint: attr("data-blakfy-audit-endpoint", null),
    theme:         attr("data-blakfy-theme",         "auto"),
    position:      attr("data-blakfy-position",      "bottom"),
    accent:        attr("data-blakfy-accent",        "#3E5C3A"),
    statusUrl:     attr("data-blakfy-status-url",    CDN_BASE + "/status.json"),
    statusEnabled: attr("data-blakfy-status",        "true") !== "false",
  };

  // ─────────────────────────────────────────────────────────────
  // LOCALE DETECTION  (BCP 47 compliant)
  // ─────────────────────────────────────────────────────────────

  // Matches a raw BCP 47 tag (e.g. "zh-TW", "pt-BR", "en-US") against SUPPORTED_LOCALES.
  // Strategy: exact case-insensitive match → 2-letter prefix match → null
  function normalizeLocale(raw) {
    if (!raw) return null;
    var lo = raw.toLowerCase();
    // 1. Exact match (handles "zh-TW", "fa", "ur", etc.)
    for (var i = 0; i < SUPPORTED_LOCALES.length; i++) {
      if (SUPPORTED_LOCALES[i].toLowerCase() === lo) return SUPPORTED_LOCALES[i];
    }
    // 2. 2-letter prefix fallback ("zh-CN" → "zh", "pt-BR" → "pt")
    var prefix = lo.substring(0, 2);
    for (var j = 0; j < SUPPORTED_LOCALES.length; j++) {
      if (SUPPORTED_LOCALES[j].toLowerCase() === prefix) return SUPPORTED_LOCALES[j];
    }
    return null;
  }

  // Visitor's preferred display language.
  function detectLocale() {
    if (config.locale && config.locale !== "auto") {
      return normalizeLocale(config.locale) || DEFAULT_LOCALE;
    }
    var url = new URL(window.location.href);
    var qp = url.searchParams.get("lang");
    if (qp) { var ql = normalizeLocale(qp); if (ql) return ql; }
    var htmlLang = document.documentElement.lang;
    if (htmlLang) { var hl = normalizeLocale(htmlLang); if (hl) return hl; }
    var navLang = (navigator.language || (navigator.languages && navigator.languages[0]) || "");
    if (navLang) { var nl = normalizeLocale(navLang); if (nl) return nl; }
    return DEFAULT_LOCALE;
  }

  // Site owner's declared primary language — used as status message fallback.
  // Priority: data-blakfy-main-lang attr → <html lang> → DEFAULT_LOCALE
  function detectMainLang() {
    if (config.mainLang) {
      var ml = normalizeLocale(config.mainLang);
      if (ml) return ml;
    }
    var htmlLang = normalizeLocale(document.documentElement.lang);
    if (htmlLang) return htmlLang;
    return DEFAULT_LOCALE;
  }

  var currentLocale = detectLocale();
  var mainLang = detectMainLang();
  var t = null; // set after TRANSLATIONS are defined below
  var isRTL = RTL_LOCALES.indexOf(currentLocale) > -1;

  // ─────────────────────────────────────────────────────────────
  // I18N  (20 languages)
  // ─────────────────────────────────────────────────────────────
  var TRANSLATIONS = {
    tr: {
      title: "Çerez Tercihleri",
      intro: "Bu site, deneyiminizi geliştirmek için çerezler kullanır. Detaylar için Çerez Politikamızı inceleyin.",
      policyLink: "Çerez Politikası",
      acceptAll: "Tümünü Kabul Et",
      rejectAll: "Tümünü Reddet",
      preferences: "Tercihler",
      save: "Seçimleri Kaydet",
      close: "Kapat",
      cat: {
        essential: { title: "Zorunlu Çerezler",    desc: "Sitenin temel işlevleri için gerekli, devre dışı bırakılamaz.", always: "Her zaman aktif" },
        analytics:  { title: "Analitik Çerezler",  desc: "Anonim ziyaret istatistikleri toplama amacıyla kullanılır." },
        marketing:  { title: "Pazarlama Çerezleri",desc: "Kişiselleştirilmiş reklam ve yeniden hedefleme için kullanılır." },
        functional: { title: "Fonksiyonel Çerezler",desc: "Dil, tema, bölge gibi tercihlerinizi hatırlamak için kullanılır." }
      }
    },
    en: {
      title: "Cookie Preferences",
      intro: "This site uses cookies to enhance your experience. See our Cookie Policy for details.",
      policyLink: "Cookie Policy",
      acceptAll: "Accept All",
      rejectAll: "Reject All",
      preferences: "Preferences",
      save: "Save Choices",
      close: "Close",
      cat: {
        essential: { title: "Essential Cookies",   desc: "Required for the site to function. Cannot be disabled.", always: "Always active" },
        analytics:  { title: "Analytics Cookies",  desc: "Used to collect anonymous visit statistics." },
        marketing:  { title: "Marketing Cookies",  desc: "Used for personalized advertising and retargeting." },
        functional: { title: "Functional Cookies", desc: "Used to remember preferences like language, theme, region." }
      }
    },
    ar: {
      title: "تفضيلات ملفات تعريف الارتباط",
      intro: "يستخدم هذا الموقع ملفات تعريف الارتباط لتحسين تجربتك. راجع سياسة ملفات تعريف الارتباط للحصول على التفاصيل.",
      policyLink: "سياسة ملفات تعريف الارتباط",
      acceptAll: "قبول الكل",
      rejectAll: "رفض الكل",
      preferences: "التفضيلات",
      save: "حفظ الخيارات",
      close: "إغلاق",
      cat: {
        essential: { title: "ملفات تعريف الارتباط الأساسية",   desc: "ضرورية لعمل الموقع. لا يمكن تعطيلها.", always: "نشط دائمًا" },
        analytics:  { title: "ملفات تعريف الارتباط التحليلية", desc: "تُستخدم لجمع إحصائيات الزيارات المجهولة." },
        marketing:  { title: "ملفات تعريف الارتباط التسويقية",desc: "تُستخدم للإعلان المخصص وإعادة الاستهداف." },
        functional: { title: "ملفات تعريف الارتباط الوظيفية", desc: "تُستخدم لتذكر التفضيلات مثل اللغة والسمة." }
      }
    },
    fr: {
      title: "Préférences des Cookies",
      intro: "Ce site utilise des cookies pour améliorer votre expérience. Consultez notre Politique de Cookies pour plus de détails.",
      policyLink: "Politique de Cookies",
      acceptAll: "Tout Accepter",
      rejectAll: "Tout Refuser",
      preferences: "Préférences",
      save: "Enregistrer",
      close: "Fermer",
      cat: {
        essential: { title: "Cookies Essentiels",   desc: "Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.", always: "Toujours actif" },
        analytics:  { title: "Cookies Analytiques", desc: "Utilisés pour collecter des statistiques de visite anonymes." },
        marketing:  { title: "Cookies Marketing",   desc: "Utilisés pour la publicité personnalisée et le reciblage." },
        functional: { title: "Cookies Fonctionnels",desc: "Utilisés pour mémoriser vos préférences." }
      }
    },
    ru: {
      title: "Настройки файлов cookie",
      intro: "Этот сайт использует файлы cookie для улучшения вашего опыта. Подробности в Политике использования cookie.",
      policyLink: "Политика cookie",
      acceptAll: "Принять все",
      rejectAll: "Отклонить все",
      preferences: "Настройки",
      save: "Сохранить выбор",
      close: "Закрыть",
      cat: {
        essential: { title: "Обязательные файлы cookie",  desc: "Необходимы для работы сайта. Не могут быть отключены.", always: "Всегда активны" },
        analytics:  { title: "Аналитические cookie",      desc: "Используются для сбора анонимной статистики посещений." },
        marketing:  { title: "Маркетинговые cookie",      desc: "Используются для персонализированной рекламы и ретаргетинга." },
        functional: { title: "Функциональные cookie",     desc: "Используются для запоминания ваших предпочтений." }
      }
    },
    de: {
      title: "Cookie-Einstellungen",
      intro: "Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern. Weitere Informationen in unserer Cookie-Richtlinie.",
      policyLink: "Cookie-Richtlinie",
      acceptAll: "Alle akzeptieren",
      rejectAll: "Alle ablehnen",
      preferences: "Einstellungen",
      save: "Auswahl speichern",
      close: "Schließen",
      cat: {
        essential: { title: "Notwendige Cookies",  desc: "Für die Grundfunktionen der Website erforderlich. Können nicht deaktiviert werden.", always: "Immer aktiv" },
        analytics:  { title: "Analyse-Cookies",    desc: "Werden verwendet, um anonyme Besuchsstatistiken zu sammeln." },
        marketing:  { title: "Marketing-Cookies",  desc: "Werden für personalisierte Werbung und Retargeting verwendet." },
        functional: { title: "Funktionale Cookies",desc: "Werden verwendet, um Einstellungen wie Sprache und Theme zu speichern." }
      }
    },
    zh: {
      title: "Cookie 偏好设置",
      intro: "本网站使用 Cookie 来改善您的体验。详情请查看我们的 Cookie 政策。",
      policyLink: "Cookie 政策",
      acceptAll: "接受全部",
      rejectAll: "拒绝全部",
      preferences: "偏好设置",
      save: "保存选择",
      close: "关闭",
      cat: {
        essential: { title: "必要 Cookie",   desc: "网站基本功能所必需，无法禁用。", always: "始终启用" },
        analytics:  { title: "分析 Cookie",  desc: "用于收集匿名访问统计数据。" },
        marketing:  { title: "营销 Cookie",  desc: "用于个性化广告和再营销。" },
        functional: { title: "功能 Cookie",  desc: "用于记住语言、主题等偏好设置。" }
      }
    },
    "zh-TW": {
      title: "Cookie 偏好設定",
      intro: "本網站使用 Cookie 來改善您的體驗。詳情請查看我們的 Cookie 政策。",
      policyLink: "Cookie 政策",
      acceptAll: "接受全部",
      rejectAll: "拒絕全部",
      preferences: "偏好設定",
      save: "儲存選擇",
      close: "關閉",
      cat: {
        essential: { title: "必要 Cookie",   desc: "網站基本功能所必需，無法停用。", always: "始終啟用" },
        analytics:  { title: "分析 Cookie",  desc: "用於收集匿名訪問統計資料。" },
        marketing:  { title: "行銷 Cookie",  desc: "用於個人化廣告和再行銷。" },
        functional: { title: "功能 Cookie",  desc: "用於記住語言、主題等偏好設定。" }
      }
    },
    fa: {
      title: "تنظیمات کوکی",
      intro: "این سایت از کوکی‌ها برای بهبود تجربه شما استفاده می‌کند. برای جزئیات بیشتر سیاست کوکی ما را مطالعه کنید.",
      policyLink: "سیاست کوکی",
      acceptAll: "پذیرش همه",
      rejectAll: "رد همه",
      preferences: "تنظیمات",
      save: "ذخیره انتخاب‌ها",
      close: "بستن",
      cat: {
        essential: { title: "کوکی‌های ضروری",    desc: "برای عملکرد اصلی سایت لازم است. غیرفعال کردن آن‌ها امکان‌پذیر نیست.", always: "همیشه فعال" },
        analytics:  { title: "کوکی‌های تحلیلی",  desc: "برای جمع‌آوری آمار ناشناس بازدیدکنندگان استفاده می‌شود." },
        marketing:  { title: "کوکی‌های بازاریابی",desc: "برای تبلیغات شخصی‌سازی‌شده و هدف‌گذاری مجدد استفاده می‌شود." },
        functional: { title: "کوکی‌های عملکردی", desc: "برای به یادآوری تنظیماتی مانند زبان و پوسته استفاده می‌شود." }
      }
    },
    ur: {
      title: "کوکی ترجیحات",
      intro: "یہ سائٹ آپ کے تجربے کو بہتر بنانے کے لیے کوکیز استعمال کرتی ہے۔ تفصیلات کے لیے ہماری کوکی پالیسی دیکھیں۔",
      policyLink: "کوکی پالیسی",
      acceptAll: "سب قبول کریں",
      rejectAll: "سب مسترد کریں",
      preferences: "ترجیحات",
      save: "انتخاب محفوظ کریں",
      close: "بند کریں",
      cat: {
        essential: { title: "ضروری کوکیز",   desc: "سائٹ کے بنیادی افعال کے لیے ضروری ہیں۔ غیر فعال نہیں کی جا سکتیں۔", always: "ہمیشہ فعال" },
        analytics:  { title: "تجزیاتی کوکیز",desc: "گمنام وزٹ کے اعداد و شمار جمع کرنے کے لیے استعمال ہوتی ہیں۔" },
        marketing:  { title: "مارکیٹنگ کوکیز",desc: "ذاتی نوعیت کی اشتہاربازی اور ری ٹارگیٹنگ کے لیے استعمال ہوتی ہیں۔" },
        functional: { title: "فعلیاتی کوکیز", desc: "زبان اور تھیم جیسی ترجیحات یاد رکھنے کے لیے استعمال ہوتی ہیں۔" }
      }
    },
    he: {
      title: "העדפות עוגיות",
      intro: "אתר זה משתמש בעוגיות לשיפור חוויתך. ראה את מדיניות העוגיות שלנו לפרטים.",
      policyLink: "מדיניות עוגיות",
      acceptAll: "קבל הכל",
      rejectAll: "דחה הכל",
      preferences: "העדפות",
      save: "שמור בחירות",
      close: "סגור",
      cat: {
        essential: { title: "עוגיות חיוניות",     desc: "נדרשות לתפקוד האתר. לא ניתן להשבית.", always: "פעיל תמיד" },
        analytics:  { title: "עוגיות ניתוח",      desc: "משמשות לאיסוף סטטיסטיקות ביקור אנונימיות." },
        marketing:  { title: "עוגיות שיווק",      desc: "משמשות לפרסום מותאם אישית ורימרקטינג." },
        functional: { title: "עוגיות פונקציונליות",desc: "משמשות לזכירת העדפות כמו שפה ועיצוב." }
      }
    },
    ja: {
      title: "Cookieの設定",
      intro: "このサイトはエクスペリエンスを向上させるためにCookieを使用します。詳細はCookieポリシーをご覧ください。",
      policyLink: "Cookieポリシー",
      acceptAll: "すべて承認",
      rejectAll: "すべて拒否",
      preferences: "設定",
      save: "選択を保存",
      close: "閉じる",
      cat: {
        essential: { title: "必須Cookie",         desc: "サイトの基本機能に必要です。無効にできません。", always: "常に有効" },
        analytics:  { title: "分析Cookie",        desc: "匿名の訪問統計を収集するために使用されます。" },
        marketing:  { title: "マーケティングCookie",desc: "パーソナライズされた広告とリターゲティングに使用されます。" },
        functional: { title: "機能Cookie",        desc: "言語やテーマなどの設定を記憶するために使用されます。" }
      }
    },
    es: {
      title: "Preferencias de Cookies",
      intro: "Este sitio usa cookies para mejorar tu experiencia. Consulta nuestra Política de Cookies.",
      policyLink: "Política de Cookies",
      acceptAll: "Aceptar todo",
      rejectAll: "Rechazar todo",
      preferences: "Preferencias",
      save: "Guardar opciones",
      close: "Cerrar",
      cat: {
        essential: { title: "Cookies esenciales",  desc: "Necesarias para el funcionamiento del sitio. No se pueden desactivar.", always: "Siempre activo" },
        analytics:  { title: "Cookies analíticas", desc: "Usadas para recopilar estadísticas de visita anónimas." },
        marketing:  { title: "Cookies de marketing",desc: "Usadas para publicidad personalizada y retargeting." },
        functional: { title: "Cookies funcionales",desc: "Usadas para recordar preferencias como idioma o tema." }
      }
    },
    it: {
      title: "Preferenze Cookie",
      intro: "Questo sito usa i cookie per migliorare la tua esperienza. Consulta la nostra Informativa sui Cookie.",
      policyLink: "Informativa sui Cookie",
      acceptAll: "Accetta tutti",
      rejectAll: "Rifiuta tutti",
      preferences: "Preferenze",
      save: "Salva scelte",
      close: "Chiudi",
      cat: {
        essential: { title: "Cookie essenziali",  desc: "Necessari per il funzionamento del sito. Non disattivabili.", always: "Sempre attivo" },
        analytics:  { title: "Cookie analitici",  desc: "Usati per raccogliere statistiche di visita anonime." },
        marketing:  { title: "Cookie di marketing",desc: "Usati per pubblicità personalizzata e retargeting." },
        functional: { title: "Cookie funzionali", desc: "Usati per ricordare preferenze come lingua e tema." }
      }
    },
    pt: {
      title: "Preferências de Cookies",
      intro: "Este site usa cookies para melhorar sua experiência. Consulte nossa Política de Cookies.",
      policyLink: "Política de Cookies",
      acceptAll: "Aceitar todos",
      rejectAll: "Rejeitar todos",
      preferences: "Preferências",
      save: "Salvar escolhas",
      close: "Fechar",
      cat: {
        essential: { title: "Cookies essenciais",  desc: "Necessários para o funcionamento do site. Não podem ser desativados.", always: "Sempre ativo" },
        analytics:  { title: "Cookies analíticos", desc: "Usados para coletar estatísticas anônimas de visitas." },
        marketing:  { title: "Cookies de marketing",desc: "Usados para publicidade personalizada e retargeting." },
        functional: { title: "Cookies funcionais", desc: "Usados para lembrar preferências como idioma e tema." }
      }
    },
    nl: {
      title: "Cookie-voorkeuren",
      intro: "Deze site gebruikt cookies om uw ervaring te verbeteren. Zie ons Cookiebeleid voor details.",
      policyLink: "Cookiebeleid",
      acceptAll: "Alles accepteren",
      rejectAll: "Alles weigeren",
      preferences: "Voorkeuren",
      save: "Keuzes opslaan",
      close: "Sluiten",
      cat: {
        essential: { title: "Essentiële cookies",   desc: "Noodzakelijk voor het functioneren van de site. Kunnen niet worden uitgeschakeld.", always: "Altijd actief" },
        analytics:  { title: "Analytische cookies", desc: "Gebruikt voor het verzamelen van anonieme bezoekstatistieken." },
        marketing:  { title: "Marketingcookies",    desc: "Gebruikt voor gepersonaliseerde advertenties en retargeting." },
        functional: { title: "Functionele cookies", desc: "Gebruikt om voorkeuren zoals taal en thema te onthouden." }
      }
    },
    pl: {
      title: "Preferencje plików cookie",
      intro: "Ta strona używa plików cookie, aby poprawić Twoje doświadczenia. Zobacz naszą Politykę plików cookie.",
      policyLink: "Polityka plików cookie",
      acceptAll: "Akceptuj wszystkie",
      rejectAll: "Odrzuć wszystkie",
      preferences: "Preferencje",
      save: "Zapisz wybory",
      close: "Zamknij",
      cat: {
        essential: { title: "Niezbędne pliki cookie",     desc: "Wymagane do działania strony. Nie można ich wyłączyć.", always: "Zawsze aktywne" },
        analytics:  { title: "Analityczne pliki cookie",  desc: "Używane do zbierania anonimowych statystyk odwiedzin." },
        marketing:  { title: "Marketingowe pliki cookie", desc: "Używane do spersonalizowanych reklam i retargetingu." },
        functional: { title: "Funkcjonalne pliki cookie", desc: "Używane do zapamiętywania preferencji takich jak język i motyw." }
      }
    },
    ko: {
      title: "쿠키 환경설정",
      intro: "이 사이트는 경험을 향상시키기 위해 쿠키를 사용합니다. 자세한 내용은 쿠키 정책을 확인하세요.",
      policyLink: "쿠키 정책",
      acceptAll: "모두 수락",
      rejectAll: "모두 거부",
      preferences: "환경설정",
      save: "선택 저장",
      close: "닫기",
      cat: {
        essential: { title: "필수 쿠키",    desc: "사이트 기능에 필요하며 비활성화할 수 없습니다.", always: "항상 활성" },
        analytics:  { title: "분석 쿠키",   desc: "익명 방문 통계 수집에 사용됩니다." },
        marketing:  { title: "마케팅 쿠키", desc: "맞춤형 광고 및 리타게팅에 사용됩니다." },
        functional: { title: "기능성 쿠키", desc: "언어, 테마 등의 환경설정을 기억하는 데 사용됩니다." }
      }
    },
    id: {
      title: "Preferensi Cookie",
      intro: "Situs ini menggunakan cookie untuk meningkatkan pengalaman Anda. Lihat Kebijakan Cookie kami.",
      policyLink: "Kebijakan Cookie",
      acceptAll: "Terima Semua",
      rejectAll: "Tolak Semua",
      preferences: "Preferensi",
      save: "Simpan Pilihan",
      close: "Tutup",
      cat: {
        essential: { title: "Cookie Esensial",  desc: "Diperlukan untuk fungsi dasar situs. Tidak dapat dinonaktifkan.", always: "Selalu aktif" },
        analytics:  { title: "Cookie Analitik", desc: "Digunakan untuk mengumpulkan statistik kunjungan anonim." },
        marketing:  { title: "Cookie Pemasaran",desc: "Digunakan untuk iklan yang dipersonalisasi dan retargeting." },
        functional: { title: "Cookie Fungsional",desc: "Digunakan untuk mengingat preferensi seperti bahasa dan tema." }
      }
    },
    sv: {
      title: "Cookie-inställningar",
      intro: "Den här webbplatsen använder cookies för att förbättra din upplevelse. Se vår Cookie-policy.",
      policyLink: "Cookie-policy",
      acceptAll: "Acceptera alla",
      rejectAll: "Avvisa alla",
      preferences: "Inställningar",
      save: "Spara val",
      close: "Stäng",
      cat: {
        essential: { title: "Nödvändiga cookies",        desc: "Krävs för att webbplatsen ska fungera. Kan inte inaktiveras.", always: "Alltid aktiv" },
        analytics:  { title: "Analytiska cookies",       desc: "Används för att samla in anonym besöksstatistik." },
        marketing:  { title: "Marknadsföringscookies",   desc: "Används för personlig annonsering och återmarknadsföring." },
        functional: { title: "Funktionella cookies",     desc: "Används för att komma ihåg inställningar som språk och tema." }
      }
    },
    uk: {
      title: "Налаштування файлів cookie",
      intro: "Цей сайт використовує файли cookie для покращення вашого досвіду. Дивіться нашу Політику cookie.",
      policyLink: "Політика cookie",
      acceptAll: "Прийняти всі",
      rejectAll: "Відхилити всі",
      preferences: "Налаштування",
      save: "Зберегти вибір",
      close: "Закрити",
      cat: {
        essential: { title: "Обов'язкові cookie",   desc: "Необхідні для роботи сайту. Не можуть бути вимкнені.", always: "Завжди активні" },
        analytics:  { title: "Аналітичні cookie",   desc: "Використовуються для збору анонімної статистики відвідувань." },
        marketing:  { title: "Маркетингові cookie", desc: "Використовуються для персоналізованої реклами та ретаргетингу." },
        functional: { title: "Функціональні cookie",desc: "Використовуються для запам'ятовування налаштувань мови, теми тощо." }
      }
    },
    cs: {
      title: "Předvolby souborů cookie",
      intro: "Tento web používá soubory cookie ke zlepšení vašeho zážitku. Viz naše Zásady souborů cookie.",
      policyLink: "Zásady souborů cookie",
      acceptAll: "Přijmout vše",
      rejectAll: "Odmítnout vše",
      preferences: "Předvolby",
      save: "Uložit volby",
      close: "Zavřít",
      cat: {
        essential: { title: "Nezbytné soubory cookie",    desc: "Nutné pro fungování webu. Nelze je deaktivovat.", always: "Vždy aktivní" },
        analytics:  { title: "Analytické soubory cookie", desc: "Slouží ke shromažďování anonymních statistik návštěv." },
        marketing:  { title: "Marketingové soubory cookie",desc: "Slouží k personalizované reklamě a retargetingu." },
        functional: { title: "Funkční soubory cookie",    desc: "Slouží k zapamatování předvoleb jako jazyk a téma." }
      }
    },
    hi: {
      title: "कुकी प्राथमिकताएं",
      intro: "यह साइट आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करती है। विवरण के लिए हमारी कुकी नीति देखें।",
      policyLink: "कुकी नीति",
      acceptAll: "सभी स्वीकार करें",
      rejectAll: "सभी अस्वीकार करें",
      preferences: "प्राथमिकताएं",
      save: "विकल्प सहेजें",
      close: "बंद करें",
      cat: {
        essential: { title: "आवश्यक कुकीज़",     desc: "साइट के कार्य करने के लिए आवश्यक। अक्षम नहीं की जा सकतीं।", always: "हमेशा सक्रिय" },
        analytics:  { title: "विश्लेषण कुकीज़",   desc: "अज्ञात विज़िट आँकड़े एकत्र करने के लिए उपयोग की जाती हैं।" },
        marketing:  { title: "मार्केटिंग कुकीज़", desc: "वैयक्तिकृत विज्ञापन और रिटार्गेटिंग के लिए उपयोग की जाती हैं।" },
        functional: { title: "कार्यात्मक कुकीज़", desc: "भाषा, थीम जैसी प्राथमिकताओं को याद रखने के लिए उपयोग की जाती हैं।" }
      }
    }
  };

  t = TRANSLATIONS[currentLocale] || TRANSLATIONS[DEFAULT_LOCALE];

  // ─────────────────────────────────────────────────────────────
  // STORAGE
  // ─────────────────────────────────────────────────────────────
  function readCookie() {
    var match = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));
    if (!match) return null;
    try {
      var s = JSON.parse(decodeURIComponent(match[2]));
      if (s.version !== config.policyVersion || s.blakfy !== VERSION) return null;
      return s;
    } catch (e) { return null; }
  }

  function writeCookie(s) {
    var expires = new Date(Date.now() + COOKIE_TTL_DAYS * 86400000).toUTCString();
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(JSON.stringify(s)) +
      "; expires=" + expires + "; path=/; SameSite=Lax" +
      (window.location.protocol === "https:" ? "; Secure" : "");
  }

  function makeHash() {
    var raw = navigator.userAgent + screen.width + "x" + screen.height + new Date().getTimezoneOffset();
    var h = 0;
    for (var i = 0; i < raw.length; i++) { h = ((h << 5) - h) + raw.charCodeAt(i); h |= 0; }
    return Math.abs(h).toString(36);
  }

  // ─────────────────────────────────────────────────────────────
  // GOOGLE CONSENT MODE v2
  // ─────────────────────────────────────────────────────────────
  function pushGCM(s) {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      ad_storage:              s.marketing  ? "granted" : "denied",
      ad_user_data:            s.marketing  ? "granted" : "denied",
      ad_personalization:      s.marketing  ? "granted" : "denied",
      analytics_storage:       s.analytics  ? "granted" : "denied",
      functionality_storage:   s.functional ? "granted" : "denied",
      personalization_storage: s.functional ? "granted" : "denied",
      security_storage:        "granted"
    });
  }

  // ─────────────────────────────────────────────────────────────
  // AUDIT LOG
  // ─────────────────────────────────────────────────────────────
  function audit(action, s) {
    if (!config.auditEndpoint) return;
    try {
      fetch(config.auditEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hash: s.hash, timestamp: s.timestamp, action: action,
          state: s, userAgent: navigator.userAgent, url: window.location.href,
          blakfy: VERSION, mainLang: mainLang
        }),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────
  // STATE & EVENTS
  // ─────────────────────────────────────────────────────────────
  var state = readCookie() || null;
  var changeListeners = [];

  function emit() {
    for (var i = 0; i < changeListeners.length; i++) {
      try { changeListeners[i](state); } catch (e) {}
    }
  }

  function buildState(prefs) {
    return {
      essential: true,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
      functional: !!prefs.functional,
      timestamp: new Date().toISOString(),
      version: config.policyVersion,
      blakfy: VERSION,
      locale: currentLocale,
      mainLang: mainLang,
      hash: state ? state.hash : makeHash()
    };
  }

  function commit(prefs, action) {
    state = buildState(prefs);
    writeCookie(state);
    pushGCM(state);
    audit(action, state);
    emit();
    closeUI();
  }

  // ─────────────────────────────────────────────────────────────
  // STATUS BAR
  // ─────────────────────────────────────────────────────────────
  var statusRoot = null;
  var statusData = null;

  var STATUS_COLORS = {
    info:        "#1a56db",
    warning:     "#b45309",
    error:       "#dc2626",
    success:     "#057a55",
    maintenance: "#6d28d9"
  };

  // Fallback chain: visitor locale → site main lang → "en" → first available key
  function resolveStatusMessage(data) {
    var msgs = data.message;
    if (!msgs) return null;
    return msgs[currentLocale] ||
           msgs[mainLang] ||
           msgs["en"] ||
           msgs[Object.keys(msgs)[0]] ||
           null;
  }

  function statusDismissKey(data) {
    return "blakfy_status_" + (data._id || "default");
  }

  function dismissStatus() {
    if (!statusRoot) return;
    try { sessionStorage.setItem(statusDismissKey(statusData), "1"); } catch (e) {}
    statusRoot.parentNode && statusRoot.parentNode.removeChild(statusRoot);
    statusRoot = null;
  }

  function renderStatus(data) {
    var msg = resolveStatusMessage(data);
    if (!msg) return;

    try {
      if (sessionStorage.getItem(statusDismissKey(data)) === "1") return;
    } catch (e) {}

    var rtlStatus = RTL_LOCALES.indexOf(currentLocale) > -1;
    var bg = STATUS_COLORS[data.type] || STATUS_COLORS.info;

    // Inject status styles once
    if (!document.getElementById("blakfy-status-styles")) {
      var css = document.createElement("style");
      css.id = "blakfy-status-styles";
      css.textContent = [
        ".blakfy-status{position:fixed;bottom:0;left:0;right:0;z-index:2147483645;display:flex;align-items:center;gap:12px;padding:10px 20px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.5}",
        ".blakfy-status-msg{flex:1}",
        ".blakfy-status-dismiss{background:none;border:none;color:inherit;cursor:pointer;padding:4px 10px;border-radius:6px;font-size:16px;opacity:.8;line-height:1}",
        ".blakfy-status-dismiss:hover{opacity:1;background:rgba(255,255,255,.2)}"
      ].join("");
      document.head.appendChild(css);
    }

    // Remove previous bar if locale switched
    if (statusRoot) {
      statusRoot.parentNode && statusRoot.parentNode.removeChild(statusRoot);
    }

    statusRoot = document.createElement("div");
    statusRoot.className = "blakfy-status";
    statusRoot.setAttribute("role", "status");
    statusRoot.setAttribute("dir", rtlStatus ? "rtl" : "ltr");
    statusRoot.style.cssText = "background:" + bg + ";color:#fff";
    statusRoot.innerHTML =
      '<span class="blakfy-status-msg">' + msg + '</span>' +
      '<button class="blakfy-status-dismiss" aria-label="close">&#x2715;</button>';
    document.body.appendChild(statusRoot);
    statusData = data;

    statusRoot.querySelector(".blakfy-status-dismiss").addEventListener("click", dismissStatus);
  }

  function fetchStatus() {
    if (!config.statusEnabled || !config.statusUrl) return;
    fetch(config.statusUrl + "?_=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.active) return;
        if (data.expires && new Date(data.expires) < new Date()) return;
        // derive a stable id for dismiss tracking
        data._id = (data.expires || "") + (data.type || "");
        renderStatus(data);
      })
      .catch(function () {});
  }

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────
  var uiRoot = null;
  var lastFocus = null;

  function injectStyles() {
    if (document.getElementById("blakfy-cookie-styles")) return;
    var css = document.createElement("style");
    css.id = "blakfy-cookie-styles";
    css.textContent = [
      ".blakfy-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:2147483646;display:flex;align-items:flex-end;justify-content:center;padding:16px}",
      ".blakfy-overlay.modal{align-items:center}",
      ".blakfy-card{background:#fff;color:#222;border-radius:16px;max-width:560px;width:100%;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,.2);font-family:system-ui,-apple-system,sans-serif;line-height:1.5}",
      ".blakfy-card[dir=rtl]{text-align:right}",
      ".blakfy-card h2{margin:0 0 12px;font-size:18px;font-weight:600}",
      ".blakfy-card p{margin:0 0 16px;font-size:14px;color:#444}",
      ".blakfy-card a{color:var(--blakfy-accent,#3E5C3A);text-decoration:underline}",
      ".blakfy-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}",
      ".blakfy-btn{flex:1;min-width:120px;min-height:44px;padding:12px 16px;border:1px solid #ddd;border-radius:999px;background:#fff;color:#222;font-size:14px;font-weight:500;cursor:pointer;transition:transform .1s,background .15s}",
      ".blakfy-btn:hover{transform:translateY(-1px)}",
      ".blakfy-btn-primary{background:var(--blakfy-accent,#3E5C3A);color:#fff;border-color:transparent}",
      ".blakfy-cat{padding:12px 0;border-top:1px solid #eee;display:flex;align-items:flex-start;gap:12px}",
      ".blakfy-cat:first-of-type{border-top:none}",
      ".blakfy-cat-text{flex:1}",
      ".blakfy-cat-text strong{display:block;font-size:14px;margin-bottom:2px}",
      ".blakfy-cat-text span{font-size:13px;color:#666}",
      ".blakfy-switch{flex-shrink:0;width:44px;height:24px;border-radius:999px;background:#ccc;position:relative;cursor:pointer;border:none;padding:0}",
      ".blakfy-switch[aria-checked=true]{background:var(--blakfy-accent,#3E5C3A)}",
      ".blakfy-switch::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}",
      ".blakfy-switch[aria-checked=true]::after{transform:translateX(20px)}",
      ".blakfy-switch:disabled{opacity:.6;cursor:not-allowed}",
      ".blakfy-close{position:absolute;top:12px;right:12px;background:none;border:none;font-size:20px;cursor:pointer;color:#666;width:32px;height:32px;border-radius:50%}",
      ".blakfy-close:hover{background:#f3f3f3}",
      "[dir=rtl] .blakfy-close{right:auto;left:12px}",
      "@media (prefers-reduced-motion:reduce){.blakfy-btn,.blakfy-switch::after{transition:none}}",
      "@media (max-width:480px){.blakfy-btn{flex:1 1 100%}}"
    ].join("");
    document.head.appendChild(css);
  }

  function createBanner() {
    var html =
      '<div class="blakfy-card" dir="' + (isRTL ? "rtl" : "ltr") + '" role="dialog" aria-labelledby="blakfy-title" aria-describedby="blakfy-desc" style="--blakfy-accent:' + config.accent + '">' +
      '<h2 id="blakfy-title">🍪 ' + t.title + '</h2>' +
      '<p id="blakfy-desc">' + t.intro + ' <a href="' + config.policyUrl + '">' + t.policyLink + '</a></p>' +
      '<div class="blakfy-actions">' +
      '<button class="blakfy-btn" data-act="reject">'  + t.rejectAll   + '</button>' +
      '<button class="blakfy-btn" data-act="prefs">'   + t.preferences + '</button>' +
      '<button class="blakfy-btn blakfy-btn-primary" data-act="accept">' + t.acceptAll + '</button>' +
      '</div></div>';
    return mountUI(html, false);
  }

  function createModal() {
    var current = state || { analytics: false, marketing: false, functional: false };
    var catRow = function (key, alwaysOn) {
      var c = t.cat[key];
      var checked = alwaysOn || !!current[key];
      return '<div class="blakfy-cat">' +
        '<div class="blakfy-cat-text"><strong>' + c.title + '</strong><span>' + c.desc + (alwaysOn ? ' (' + (c.always || '') + ')' : '') + '</span></div>' +
        '<button class="blakfy-switch" role="switch" aria-checked="' + checked + '" data-cat="' + key + '"' + (alwaysOn ? ' disabled' : '') + '></button>' +
        '</div>';
    };
    var html =
      '<div class="blakfy-card" dir="' + (isRTL ? "rtl" : "ltr") + '" role="dialog" aria-labelledby="blakfy-mtitle" style="--blakfy-accent:' + config.accent + ';position:relative">' +
      '<button class="blakfy-close" aria-label="' + t.close + '" data-act="close">×</button>' +
      '<h2 id="blakfy-mtitle">' + t.title + '</h2>' +
      catRow('essential', true) +
      catRow('analytics',  false) +
      catRow('marketing',  false) +
      catRow('functional', false) +
      '<div class="blakfy-actions" style="margin-top:16px">' +
      '<button class="blakfy-btn" data-act="save">' + t.save + '</button>' +
      '<button class="blakfy-btn blakfy-btn-primary" data-act="accept">' + t.acceptAll + '</button>' +
      '</div></div>';
    return mountUI(html, true);
  }

  function mountUI(innerHTML, isModal) {
    closeUI();
    injectStyles();
    lastFocus = document.activeElement;
    uiRoot = document.createElement("div");
    uiRoot.className = "blakfy-overlay" + (isModal ? " modal" : "");
    uiRoot.innerHTML = innerHTML;
    document.body.appendChild(uiRoot);
    var firstBtn = uiRoot.querySelector("button");
    if (firstBtn) firstBtn.focus();
    uiRoot.addEventListener("click", onUIClick);
    document.addEventListener("keydown", onKey);
    return uiRoot;
  }

  function closeUI() {
    if (!uiRoot) return;
    uiRoot.removeEventListener("click", onUIClick);
    document.removeEventListener("keydown", onKey);
    uiRoot.parentNode && uiRoot.parentNode.removeChild(uiRoot);
    uiRoot = null;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function onKey(e) {
    if (!uiRoot) return;
    if (e.key === "Escape") {
      if (uiRoot.classList.contains("modal")) { e.preventDefault(); closeUI(); }
    }
    if (e.key === "Tab") {
      var focusable = uiRoot.querySelectorAll('button:not([disabled]),a[href]');
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first)       { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  function onUIClick(e) {
    var target = e.target;
    var act = target.getAttribute("data-act");
    if      (act === "accept") commit({ analytics: true,  marketing: true,  functional: true  }, "accept_all");
    else if (act === "reject") commit({ analytics: false, marketing: false, functional: false }, "reject_all");
    else if (act === "prefs")  createModal();
    else if (act === "close")  closeUI();
    else if (act === "save") {
      var modal = uiRoot;
      commit({
        analytics:  modal.querySelector('[data-cat=analytics]').getAttribute("aria-checked")  === "true",
        marketing:  modal.querySelector('[data-cat=marketing]').getAttribute("aria-checked")  === "true",
        functional: modal.querySelector('[data-cat=functional]').getAttribute("aria-checked") === "true"
      }, "save_preferences");
    }
    var cat = target.getAttribute("data-cat");
    if (cat && !target.disabled) {
      var on = target.getAttribute("aria-checked") === "true";
      target.setAttribute("aria-checked", on ? "false" : "true");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────
  window.BlakfyCookie = {
    version:    VERSION,
    open:       function () { createModal(); },
    acceptAll:  function () { commit({ analytics: true,  marketing: true,  functional: true  }, "accept_all"); },
    rejectAll:  function () { commit({ analytics: false, marketing: false, functional: false }, "reject_all"); },
    getConsent: function (cat) { if (cat === "essential") return true; return state ? !!state[cat] : false; },
    getState:   function () { return state; },
    getMainLang: function () { return mainLang; },
    onChange:   function (fn) { changeListeners.push(fn); },

    // Call this when SPA dynamically changes language — accepts any BCP 47 tag.
    setLocale: function (l) {
      var resolved = normalizeLocale(l);
      if (!resolved) return;
      currentLocale = resolved;
      t = TRANSLATIONS[resolved] || TRANSLATIONS[DEFAULT_LOCALE];
      isRTL = RTL_LOCALES.indexOf(resolved) > -1;
      if (statusRoot && statusData) renderStatus(statusData);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────
  function init() {
    if (state) pushGCM(state);
    else createBanner();
    fetchStatus();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

})(window, document);
