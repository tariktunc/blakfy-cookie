// blakfy-cookie/src/presets/tawk-to.js — Tawk.to live chat preset (functional category)

export default {
  name: "Tawk.to",
  category: "functional",
  cookies: ["TawkConnectionTime", /^__tawkuuid/, /^Tawk_/],
  storage: [],
  scriptHosts: ["embed.tawk.to"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
