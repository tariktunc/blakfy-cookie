// blakfy-cookie/src/ui/styles.js — idempotent stylesheet injection for banner, modal, badge, status
// Layout architecture is locked — only --blakfy-accent is overridable

const STYLE_ID = "blakfy-cookie-styles";

const RULES = [
  "/* Layout architecture is locked — only --blakfy-accent is overridable */",
  // Modal mode (centered, dimmed backdrop)
  ".blakfy-overlay.modal{position:fixed !important;inset:0;background:rgba(0,0,0,.4);z-index:2147483646 !important;display:flex !important;align-items:center;justify-content:center;padding:16px}",
  // Widget mode (transparent, no backdrop)
  ".blakfy-overlay.widget{position:fixed !important;inset:auto;background:transparent;padding:0;display:block !important;z-index:2147483646 !important;pointer-events:none}",
  ".blakfy-overlay.widget .blakfy-card{width:min(96vw,1100px);max-width:none;border-radius:8px;position:relative;pointer-events:auto;padding-bottom:40px}",
  // Widget butonları kart genişliğine eşit dağılımlı
  ".blakfy-overlay.widget .blakfy-actions{flex-wrap:nowrap}",
  ".blakfy-overlay.widget .blakfy-actions .blakfy-btn{flex:1;min-width:0}",
  // Position modifiers (widget)
  ".blakfy-overlay.widget.bottom-center{bottom:16px;left:50%;right:auto;top:auto;transform:translateX(-50%)}",
  ".blakfy-overlay.widget.bottom-right{bottom:16px;right:16px;left:auto;top:auto}",
  ".blakfy-overlay.widget.bottom-left{bottom:16px;left:16px;right:auto;top:auto}",
  ".blakfy-overlay.widget.top-center{top:16px;left:50%;right:auto;bottom:auto;transform:translateX(-50%)}",
  ".blakfy-overlay.widget.top-right{top:16px;right:16px;left:auto;bottom:auto}",
  ".blakfy-overlay.widget.top-left{top:16px;left:16px;right:auto;bottom:auto}",
  ".blakfy-overlay.widget.center{top:50%;left:50%;right:auto;bottom:auto;transform:translate(-50%,-50%)}",
  // Card base (shared by banner + modal)
  ".blakfy-card{background:#fff;color:#222;border-radius:16px;max-width:560px;width:100%;padding:24px;border:3px solid var(--blakfy-accent,#3E5C3A);font-family:system-ui,-apple-system,sans-serif;line-height:1.5;position:relative}",
  ".blakfy-card[dir=rtl]{text-align:right}",
  ".blakfy-card h2{margin:0 0 8px;font-size:18px;font-weight:600}",
  ".blakfy-card p{margin:0 0 16px;font-size:14px;color:#444}",
  ".blakfy-card a{color:var(--blakfy-accent,#3E5C3A);text-decoration:underline}",
  // Actions
  ".blakfy-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}",
  // Buttons (3px radius per spec)
  ".blakfy-btn{flex:1;min-width:120px;min-height:44px;padding:12px 16px;border:1px solid #ddd;border-radius:3px;background:#fff;color:#222;font-size:14px;font-weight:500;cursor:pointer;transition:transform .1s,background .15s}",
  ".blakfy-btn:hover{transform:translateY(-1px)}",
  ".blakfy-btn-primary{background:var(--blakfy-accent,#3E5C3A);color:#fff;border-color:transparent}",
  ".blakfy-cat{padding:12px 0;border-top:1px solid #eee;display:flex;align-items:flex-start;gap:12px}",
  ".blakfy-cat:first-of-type{border-top:none}",
  ".blakfy-cat-text{flex:1}",
  ".blakfy-cat-text strong{display:block;font-size:14px;margin-bottom:2px}",
  ".blakfy-cat-text span{font-size:13px;color:#666}",
  // Switches (pill-shaped — UX standard)
  ".blakfy-switch{flex-shrink:0;width:44px;height:24px;border-radius:999px;background:#ccc;position:relative;cursor:pointer;border:none;padding:0}",
  ".blakfy-switch[aria-checked=true]{background:var(--blakfy-accent,#3E5C3A)}",
  ".blakfy-switch::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}",
  ".blakfy-switch[aria-checked=true]::after{transform:translateX(20px)}",
  ".blakfy-switch:disabled{opacity:.6;cursor:not-allowed}",
  ".blakfy-close{position:absolute;top:12px;right:12px;background:none;border:none;font-size:20px;cursor:pointer;color:#666;width:32px;height:32px;border-radius:50%}",
  ".blakfy-close:hover{background:#f3f3f3}",
  "[dir=rtl] .blakfy-close{right:auto;left:12px}",
  ".blakfy-badge{position:absolute;bottom:8px;right:12px;font-size:11px;opacity:0.6;transition:opacity 0.2s;display:flex !important;pointer-events:auto !important;align-items:center;gap:4px;color:#666;text-decoration:none}",
  ".blakfy-badge:hover{opacity:1}",
  "[dir=rtl] .blakfy-badge{right:auto;left:12px}",
  ".blakfy-status{position:fixed;bottom:0;left:0;right:0;z-index:2147483645;display:flex;align-items:center;gap:12px;padding:10px 20px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.5}",
  ".blakfy-status-msg{flex:1}",
  ".blakfy-status-dismiss{background:none;border:none;color:inherit;cursor:pointer;padding:4px 10px;border-radius:6px;font-size:16px;opacity:.8;line-height:1}",
  ".blakfy-status-dismiss:hover{opacity:1;background:rgba(255,255,255,.2)}",
  "@media (prefers-reduced-motion:reduce){.blakfy-btn,.blakfy-switch::after{transition:none}}",
  // Responsive
  "@media (max-width:1024px){.blakfy-card{max-width:440px}}",
  "@media (max-width:768px){.blakfy-card{max-width:calc(100vw - 32px);padding:18px}.blakfy-card h2{font-size:16px}.blakfy-card p{font-size:13px}.blakfy-btn{flex:1 1 100%;min-height:44px;padding:10px 14px;font-size:13px}.blakfy-overlay.widget.bottom-center,.blakfy-overlay.widget.top-center{left:16px;right:16px;transform:none}.blakfy-overlay.widget .blakfy-card{width:100%}.blakfy-overlay.widget .blakfy-actions .blakfy-btn{flex:1 1 100%;min-width:0}}",
  "@media (max-width:480px){.blakfy-overlay.widget .blakfy-card{width:100%;max-width:calc(100vw - 32px)}}",
];

export const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const css = document.createElement("style");
  css.id = STYLE_ID;
  css.textContent = RULES.join("");
  document.head.appendChild(css);
};
