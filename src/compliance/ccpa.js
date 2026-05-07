// blakfy-cookie/src/compliance/ccpa.js — CCPA / CPRA __uspapi + Do Not Sell link

let optedOutFlag = false;
let noticeGiven = true;
const cmpVersion = 1;
const listeners = [];
let installed = false;

export const buildUSPString = (opts) => {
  const o = opts || {};
  const version = o.version || 1;
  const notice = o.notice === false ? "N" : o.notice === null ? "-" : "Y";
  const optOut = o.optedOut === true ? "Y" : o.optedOut === null ? "-" : "N";
  const lspa = o.lspa === true ? "Y" : o.lspa === null ? "-" : "N";
  return String(version) + notice + optOut + lspa;
};

const currentString = () =>
  buildUSPString({ version: cmpVersion, notice: noticeGiven, optedOut: optedOutFlag, lspa: false });

const fireListeners = () => {
  const data = { version: cmpVersion, uspString: currentString() };
  for (let i = 0; i < listeners.length; i++) {
    try {
      listeners[i].cb(data, true);
    } catch (e) {
      /* noop */
    }
  }
};

export const installUSP = (opts) => {
  if (typeof window === "undefined") return;
  const o = opts || {};
  if (typeof o.optedOut === "boolean") optedOutFlag = o.optedOut;
  if (typeof o.notice === "boolean") noticeGiven = o.notice;

  if (installed) return;
  installed = true;

  window.__uspapi = (command, version, callback) => {
    if (typeof callback !== "function") return;
    if (command === "getUSPData") {
      callback({ version: cmpVersion, uspString: currentString() }, true);
      return;
    }
    callback(null, false);
  };

  if (
    typeof document !== "undefined" &&
    !document.querySelector('iframe[name="__uspapiLocator"]')
  ) {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "display:none;position:absolute;width:0;height:0;border:0";
      iframe.name = "__uspapiLocator";
      (document.body || document.documentElement).appendChild(iframe);
    } catch (e) {
      /* noop */
    }
  }
};

export const optOut = () => {
  optedOutFlag = true;
  noticeGiven = true;
  fireListeners();
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("blakfy:ccpa:optout", { detail: { uspString: currentString() } })
      );
    } catch (e) {
      /* noop */
    }
  }
};

export const isOptedOut = () => optedOutFlag === true;

export const installDoNotSellLink = (opts) => {
  if (typeof document === "undefined") return null;
  const o = opts || {};
  const container = o.container || document.body;
  if (!container) return null;
  const existing = container.querySelector(".blakfy-ccpa-link");
  if (existing) return existing;

  const t = o.t || {};
  const label = (t.ccpa && t.ccpa.doNotSell) || "Do Not Sell or Share My Personal Information";

  const a = document.createElement("a");
  a.className = "blakfy-ccpa-link";
  a.href = "#";
  a.setAttribute("role", "button");
  a.textContent = label;
  a.addEventListener("click", (e) => {
    e.preventDefault();
    optOut();
  });
  container.appendChild(a);
  return a;
};
