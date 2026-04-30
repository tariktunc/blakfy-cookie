// blakfy-cookie/src/i18n/translations/ko.js — Korean translations

export default {
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
  },
  placeholder: {
    title: "콘텐츠가 차단되었습니다",
    desc: "이 콘텐츠를 보려면 {category} 쿠키를 허용해야 합니다.",
    cta: "허용"
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