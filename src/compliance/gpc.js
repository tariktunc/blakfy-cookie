// blakfy-cookie/src/compliance/gpc.js — Global Privacy Control detection and policy

export const getGPC = () => {
  if (typeof navigator !== "undefined" && navigator.globalPrivacyControl === true) return true;
  if (typeof document !== "undefined" && document.documentElement && document.documentElement.dataset && document.documentElement.dataset.gpc === "1") return true;
  return false;
};

export const applyGPC = (opts) => {
  const o = opts || {};
  const mode = o.mode || "respect";
  const currentState = o.currentState || null;
  const setPrefs = typeof o.setPrefs === "function" ? o.setPrefs : null;

  if (mode !== "respect") return { applied: false, reason: "mode-disabled" };
  if (!getGPC()) return { applied: false, reason: "no-gpc-signal" };

  if (currentState && currentState.explicit === true) {
    return { applied: false, reason: "user-already-consented" };
  }

  if (setPrefs) setPrefs({ analytics: false, marketing: false });
  return { applied: true, reason: "gpc-auto-deny" };
};
