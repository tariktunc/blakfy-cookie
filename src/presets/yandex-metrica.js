// blakfy-cookie/src/presets/yandex-metrica.js — Yandex Metrica preset (analytics + recording sub-category for Webvisor)

export default {
  name: "Yandex Metrica",
  category: "analytics",
  subCategory: "recording",
  cookies: [/^_ym/, "yandexuid", "yabs-frequency"],
  storage: [],
  scriptHosts: ["mc.yandex.ru", "mc.webvisor.com", "mc.yandex.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {},
};
