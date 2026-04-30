// blakfy-cookie/src/ui/modal.js — preferences modal with per-category switches (badge slot reserved for A5)

const CATEGORIES = ["essential", "analytics", "marketing", "functional"];

const buildCatRow = (key, t, alwaysOn, checked) => {
  const c = t.cat[key];
  const row = document.createElement("div");
  row.className = "blakfy-cat";

  const text = document.createElement("div");
  text.className = "blakfy-cat-text";
  const strong = document.createElement("strong");
  strong.textContent = c.title;
  text.appendChild(strong);
  const span = document.createElement("span");
  span.textContent = c.desc + (alwaysOn ? " (" + (c.always || "") + ")" : "");
  text.appendChild(span);
  row.appendChild(text);

  const sw = document.createElement("button");
  sw.className = "blakfy-switch";
  sw.setAttribute("role", "switch");
  sw.setAttribute("aria-checked", checked ? "true" : "false");
  sw.setAttribute("data-cat", key);
  if (alwaysOn) sw.disabled = true;
  sw.addEventListener("click", () => {
    if (sw.disabled) return;
    const on = sw.getAttribute("aria-checked") === "true";
    sw.setAttribute("aria-checked", on ? "false" : "true");
  });
  row.appendChild(sw);

  return row;
};

export const createModal = ({ t, isRTL, accent, currentState, onSave, onAccept, onClose }) => {
  const current = currentState || { analytics: false, marketing: false, functional: false };

  const card = document.createElement("div");
  card.className = "blakfy-card";
  card.setAttribute("dir", isRTL ? "rtl" : "ltr");
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-labelledby", "blakfy-mtitle");
  card.style.cssText = "--blakfy-accent:" + accent + ";position:relative";

  const closeBtn = document.createElement("button");
  closeBtn.className = "blakfy-close";
  closeBtn.setAttribute("aria-label", t.close);
  closeBtn.setAttribute("data-act", "close");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => { if (onClose) onClose(); });
  card.appendChild(closeBtn);

  const h2 = document.createElement("h2");
  h2.id = "blakfy-mtitle";
  h2.textContent = t.title;
  card.appendChild(h2);

  card.appendChild(buildCatRow("essential", t, true, true));
  card.appendChild(buildCatRow("analytics", t, false, !!current.analytics));
  card.appendChild(buildCatRow("marketing", t, false, !!current.marketing));
  card.appendChild(buildCatRow("functional", t, false, !!current.functional));

  const actions = document.createElement("div");
  actions.className = "blakfy-actions";
  actions.style.marginTop = "16px";

  const btnSave = document.createElement("button");
  btnSave.className = "blakfy-btn";
  btnSave.setAttribute("data-act", "save");
  btnSave.textContent = t.save;
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

  const btnAccept = document.createElement("button");
  btnAccept.className = "blakfy-btn blakfy-btn-primary";
  btnAccept.setAttribute("data-act", "accept");
  btnAccept.textContent = t.acceptAll;
  btnAccept.addEventListener("click", () => { if (onAccept) onAccept(); });
  actions.appendChild(btnAccept);

  card.appendChild(actions);

  const badgeSlot = document.createElement("div");
  badgeSlot.className = "blakfy-badge-slot";
  card.appendChild(badgeSlot);

  return card;
};
