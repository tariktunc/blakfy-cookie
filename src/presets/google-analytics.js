// blakfy-cookie/src/presets/google-analytics.js — GA4 preset (analytics category)

export default {
  name: "Google Analytics 4",
  category: "analytics",
  cookies: [/^_ga/, "_gid", "_gat", /^_ga_/],
  storage: [],
  scriptHosts: ["www.googletagmanager.com", "google-analytics.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
