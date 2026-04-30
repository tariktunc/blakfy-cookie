// blakfy-cookie/src/i18n/translations/pl.js — Polish translations

export default {
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
  },
  placeholder: {
    title: "Treść zablokowana",
    desc: "Musisz zezwolić na pliki cookie {category}, aby wyświetlić tę treść.",
    cta: "Zezwól"
  }
,
  tabs: {
    categories: 'Categories',
    services:   'Services',
    about:      'About'
  },
  service: {
    description:       'Description',
    processor:         'Data Processor',
    address:           'Address',
    dpo:               'DPO Contact',
    purposes:          'Purposes',
    technologies:      'Technologies Used',
    dataCollected:     'Data Collected',
    legalBasis:        'Legal Basis',
    retention:         'Retention Period',
    transferCountries: 'Transfer Countries',
    privacyPolicy:     'Privacy Policy',
    cookiePolicy:      'Cookie Policy',
    legalBasisValues: {
      consent:             'Consent (Art. 6 para. 1 s. 1 lit. a GDPR)',
      legitimate_interest: 'Legitimate Interest (Art. 6 para. 1 s. 1 lit. f GDPR)'
    },
    noServices: 'No services are configured for this site.'
  },
  svcAbout: {
    title:       'About this CMP',
    description: 'This website uses Blakfy Cookie Management Platform (CMP) to manage your consent preferences in compliance with GDPR, KVKK, CCPA and other applicable privacy regulations.',
    version:     'Version',
    learnMore:   'Learn more at blakfy.com'
  }
};