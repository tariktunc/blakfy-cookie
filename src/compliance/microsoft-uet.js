// blakfy-cookie/src/compliance/microsoft-uet.js — Microsoft UET / Clarity consent signals

let defaultsInstalled = false;

export const installDefaults = () => {
  if (typeof window === "undefined") return;
  if (defaultsInstalled) return;
  defaultsInstalled = true;

  window.uetq = window.uetq || [];
  window.uetq.push("consent", "default", { ad_storage: "denied" });
};

export const pushUET = (state) => {
  if (typeof window === "undefined") return;
  const s = state || {};
  window.uetq = window.uetq || [];
  window.uetq.push("consent", "update", {
    ad_storage: s.marketing ? "granted" : "denied",
  });
};
