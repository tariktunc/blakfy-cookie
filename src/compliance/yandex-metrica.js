// blakfy-cookie/src/compliance/yandex-metrica.js — Yandex Metrica gating layer (no native GCM-style API)

let defaultsInstalled = false;

export const installDefaults = () => {
  if (typeof window === "undefined") return;
  if (defaultsInstalled) return;
  defaultsInstalled = true;

  if (typeof window.ym !== "function") {
    window.ym = function () { /* swallow until consent */ };
    window.ym.__blakfyStub = true;
  }
};

export const applyYandex = (state, ctx) => {
  const s = state || {};
  const unblock = ctx && ctx.unblock;
  if (typeof unblock !== "function") return;
  if (s.analytics === true) unblock("analytics");
  if (s.recording === true) unblock("recording");
};

export const revokeYandex = (ctx) => {
  const runCleanup = ctx && ctx.runCleanup;
  if (typeof runCleanup !== "function") return;
  runCleanup("analytics");
  runCleanup("recording");
};
