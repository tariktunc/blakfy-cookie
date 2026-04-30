// blakfy-cookie/src/presets/tiktok-pixel.js — TikTok Pixel preset (marketing category)

export default {
  name: "TikTok Pixel",
  category: "marketing",
  cookies: ["_ttp"],
  storage: [],
  scriptHosts: ["analytics.tiktok.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
