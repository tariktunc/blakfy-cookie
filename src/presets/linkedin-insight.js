// blakfy-cookie/src/presets/linkedin-insight.js — LinkedIn Insight Tag preset (marketing category)

export default {
  name: "LinkedIn Insight Tag",
  category: "marketing",
  cookies: ["li_sugr", "bcookie", "lidc", "UserMatchHistory", "AnalyticsSyncHistory"],
  storage: [],
  scriptHosts: ["snap.licdn.com", "px.ads.linkedin.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
