// blakfy-cookie/src/i18n/translations/ko.js — Korean translations

export default {
  title: "쿠키 환경설정",
  intro:
    "이 사이트는 경험을 향상시키기 위해 쿠키를 사용합니다. 자세한 내용은 쿠키 정책을 확인하세요.",
  policyLink: "쿠키 정책",
  acceptAll: "모두 수락",
  rejectAll: "모두 거부",
  preferences: "환경설정",
  save: "선택 저장",
  close: "닫기",
  cat: {
    essential: {
      title: "필수 쿠키",
      desc: "사이트 기능에 필요하며 비활성화할 수 없습니다.",
      always: "항상 활성",
    },
    analytics: { title: "분석 쿠키", desc: "익명 방문 통계 수집에 사용됩니다." },
    marketing: { title: "마케팅 쿠키", desc: "맞춤형 광고 및 리타게팅에 사용됩니다." },
    functional: {
      title: "기능성 쿠키",
      desc: "언어, 테마 등의 환경설정을 기억하는 데 사용됩니다.",
    },
    recording: {
      title: "세션 녹화",
      desc: "UX 분석을 위해 세션을 녹화하거나 재생합니다 (히트맵, 화면 녹화).",
    },
  },
  placeholder: {
    title: "콘텐츠가 차단되었습니다",
    desc: "이 콘텐츠를 보려면 {category} 쿠키를 허용해야 합니다.",
    cta: "허용",
  },
  tabs: {
    categories: "카테고리",
    services: "서비스",
    about: "정보",
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
      "이 목록은 이 페이지가 읽을 수 있는 쿠키(document.cookie)를 표시합니다. HttpOnly 쿠키는 볼 수 없으며 localStorage, IndexedDB 또는 핑거프린팅에 대해서는 알 수 없습니다 — 완전한 목록이 아니라 부분적인 보기입니다.",
    empty: "이 페이지에서 쿠키가 감지되지 않았습니다.",
    unrecognised: "인식되지 않음 — 알려진 서비스와 일치하지 않음",
    essential: "필수 — 삭제할 수 없음",
    delete: "삭제",
  },
};
