import { beforeEach, vi } from "vitest";

const clearAllCookies = () => {
  if (typeof document === "undefined") return;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (let i = 0; i < cookies.length; i++) {
    const eq = cookies[i].indexOf("=");
    const name = (eq === -1 ? cookies[i] : cookies[i].slice(0, eq)).trim();
    if (name) {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
  }
};

let uuidCounter = 0;

beforeEach(() => {
  clearAllCookies();
  if (typeof localStorage !== "undefined") {
    try { localStorage.clear(); } catch (e) { /* ignore */ }
  }
  if (typeof document !== "undefined") {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("lang");
    document.documentElement.removeAttribute("dir");
  }

  delete window.dataLayer;
  delete window.uetq;
  delete window.gtag;
  delete window.ym;
  delete window.__tcfapi;
  delete window.__uspapi;
  delete window.__blakfyTcfMsg;
  delete window.BlakfyCookie;

  uuidCounter = 0;
  if (typeof crypto !== "undefined") {
    crypto.randomUUID = vi.fn(() => {
      uuidCounter++;
      const hex = String(uuidCounter).padStart(8, "0");
      return hex + "-0000-4000-8000-000000000000";
    });
  }
});
