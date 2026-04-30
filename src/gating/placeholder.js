// blakfy-cookie/src/gating/placeholder.js — standalone consent-required iframe placeholder UI

const fmt = (tpl, vars) => {
  if (!tpl) return "";
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : "{" + k + "}"));
};

export const createPlaceholder = ({ category, srcUrl, t, onAccept }) => {
  const ph = (t && t.placeholder) || {};
  const titleText = ph.title || "Content blocked";
  const descText = fmt(ph.desc || "Allow {category} cookies to view this content.", { category: category || "" });
  const ctaText = ph.cta || "Allow";

  const wrap = document.createElement("div");
  wrap.className = "blakfy-placeholder";
  wrap.setAttribute("role", "region");
  wrap.setAttribute("aria-label", titleText);
  wrap.style.cssText = [
    "box-sizing:border-box",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    "justify-content:center",
    "gap:12px",
    "padding:24px",
    "min-height:200px",
    "width:100%",
    "border:1px solid #d0d7de",
    "border-radius:12px",
    "background:#f6f8fa",
    "color:#1f2328",
    "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
    "font-size:14px",
    "line-height:1.5",
    "text-align:center"
  ].join(";");

  const icon = document.createElement("div");
  icon.setAttribute("aria-hidden", "true");
  icon.style.cssText = "font-size:28px;line-height:1";
  icon.textContent = "🔒";
  wrap.appendChild(icon);

  const title = document.createElement("div");
  title.style.cssText = "font-weight:600;font-size:16px;color:#1f2328";
  title.textContent = titleText;
  wrap.appendChild(title);

  const desc = document.createElement("div");
  desc.style.cssText = "max-width:420px;color:#57606a";
  desc.textContent = descText;
  wrap.appendChild(desc);

  if (srcUrl) {
    const host = document.createElement("div");
    host.style.cssText = "font-size:12px;color:#8c959f;word-break:break-all";
    try {
      const u = new URL(srcUrl);
      host.textContent = u.hostname;
    } catch (e) {
      host.textContent = srcUrl;
    }
    wrap.appendChild(host);
  }

  const cta = document.createElement("button");
  cta.type = "button";
  cta.className = "blakfy-placeholder-cta";
  cta.textContent = ctaText;
  cta.style.cssText = [
    "appearance:none",
    "border:0",
    "border-radius:8px",
    "padding:10px 18px",
    "background:#1f6feb",
    "color:#ffffff",
    "font-weight:600",
    "font-size:14px",
    "cursor:pointer",
    "margin-top:4px"
  ].join(";");
  cta.addEventListener("click", () => {
    if (typeof onAccept === "function") {
      try { onAccept(category); } catch (e) { /* swallow */ }
    }
  });
  wrap.appendChild(cta);

  return wrap;
};
