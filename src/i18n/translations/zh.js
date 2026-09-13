// blakfy-cookie/src/i18n/translations/zh.js — Simplified Chinese translations

export default {
  title: "Cookie 偏好设置",
  intro: "本网站使用 Cookie 来改善您的体验。详情请查看我们的 Cookie 政策。",
  policyLink: "Cookie 政策",
  acceptAll: "接受全部",
  rejectAll: "拒绝全部",
  preferences: "偏好设置",
  save: "保存选择",
  close: "关闭",
  cat: {
    essential: { title: "必要 Cookie", desc: "网站基本功能所必需，无法禁用。", always: "始终启用" },
    analytics: { title: "分析 Cookie", desc: "用于收集匿名访问统计数据。" },
    marketing: { title: "营销 Cookie", desc: "用于个性化广告和再营销。" },
    functional: { title: "功能 Cookie", desc: "用于记住语言、主题等偏好设置。" },
    recording: {
      title: "会话录制",
      desc: "为进行用户体验分析而录制或回放您的会话（热图、屏幕录制）。",
    },
  },
  placeholder: {
    title: "内容已被阻止",
    desc: "您需要允许 {category} Cookie 才能查看此内容。",
    cta: "允许",
  },
  tabs: {
    categories: "分类",
    services: "服务",
    about: "关于",
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
      "此列表显示此页面可读取的 Cookie（document.cookie）。它无法查看 HttpOnly Cookie，也不会说明 localStorage、IndexedDB 或指纹识别的情况 — 这只是部分视图，并非完整清单。",
    empty: "此页面未检测到任何 Cookie。",
    unrecognised: "未识别 — 与任何已知服务不匹配",
    essential: "必要 — 无法删除",
    delete: "删除",
  },
};
