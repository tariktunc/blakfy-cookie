// blakfy-cookie/src/presets/google-tag-manager.js — GTM preset (analytics category)

export default {
  name: "Google Tag Manager",
  category: "analytics",
  cookies: ["_gtm", /^_dc_gtm/],
  storage: [],
  scriptHosts: ["www.googletagmanager.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {},
};
