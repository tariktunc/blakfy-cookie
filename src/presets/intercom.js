// blakfy-cookie/src/presets/intercom.js — Intercom messenger preset (functional category)

export default {
  name: "Intercom",
  category: "functional",
  cookies: [/^intercom-/],
  storage: [],
  scriptHosts: ["widget.intercom.io", "js.intercomcdn.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {},
};
