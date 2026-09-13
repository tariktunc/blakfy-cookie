// blakfy-cookie/src/i18n/translations/he.js — Hebrew translations

export default {
  title: "העדפות עוגיות",
  intro: "אתר זה משתמש בעוגיות לשיפור חוויתך. ראה את מדיניות העוגיות שלנו לפרטים.",
  policyLink: "מדיניות עוגיות",
  acceptAll: "קבל הכל",
  rejectAll: "דחה הכל",
  preferences: "העדפות",
  save: "שמור בחירות",
  close: "סגור",
  cat: {
    essential: {
      title: "עוגיות חיוניות",
      desc: "נדרשות לתפקוד האתר. לא ניתן להשבית.",
      always: "פעיל תמיד",
    },
    analytics: { title: "עוגיות ניתוח", desc: "משמשות לאיסוף סטטיסטיקות ביקור אנונימיות." },
    marketing: { title: "עוגיות שיווק", desc: "משמשות לפרסום מותאם אישית ורימרקטינג." },
    functional: { title: "עוגיות פונקציונליות", desc: "משמשות לזכירת העדפות כמו שפה ועיצוב." },
    recording: {
      title: "הקלטת פעילות",
      desc: "מקליטה או משחזרת את הפעילות שלך (מפות חום, הקלטת מסך) לניתוח חוויית משתמש.",
    },
  },
  placeholder: {
    title: "התוכן חסום",
    desc: "עליך לאשר עוגיות {category} כדי לצפות בתוכן זה.",
    cta: "אפשר",
  },
  tabs: {
    categories: "קטגוריות",
    services: "שירותים",
    about: "אודות",
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
      legitimate_interest: "Legitimate Interest (Art. 6 para. 1 s. 1 lit. f GDPR)",
    },
    noServices: "No services are configured for this site.",
  },
  svcAbout: {
    title: "About this CMP",
    description:
      "This website uses Blakfy Cookie Management Platform (CMP) to manage your consent preferences in compliance with GDPR, KVKK, CCPA and other applicable privacy regulations.",
    version: "Version",
    learnMore: "Learn more at blakfy.com",
  },
  cookiePanel: {
    caveat:
      "רשימה זו מציגה עוגיות שניתנות לקריאה על ידי דף זה (document.cookie). היא אינה יכולה לראות עוגיות HttpOnly ואינה אומרת דבר על localStorage, IndexedDB או טביעת אצבע — זהו מבט חלקי, לא מלאי מלא.",
    empty: "לא זוהו עוגיות בדף זה.",
    unrecognised: "לא מזוהה — אינו תואם לשירות ידוע",
    essential: "חיוני — לא ניתן למחוק",
    delete: "מחק",
  },
};
