// blakfy-cookie/src/presets/mailchimp.js — Mailchimp preset (marketing category)

export default {
  name: "Mailchimp",
  category: "marketing",
  cookies: [/^_mcid/, "ak_bmsc", "_mcvisit"],
  storage: [],
  scriptHosts: ["chimpstatic.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
