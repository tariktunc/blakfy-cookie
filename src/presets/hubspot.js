// blakfy-cookie/src/presets/hubspot.js — HubSpot preset (marketing category)

export default {
  name: "HubSpot",
  category: "marketing",
  cookies: ["__hstc", "__hssc", "__hssrc", "hubspotutk", "messagesUtk"],
  storage: [],
  scriptHosts: ["js.hs-scripts.com", "js.hs-analytics.net"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
