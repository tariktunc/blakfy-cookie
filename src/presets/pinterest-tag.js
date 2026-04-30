// blakfy-cookie/src/presets/pinterest-tag.js — Pinterest Tag preset (marketing category)

export default {
  name: "Pinterest Tag",
  category: "marketing",
  cookies: ["_pinterest_ct", "_pinterest_sess"],
  storage: [],
  scriptHosts: ["s.pinimg.com", "ct.pinterest.com"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
