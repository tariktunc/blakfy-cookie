// blakfy-cookie/src/i18n/translations/sv.js — Swedish translations

export default {
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
  },
  placeholder: {
    title: "Innehåll blockerat",
    desc: "Du måste tillåta {category}-cookies för att visa detta innehåll.",
    cta: "Tillåt"
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