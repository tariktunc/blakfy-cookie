// blakfy-cookie/src/ui/modal.js — preferences modal: Categories | Services | About

import { SERVICE_METADATA } from "../data/service-metadata.js";

const CATEGORIES = ["essential", "analytics", "marketing", "functional"];

// ── helpers ──────────────────────────────────────────────────────────────────

const el = (tag, props) => {
  const node = document.createElement(tag);
  if (props) {
    for (const k in props) {
      if (k === "text") node.textContent = props[k];
      else if (k === "html") node.innerHTML = props[k];
      else if (k === "class") node.className = props[k];
      else node.setAttribute(k, props[k]);
    }
  }
  return node;
};

const safeGet = (obj, path, fallback) => {
  let cur = obj;
  const parts = path.split(".");
  for (let i = 0; i < parts.length; i++) {
    if (cur == null) return fallback;
    cur = cur[parts[i]];
  }
  return cur != null ? cur : fallback;
};

// ── Categories tab ────────────────────────────────────────────────────────────

const buildCatRow = (key, t, alwaysOn, checked) => {
  const c = safeGet(t, "cat." + key, {});
  const row = el("div", { class: "blakfy-cat" });

  const text = el("div", { class: "blakfy-cat-text" });
  const strong = el("strong", { text: c.title || key });
  text.appendChild(strong);
  const span = el("span", { text: (c.desc || "") + (alwaysOn ? " (" + (c.always || "") + ")" : "") });
  text.appendChild(span);
  row.appendChild(text);

  const sw = el("button", { class: "blakfy-switch", role: "switch", "aria-checked": checked ? "true" : "false", "data-cat": key });
  if (alwaysOn) sw.disabled = true;
  sw.addEventListener("click", () => {
    if (sw.disabled) return;
    sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") === "true" ? "false" : "true");
  });
  row.appendChild(sw);
  return row;
};

const buildCategoriesPanel = (t, current, card, onSave, onAccept) => {
  const panel = el("div", { class: "blakfy-tab-panel", "data-panel": "categories", "aria-hidden": "false" });

  panel.appendChild(buildCatRow("essential", t, true, true));
  panel.appendChild(buildCatRow("analytics", t, false, !!current.analytics));
  panel.appendChild(buildCatRow("marketing", t, false, !!current.marketing));
  panel.appendChild(buildCatRow("functional", t, false, !!current.functional));

  const actions = el("div", { class: "blakfy-actions" });
  actions.style.marginTop = "16px";

  const btnSave = el("button", { class: "blakfy-btn", "data-act": "save", text: t.save || "Save" });
  btnSave.addEventListener("click", () => {
    const prefs = {};
    for (let i = 0; i < CATEGORIES.length; i++) {
      const k = CATEGORIES[i];
      if (k === "essential") continue;
      const sw = card.querySelector('[data-cat="' + k + '"]');
      prefs[k] = sw ? sw.getAttribute("aria-checked") === "true" : false;
    }
    if (onSave) onSave(prefs);
  });
  actions.appendChild(btnSave);

  const btnAccept = el("button", { class: "blakfy-btn blakfy-btn-primary", "data-act": "accept", text: t.acceptAll || "Accept All" });
  btnAccept.addEventListener("click", () => { if (onAccept) onAccept(); });
  actions.appendChild(btnAccept);

  panel.appendChild(actions);
  return panel;
};

// ── Services tab ──────────────────────────────────────────────────────────────

const buildServiceCard = (presetKey, meta, t) => {
  const s = safeGet(t, "service", {});

  const card = el("div", { class: "blakfy-service-card" });

  const header = el("div", { class: "blakfy-service-card-header" });
  header.appendChild(el("span", { class: "blakfy-service-name", text: meta.displayName }));
  header.appendChild(el("span", { class: "blakfy-service-cat", text: meta.category }));
  const toggle = el("span", { class: "blakfy-service-toggle", text: "▸" });
  header.appendChild(toggle);
  card.appendChild(header);

  const body = el("div", { class: "blakfy-service-body", "aria-hidden": "true" });

  const dl = el("dl", { class: "blakfy-service-dl" });

  const addRow = (label, value) => {
    if (!value) return;
    const dt = el("dt", { class: "blakfy-service-dt", text: label });
    const dd = el("dd", { class: "blakfy-service-dd", text: value });
    dl.appendChild(dt);
    dl.appendChild(dd);
  };

  addRow(s.description || "Description", meta.description);
  addRow(s.processor || "Data Processor", meta.processor && meta.processor.name ? meta.processor.name : "");
  addRow(s.address || "Address", meta.processor && meta.processor.address ? meta.processor.address : "");
  if (meta.processor && meta.processor.dpo && meta.processor.dpo.indexOf("http") !== 0) {
    addRow(s.dpo || "DPO Contact", meta.processor.dpo);
  }
  addRow(s.purposes || "Purposes", meta.purposes && meta.purposes.length ? meta.purposes.join(", ") : "");
  addRow(s.technologies || "Technologies Used", meta.technologies && meta.technologies.length ? meta.technologies.join(", ") : "");
  addRow(s.dataCollected || "Data Collected", meta.dataCollected && meta.dataCollected.length ? meta.dataCollected.join(", ") : "");

  const lbv = safeGet(t, "service.legalBasisValues", {});
  const lbLabel = lbv[meta.legalBasis] || (s.legalBasisValues && s.legalBasisValues[meta.legalBasis]) || meta.legalBasis || "";
  addRow(s.legalBasis || "Legal Basis", lbLabel);

  addRow(s.retention || "Retention Period", meta.retention);
  addRow(s.transferCountries || "Transfer Countries", meta.transferCountries && meta.transferCountries.length ? meta.transferCountries.join(", ") : "");

  body.appendChild(dl);

  if ((meta.privacyUrl && meta.privacyUrl.length) || (meta.cookiePolicyUrl && meta.cookiePolicyUrl.length)) {
    const links = el("div", { class: "blakfy-service-links" });
    if (meta.privacyUrl) {
      const a = el("a", { href: meta.privacyUrl, target: "_blank", rel: "noopener noreferrer", text: s.privacyPolicy || "Privacy Policy" });
      links.appendChild(a);
    }
    if (meta.cookiePolicyUrl) {
      const a = el("a", { href: meta.cookiePolicyUrl, target: "_blank", rel: "noopener noreferrer", text: s.cookiePolicy || "Cookie Policy" });
      links.appendChild(a);
    }
    body.appendChild(links);
  }

  card.appendChild(body);

  header.addEventListener("click", () => {
    const hidden = body.getAttribute("aria-hidden") === "true";
    body.setAttribute("aria-hidden", hidden ? "false" : "true");
    toggle.textContent = hidden ? "▾" : "▸";
  });

  return card;
};

const buildServicesPanel = (activePresets, t) => {
  const panel = el("div", { class: "blakfy-tab-panel", "data-panel": "services", "aria-hidden": "true" });
  const list = el("div", { class: "blakfy-service-list" });

  if (!activePresets || activePresets.length === 0) {
    const empty = el("p", { class: "blakfy-svc-empty", text: safeGet(t, "service.noServices", "No services configured.") });
    list.appendChild(empty);
  } else {
    for (let i = 0; i < activePresets.length; i++) {
      const { key, meta } = activePresets[i];
      if (meta) list.appendChild(buildServiceCard(key, meta, t));
    }
  }

  panel.appendChild(list);
  return panel;
};

// ── About tab ─────────────────────────────────────────────────────────────────

const buildAboutPanel = (t, version) => {
  const panel = el("div", { class: "blakfy-tab-panel", "data-panel": "about", "aria-hidden": "true" });
  const content = el("div", { class: "blakfy-about-panel" });

  const brand = el("div", { class: "blakfy-about-brand" });
  brand.appendChild(el("strong", { text: "Blakfy Studio" }));
  content.appendChild(brand);

  const ab = safeGet(t, "svcAbout", {});

  if (ab.title) content.appendChild(el("p", { text: "" })).textContent = ab.title ? "" : "";

  const desc = el("p", { text: ab.description || "This website uses Blakfy Cookie Management Platform (CMP) to manage your consent preferences." });
  content.appendChild(desc);

  const meta = el("p", { class: "blakfy-about-meta" });
  meta.textContent = (ab.version || "Version") + ": " + (version || "");
  content.appendChild(meta);

  const a = el("a", { href: "https://blakfy.com", target: "_blank", rel: "noopener noreferrer", text: ab.learnMore || "Learn more at blakfy.com" });
  content.appendChild(a);

  panel.appendChild(content);
  return panel;
};

// ── Tab switching ─────────────────────────────────────────────────────────────

const initTabs = (card) => {
  const btns = card.querySelectorAll(".blakfy-tab-btn");
  const panels = card.querySelectorAll(".blakfy-tab-panel");

  const switchTab = (target) => {
    for (let i = 0; i < btns.length; i++) {
      const active = btns[i].getAttribute("data-tab") === target;
      btns[i].setAttribute("aria-selected", active ? "true" : "false");
      if (active) btns[i].classList.add("blakfy-tab-btn--active");
      else btns[i].classList.remove("blakfy-tab-btn--active");
    }
    for (let i = 0; i < panels.length; i++) {
      panels[i].setAttribute("aria-hidden", panels[i].getAttribute("data-panel") === target ? "false" : "true");
    }
  };

  for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () { switchTab(this.getAttribute("data-tab")); });
  }
};

// ── Public factory ────────────────────────────────────────────────────────────

export const createModal = ({ t, isRTL, accent, currentState, presets, version, onSave, onAccept, onClose }) => {
  const current = currentState || { analytics: false, marketing: false, functional: false };

  const card = el("div", { class: "blakfy-card", role: "dialog", "aria-labelledby": "blakfy-mtitle" });
  card.setAttribute("dir", isRTL ? "rtl" : "ltr");
  card.style.cssText = "--blakfy-accent:" + accent + ";position:relative";

  const closeBtn = el("button", { class: "blakfy-close", "aria-label": t.close || "Close", "data-act": "close", text: "×" });
  closeBtn.addEventListener("click", () => { if (onClose) onClose(); });
  card.appendChild(closeBtn);

  const h2 = el("h2", { id: "blakfy-mtitle", text: t.title || "Cookie Preferences" });
  card.appendChild(h2);

  // Tab bar
  const tabs = safeGet(t, "tabs", { categories: "Categories", services: "Services", about: "About" });
  const tabBar = el("nav", { class: "blakfy-tabs", role: "tablist" });

  const makeTabBtn = (id, label, active) => {
    const btn = el("button", { class: "blakfy-tab-btn" + (active ? " blakfy-tab-btn--active" : ""), role: "tab", "data-tab": id, "aria-selected": active ? "true" : "false", text: label });
    return btn;
  };

  tabBar.appendChild(makeTabBtn("categories", tabs.categories || "Categories", true));
  tabBar.appendChild(makeTabBtn("services",   tabs.services   || "Services",   false));
  tabBar.appendChild(makeTabBtn("about",      tabs.about      || "About",      false));
  card.appendChild(tabBar);

  // Enrich active presets with metadata
  const enriched = [];
  if (presets && presets.length) {
    for (let i = 0; i < presets.length; i++) {
      const key = typeof presets[i] === "string" ? presets[i] : presets[i].key;
      const meta = SERVICE_METADATA[key] || (typeof presets[i] === "object" ? presets[i].meta : null);
      if (meta) enriched.push({ key, meta });
    }
  }

  // Panels
  card.appendChild(buildCategoriesPanel(t, current, card, onSave, onAccept));
  card.appendChild(buildServicesPanel(enriched, t));
  card.appendChild(buildAboutPanel(t, version));

  // Badge slot
  card.appendChild(el("div", { class: "blakfy-badge-slot" }));

  // Wire up tab switching after DOM is built
  initTabs(card);

  return card;
};
