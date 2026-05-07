// blakfy-cookie/src/presets/facebook-pixel.js — Meta/Facebook Pixel preset (marketing category)

export default {
  name: "Facebook Pixel",
  category: "marketing",
  cookies: ["_fbp", "_fbc"],
  storage: [],
  scriptHosts: ["connect.facebook.net"],
  onGrant: (state) => {},
  onRevoke: (state) => {},
};
