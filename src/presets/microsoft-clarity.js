// blakfy-cookie/src/presets/microsoft-clarity.js — Microsoft Clarity preset (analytics category)

export default {
  name: "Microsoft Clarity",
  category: "analytics",
  cookies: ["_clck", "_clsk", "CLID", "MR", "MUID", "SM"],
  storage: [],
  scriptHosts: ["www.clarity.ms", "c.clarity.ms"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
