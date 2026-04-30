// blakfy-cookie/src/compliance/dnt.js — Do Not Track detection and policy (weaker than GPC)

export const getDNT = () => {
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return true;
  if (typeof window !== "undefined" && window.doNotTrack === "1") return true;
  return false;
};

export const applyDNT = (opts) => {
  const o = opts || {};
  const mode = o.mode || "respect";
  const setPrefs = typeof o.setPrefs === "function" ? o.setPrefs : null;

  if (!getDNT()) return { applied: false, reason: "no-dnt-signal" };

  if (mode === "auto-deny") {
    if (setPrefs) setPrefs({ analytics: false, marketing: false });
    return { applied: true, reason: "dnt-auto-deny" };
  }

  return { applied: false, reason: "dnt-ui-hint-only" };
};
