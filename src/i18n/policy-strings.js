// blakfy-cookie/src/i18n/policy-strings.js — UI strings for the in-widget policy view (#49)
//
// Kept OUTSIDE the main TRANSLATIONS table (src/i18n/translations/*.js) on purpose:
// that table is under a strict 23-locale parity test (tests/i18n-completeness.test.js)
// and the owner decision for #49 explicitly deferred full localisation ("start with
// Turkish and English, professionally written, fall back to English elsewhere rather
// than shipping an uncertain translation of a legal notice"). Adding a legal-text key
// to all 23 locale files today would mean 21 of them ship a machine-shaped guess for
// text that carries real compliance weight — worse than an honest English fallback.

// Kept intentionally terse — every byte here ships in the widget bundle, which
// has a gzip size budget (#38, checked by `npm run size`).
export const POLICY_STRINGS = {
  tr: {
    tabLabel: "Politika",
    heading: "Çerez ve Gizlilik Bildirimi",
    incomplete:
      "Bildirim eksik: site sahibi bilgileri (data-blakfy-operator / " +
      "-operator-contact) tanımlanmamış. Yayın öncesi tamamlanmalı.",
    controllerTitle: "Veri Sorumlusu",
    controllerName: "Unvan",
    controllerContact: "İletişim",
    controllerAddress: "Adres",
    cookiesTitle: "Kullanılan Hizmetler",
    noCookies: "Üçüncü taraf hizmet yapılandırılmamış.",
    purposeLabel: "Amaç",
    legalBasisLabel: "Hukuki Sebep",
    retentionLabel: "Saklama Süresi",
    rightsTitle: "Haklarınız",
    rightsGDPR: "GDPR: erişim, düzeltme, silme, kısıtlama, taşınabilirlik ve itiraz hakkı.",
    rightsKVKK: "KVKK Md.11: bilgi talep etme, düzeltme, silme ve itiraz hakkı.",
    rightsCCPA: "CCPA: bilgi edinme, silme talebi ve satıştan vazgeçme (opt-out) hakkı.",
    rightsDefault: "Haklarınız için yukarıdaki iletişim bilgilerini kullanın.",
    versionLabel: "Sürüm",
    lastDecisionLabel: "Son karar",
    footnote: "Bu bildirim yapılandırılmış hizmetlerden otomatik üretilmiştir.",
  },
  en: {
    tabLabel: "Policy",
    heading: "Cookie & Privacy Notice",
    incomplete:
      "Notice incomplete: operator identity (data-blakfy-operator / " +
      "-operator-contact) not configured. Complete before going live.",
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
    footnote: "This notice was generated automatically from configured services.",
  },
};

export const getPolicyStrings = (locale) => POLICY_STRINGS[locale] || POLICY_STRINGS.en;
