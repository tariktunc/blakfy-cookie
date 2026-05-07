// blakfy-cookie/src/presets/bing-ads-uet.js — Bing Ads UET preset (marketing category)

export default {
  name: "Bing Ads UET",
  category: "marketing",
  cookies: ["MUID", "_uetsid", "_uetvid"],
  storage: [],
  scriptHosts: ["bat.bing.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {},
};
