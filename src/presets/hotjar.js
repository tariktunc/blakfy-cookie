// blakfy-cookie/src/presets/hotjar.js — Hotjar analytics preset (analytics category)

export default {
  name: "Hotjar",
  category: "analytics",
  cookies: [/^_hj/],
  storage: [],
  scriptHosts: ["static.hotjar.com", "script.hotjar.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {},
};
