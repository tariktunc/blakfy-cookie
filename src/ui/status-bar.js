// blakfy-cookie/src/ui/status-bar.js — central status bar from status.json (XSS-safe via textContent)

import { RTL_LOCALES } from "../i18n/detect.js";

const STATUS_COLORS = {
  info:        "#1a56db",
  warning:     "#b45309",
  error:       "#dc2626",
  success:     "#057a55",
  maintenance: "#6d28d9",
};

let statusRoot = null;
let statusData = null;

const resolveStatusMessage = (data, currentLocale, mainLang) => {
  const msgs = data && data.message;
  if (!msgs) return null;
  return msgs[currentLocale] ||
         msgs[mainLang] ||
         msgs["en"] ||
         msgs[Object.keys(msgs)[0]] ||
         null;
};

const dismissKey = (data) => "blakfy_status_" + ((data && data._id) || "default");

export const dismissStatus = () => {
  if (!statusRoot) return;
  try { sessionStorage.setItem(dismissKey(statusData), "1"); } catch (e) { /* ignore */ }
  if (statusRoot.parentNode) statusRoot.parentNode.removeChild(statusRoot);
  statusRoot = null;
  statusData = null;
};

export const renderStatus = ({ data, currentLocale, mainLang }) => {
  const msg = resolveStatusMessage(data, currentLocale, mainLang);
  if (!msg) return;

  try {
    if (sessionStorage.getItem(dismissKey(data)) === "1") return;
  } catch (e) { /* ignore */ }

  const rtl = RTL_LOCALES.indexOf(currentLocale) > -1;
  const bg = STATUS_COLORS[data.type] || STATUS_COLORS.info;

  if (statusRoot && statusRoot.parentNode) {
    statusRoot.parentNode.removeChild(statusRoot);
  }

  const root = document.createElement("div");
  root.className = "blakfy-status";
  root.setAttribute("role", "status");
  root.setAttribute("dir", rtl ? "rtl" : "ltr");
  root.style.cssText = "background:" + bg + ";color:#fff";

  const span = document.createElement("span");
  span.className = "blakfy-status-msg";
  span.textContent = msg;
  root.appendChild(span);

  const btn = document.createElement("button");
  btn.className = "blakfy-status-dismiss";
  btn.setAttribute("aria-label", "close");
  btn.textContent = "✕";
  btn.addEventListener("click", dismissStatus);
  root.appendChild(btn);

  document.body.appendChild(root);
  statusRoot = root;
  statusData = data;
};

export const fetchStatus = (url) => {
  if (!url) return Promise.resolve(null);
  return fetch(url + (url.indexOf("?") > -1 ? "&" : "?") + "_=" + Date.now(), { cache: "no-store" })
    .then((r) => r.json())
    .then((data) => {
      if (!data || !data.active) return null;
      if (data.expires && new Date(data.expires) < new Date()) return null;
      data._id = (data.expires || "") + (data.type || "");
      return data;
    })
    .catch(() => null);
};
