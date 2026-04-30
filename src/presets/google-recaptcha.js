// blakfy-cookie/src/presets/google-recaptcha.js — Google reCAPTCHA preset (functional category)

export default {
  name: "Google reCAPTCHA",
  category: "functional",
  cookies: ["_GRECAPTCHA"],
  storage: [],
  scriptHosts: ["www.google.com/recaptcha", "www.gstatic.com/recaptcha"],
  onGrant: (state) => {},
  onRevoke: (state) => {}
};
