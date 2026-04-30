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
  ".blakfy-overlay.widget .blakfy-actions .blakfy-btn{flex:1;min-width:0;min-height:36px;padding:8px 16px}",
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
  // Tab bar
  ".blakfy-tabs{display:flex;border-bottom:2px solid #eee;margin:12px 0 16px;gap:0}",
  ".blakfy-tab-btn{flex:1;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;padding:8px 10px;font-size:13px;font-weight:500;color:#666;cursor:pointer;transition:color .15s,border-color .15s;white-space:nowrap;font-family:inherit}",
  ".blakfy-tab-btn:hover{color:#222}",
  ".blakfy-tab-btn--active{color:var(--blakfy-accent,#3E5C3A);border-bottom-color:var(--blakfy-accent,#3E5C3A);font-weight:600}",
  // Tab panels
  ".blakfy-tab-panel[aria-hidden=true]{display:none}",
  ".blakfy-tab-panel[aria-hidden=false]{display:block}",
  // Service list + cards
  ".blakfy-service-list{display:flex;flex-direction:column;gap:8px;max-height:420px;overflow-y:auto;padding-right:2px}",
  ".blakfy-service-card{border:1px solid #eee;border-radius:6px;overflow:hidden}",
  ".blakfy-service-card-header{display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;background:#fafafa;user-select:none}",
  ".blakfy-service-card-header:hover{background:#f3f3f3}",
  ".blakfy-service-name{flex:1;font-size:13px;font-weight:600;color:#222}",
  ".blakfy-service-cat{font-size:11px;padding:2px 8px;border-radius:999px;background:#eee;color:#555;text-transform:capitalize}",
  ".blakfy-service-toggle{font-size:11px;color:#aaa;line-height:1}",
  ".blakfy-service-body[aria-hidden=true]{display:none}",
  ".blakfy-service-body[aria-hidden=false]{display:block;padding:12px;border-top:1px solid #eee}",
  ".blakfy-service-dl{margin:0 0 10px;display:grid;grid-template-columns:auto 1fr;gap:4px 12px}",
  ".blakfy-service-dt{font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}",
  ".blakfy-service-dd{margin:0;font-size:12px;color:#444;word-break:break-word}",
  ".blakfy-service-links{display:flex;gap:12px;margin-top:8px;flex-wrap:wrap}",
  ".blakfy-service-links a{font-size:12px;color:var(--blakfy-accent,#3E5C3A);text-decoration:underline}",
  ".blakfy-svc-empty{font-size:13px;color:#888;padding:16px 0}",
  // About panel
  ".blakfy-about-panel{padding:4px 0}",
  ".blakfy-about-brand{display:flex;align-items:center;gap:8px;margin-bottom:14px}",
  ".blakfy-about-brand strong{font-size:15px;color:#222}",
  ".blakfy-about-panel p{font-size:13px;color:#555;margin:0 0 10px;line-height:1.6}",
  ".blakfy-about-panel a{font-size:13px;color:var(--blakfy-accent,#3E5C3A);text-decoration:underline}",
  ".blakfy-about-meta{font-size:12px;color:#aaa;margin-top:12px}",
  "@media (max-width:480px){.blakfy-tab-btn{font-size:12px;padding:8px 6px}.blakfy-service-list{max-height:260px}}",
  // ── Themes: gray ──────────────────────────────────────────────────────────
  ".blakfy-card[data-blakfy-theme=gray]{background:#f0f0f0}",
  ".blakfy-card[data-blakfy-theme=gray] .blakfy-btn{background:#e4e4e4;border-color:#ccc}",
  ".blakfy-card[data-blakfy-theme=gray] .blakfy-service-card-header{background:#e8e8e8}",
  ".blakfy-card[data-blakfy-theme=gray] .blakfy-service-card-header:hover{background:#ddd}",
  // ── Themes: dark ──────────────────────────────────────────────────────────
  ".blakfy-card[data-blakfy-theme=dark]{background:#1a1a1a;color:#f0f0f0;border-color:var(--blakfy-accent,#3E5C3A)}",
  ".blakfy-card[data-blakfy-theme=dark] p{color:#aaa}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cat-text span{color:#999}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cat{border-top-color:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-btn{background:#2a2a2a;color:#f0f0f0;border-color:#444}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-btn:hover{background:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-switch{background:#444}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-close{color:#aaa}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-close:hover{background:#2a2a2a}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-tabs{border-bottom-color:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn{color:#888}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn:hover{color:#f0f0f0}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn--active{color:var(--blakfy-accent,#3E5C3A);border-bottom-color:var(--blakfy-accent,#3E5C3A)}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-card{border-color:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-card-header{background:#252525}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-card-header:hover{background:#2e2e2e}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-body[aria-hidden=false]{border-top-color:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-dt{color:#777}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-dd{color:#ccc}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-name{color:#f0f0f0}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-service-cat{background:#333;color:#aaa}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-badge{color:#777}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-about-brand strong{color:#f0f0f0}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-about-panel p{color:#aaa}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-about-meta{color:#666}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-svc-empty{color:#666}",
];

export const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const css = document.createElement("style");
  css.id = STYLE_ID;
  css.textContent = RULES.join("");
  document.head.appendChild(css);
};
