// blakfy-cookie/src/ui/banner.js — first-visit consent banner DOM factory

import { isAutoPolicy } from "../compliance/policy-text.js";

export const createBanner = ({
  t,
  isRTL,
  accent,
  theme,
  locale,
  policyUrl,
  onAccept,
  onReject,
  onPrefs,
  onOpenPolicy,
}) => {
  const card = document.createElement("div");
  card.className = "blakfy-card";
  card.setAttribute("dir", isRTL ? "rtl" : "ltr");
  card.setAttribute("role", "dialog");
  // #27: NOT aria-modal — the banner never blocks page content (overlay is
  // pointer-events:none), so it is a non-modal dialog per the ARIA APG. Background
  // inert/scroll-lock stay reserved for the true modal (see modal.js + focus-trap.js).
  card.setAttribute("aria-labelledby", "blakfy-title");
  card.setAttribute("aria-describedby", "blakfy-desc");
  if (locale) card.setAttribute("lang", locale);
  card.style.cssText = "--blakfy-accent:" + accent;
  if (theme && theme !== "light") card.setAttribute("data-blakfy-theme", theme);

  const h2 = document.createElement("h2");
  h2.id = "blakfy-title";
  h2.textContent = t.title;
  card.appendChild(h2);

  const p = document.createElement("p");
  p.id = "blakfy-desc";
  p.textContent = t.intro + " ";
  const a = document.createElement("a");
  // #49: "auto" (or unset) means no real policy page exists on this site — link
  // off-site to nothing (that is exactly the 404 this issue was opened over).
  // Open the widget's own generated notice instead.
  if (isAutoPolicy(policyUrl)) {
    a.href = "#";
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (onOpenPolicy) onOpenPolicy();
    });
  } else {
    a.href = policyUrl;
  }
  a.textContent = t.policyLink;
  p.appendChild(a);
  card.appendChild(p);

  const actions = document.createElement("div");
  actions.className = "blakfy-actions";

  const btnReject = document.createElement("button");
  btnReject.className = "blakfy-btn";
  btnReject.setAttribute("data-act", "reject");
  btnReject.textContent = t.rejectAll;
  btnReject.addEventListener("click", () => {
    if (onReject) onReject();
  });
  actions.appendChild(btnReject);

  const btnPrefs = document.createElement("button");
  btnPrefs.className = "blakfy-btn";
  btnPrefs.setAttribute("data-act", "prefs");
  btnPrefs.textContent = t.preferences;
  btnPrefs.addEventListener("click", () => {
    if (onPrefs) onPrefs();
  });
  actions.appendChild(btnPrefs);

  const btnAccept = document.createElement("button");
  btnAccept.className = "blakfy-btn blakfy-btn-primary";
  btnAccept.setAttribute("data-act", "accept");
  btnAccept.textContent = t.acceptAll;
  btnAccept.addEventListener("click", () => {
    if (onAccept) onAccept();
  });
  actions.appendChild(btnAccept);

  card.appendChild(actions);

  const badgeSlot = document.createElement("div");
  badgeSlot.className = "blakfy-badge-slot";
  card.appendChild(badgeSlot);

  return card;
};
