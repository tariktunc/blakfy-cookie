// blakfy-cookie/src/ui/banner.js — first-visit consent banner DOM factory (horizontal layout)

export const createBanner = ({ t, isRTL, accent, policyUrl, onAccept, onReject, onPrefs }) => {
  const card = document.createElement("div");
  card.className = "blakfy-card";
  card.setAttribute("dir", isRTL ? "rtl" : "ltr");
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-labelledby", "blakfy-title");
  card.setAttribute("aria-describedby", "blakfy-desc");
  card.style.cssText = "--blakfy-accent:" + accent;

  const body = document.createElement("div");
  body.className = "blakfy-banner-body";

  const textBlock = document.createElement("div");
  textBlock.className = "blakfy-card-text";

  const h2 = document.createElement("h2");
  h2.id = "blakfy-title";
  h2.textContent = "🍪 " + t.title;
  textBlock.appendChild(h2);

  const p = document.createElement("p");
  p.id = "blakfy-desc";
  p.textContent = t.intro + " ";
  const a = document.createElement("a");
  a.href = policyUrl;
  a.textContent = t.policyLink;
  p.appendChild(a);
  textBlock.appendChild(p);

  body.appendChild(textBlock);

  const actions = document.createElement("div");
  actions.className = "blakfy-actions";

  const btnReject = document.createElement("button");
  btnReject.className = "blakfy-btn";
  btnReject.setAttribute("data-act", "reject");
  btnReject.textContent = t.rejectAll;
  btnReject.addEventListener("click", () => { if (onReject) onReject(); });
  actions.appendChild(btnReject);

  const btnPrefs = document.createElement("button");
  btnPrefs.className = "blakfy-btn";
  btnPrefs.setAttribute("data-act", "prefs");
  btnPrefs.textContent = t.preferences;
  btnPrefs.addEventListener("click", () => { if (onPrefs) onPrefs(); });
  actions.appendChild(btnPrefs);

  const btnAccept = document.createElement("button");
  btnAccept.className = "blakfy-btn blakfy-btn-primary";
  btnAccept.setAttribute("data-act", "accept");
  btnAccept.textContent = t.acceptAll;
  btnAccept.addEventListener("click", () => { if (onAccept) onAccept(); });
  actions.appendChild(btnAccept);

  body.appendChild(actions);
  card.appendChild(body);

  const badgeSlot = document.createElement("div");
  badgeSlot.className = "blakfy-badge-slot";
  card.appendChild(badgeSlot);

  return card;
};
