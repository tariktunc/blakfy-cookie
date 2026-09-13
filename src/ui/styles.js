// blakfy-cookie/src/ui/styles.js — idempotent stylesheet injection for banner, modal, badge, status
// Layout architecture is locked — only --blakfy-accent is overridable

const STYLE_ID = "blakfy-cookie-styles";

const RULES = [
  "/* Layout architecture is locked — only --blakfy-accent is overridable */",
  // Modal mode (centered, dimmed backdrop)
  ".blakfy-overlay.modal{position:fixed !important;inset:0;background:rgba(0,0,0,.4);z-index:2147483646 !important;display:flex !important;align-items:center;justify-content:center;padding:16px}",
  // #57: on a short viewport (<500px tall) the card had no max-height/overflow, so it
  // overflowed both above and below the visible area with no way to scroll to the
  // header/close button or the accept/save actions — a dead end for anyone without a
  // physical Escape key. Capping height to the overlay's own padded viewport and
  // scrolling the card's own content keeps both ends reachable.
  ".blakfy-overlay.modal .blakfy-card{max-height:calc(100vh - 32px);overflow-y:auto}",
  // Widget mode (transparent, no backdrop)
  ".blakfy-overlay.widget{position:fixed !important;inset:auto;background:transparent;padding:0;display:block !important;z-index:2147483646 !important;pointer-events:none}",
  ".blakfy-overlay.widget .blakfy-card{width:min(96vw,1100px);max-width:none;border-radius:8px;position:relative;pointer-events:auto;padding-bottom:40px;box-sizing:border-box}",
  // Widget butonları kart genişliğine eşit dağılımlı
  ".blakfy-overlay.widget .blakfy-actions{flex-wrap:nowrap}",
  ".blakfy-overlay.widget .blakfy-actions .blakfy-btn{flex:1;min-width:0;min-height:36px;padding:8px 16px}",
  // Position modifiers (widget) — offset uses --blakfy-margin (default 16px, min 5px enforced in JS)
  ".blakfy-overlay.widget.bottom-center{bottom:var(--blakfy-margin,16px);left:50%;right:auto;top:auto;transform:translateX(-50%)}",
  ".blakfy-overlay.widget.bottom-right{bottom:var(--blakfy-margin,16px);right:var(--blakfy-margin,16px);left:auto;top:auto}",
  ".blakfy-overlay.widget.bottom-left{bottom:var(--blakfy-margin,16px);left:var(--blakfy-margin,16px);right:auto;top:auto}",
  ".blakfy-overlay.widget.top-center{top:var(--blakfy-margin,16px);left:50%;right:auto;bottom:auto;transform:translateX(-50%)}",
  ".blakfy-overlay.widget.top-right{top:var(--blakfy-margin,16px);right:var(--blakfy-margin,16px);left:auto;bottom:auto}",
  ".blakfy-overlay.widget.top-left{top:var(--blakfy-margin,16px);left:var(--blakfy-margin,16px);right:auto;bottom:auto}",
  ".blakfy-overlay.widget.center{top:50%;left:50%;right:auto;bottom:auto;transform:translate(-50%,-50%)}",
  // Card base (shared by banner + modal)
  // Bottom padding is wider than the rest — the "Powered by Blakfy Studio" badge is
  // absolutely positioned at bottom:8px/right:12px inside this card (see badge.js),
  // and without this reserved strip the last action button (often the rightmost —
  // Accept All) sits directly under it. This used to be reserved only in widget mode
  // (".blakfy-overlay.widget .blakfy-card"); the preferences MODAL had no such
  // reservation, so the badge overlapped its Accept/Save buttons every time.
  ".blakfy-card{box-sizing:border-box;background:#fff;color:#222;border-radius:16px;max-width:560px;width:100%;padding:24px 24px 40px;border:3px solid var(--blakfy-accent,#6b7280);font-family:system-ui,-apple-system,sans-serif;line-height:1.5;position:relative}",
  ".blakfy-card[dir=rtl]{text-align:right}",
  ".blakfy-card h2{margin:0 0 8px;font-size:18px;font-weight:600}",
  ".blakfy-card p{margin:0 0 16px;font-size:14px;color:#444}",
  ".blakfy-card a{color:var(--blakfy-accent,#6b7280);text-decoration:underline}",
  // Actions
  ".blakfy-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}",
  // Buttons (3px radius per spec)
  ".blakfy-btn{flex:1;min-width:120px;min-height:44px;padding:12px 16px;border:1px solid #ddd;border-radius:3px;background:#fff;color:#222;font-size:14px;font-weight:500;cursor:pointer;transition:transform .1s,background .15s}",
  ".blakfy-btn:hover{transform:translateY(-1px)}",
  ".blakfy-btn-primary{background:var(--blakfy-accent,#6b7280);color:#fff;border-color:transparent}",
  ".blakfy-cat{padding:12px 0;border-top:1px solid #eee;display:flex;align-items:flex-start;gap:12px}",
  ".blakfy-cat:first-of-type{border-top:none}",
  ".blakfy-cat-text{flex:1}",
  ".blakfy-cat-text strong{display:block;font-size:14px;margin-bottom:2px}",
  ".blakfy-cat-text span{font-size:13px;color:#666}",
  // Switches (pill-shaped — UX standard)
  ".blakfy-switch{flex-shrink:0;width:44px;height:24px;border-radius:999px;background:#ccc;position:relative;cursor:pointer;border:none;padding:0}",
  ".blakfy-switch[aria-checked=true]{background:var(--blakfy-accent,#6b7280)}",
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
  "@media (max-width:768px){.blakfy-card{max-width:calc(100vw - 2 * var(--blakfy-margin,16px));padding:18px 18px 40px}.blakfy-card h2{font-size:16px}.blakfy-card p{font-size:13px}.blakfy-btn{flex:1 1 100%;min-height:44px;padding:10px 14px;font-size:13px}.blakfy-overlay.widget.bottom-center,.blakfy-overlay.widget.top-center{left:var(--blakfy-margin,16px);right:var(--blakfy-margin,16px);transform:none}.blakfy-overlay.widget .blakfy-card{width:100%}.blakfy-overlay.widget .blakfy-actions .blakfy-btn{flex:1 1 100%;min-width:0}}",
  "@media (max-width:480px){.blakfy-overlay.widget .blakfy-card{width:100%;max-width:calc(100vw - 2 * var(--blakfy-margin,16px))}}",
  // Tab bar
  ".blakfy-tabs{display:flex;border-bottom:2px solid #eee;margin:12px 0 16px;gap:0}",
  ".blakfy-tab-btn{flex:1;background:none;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;padding:8px 10px;font-size:13px;font-weight:500;color:#666;cursor:pointer;transition:color .15s,border-color .15s;white-space:nowrap;font-family:inherit}",
  ".blakfy-tab-btn:hover{color:#222}",
  ".blakfy-tab-btn--active{color:var(--blakfy-accent,#6b7280);border-bottom-color:var(--blakfy-accent,#6b7280);font-weight:600}",
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
  ".blakfy-service-links a{font-size:12px;color:var(--blakfy-accent,#6b7280);text-decoration:underline}",
  ".blakfy-svc-empty{font-size:13px;color:#888;padding:16px 0}",
  // Cookie transparency panel (#39)
  ".blakfy-cookie-caveat{font-size:11px;color:#888;line-height:1.5;margin:0 0 12px;padding:8px 10px;background:#f7f7f7;border-radius:6px}",
  ".blakfy-cookie-list{display:flex;flex-direction:column;gap:6px;max-height:360px;overflow-y:auto;padding-right:2px}",
  ".blakfy-cookie-row{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #eee;border-radius:6px}",
  ".blakfy-cookie-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}",
  ".blakfy-cookie-name{font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#222;word-break:break-all}",
  ".blakfy-cookie-meta{font-size:11px;color:#888}",
  ".blakfy-cookie-unrecognised{color:#b45309}",
  ".blakfy-cookie-essential{font-size:11px;color:#888;white-space:nowrap}",
  ".blakfy-cookie-delete{font-size:11px;padding:4px 10px;white-space:nowrap}",
  // About panel
  ".blakfy-about-panel{padding:4px 0}",
  ".blakfy-about-brand{display:flex;align-items:center;gap:8px;margin-bottom:14px}",
  ".blakfy-about-brand strong{font-size:15px;color:#222}",
  ".blakfy-about-panel p{font-size:13px;color:#555;margin:0 0 10px;line-height:1.6}",
  ".blakfy-about-panel a{font-size:13px;color:var(--blakfy-accent,#6b7280);text-decoration:underline}",
  ".blakfy-about-meta{font-size:12px;color:#aaa;margin-top:12px}",
  "@media (max-width:480px){.blakfy-tab-btn{font-size:12px;padding:8px 6px}.blakfy-service-list{max-height:260px}}",
  // ── Themes: gray ──────────────────────────────────────────────────────────
  ".blakfy-card[data-blakfy-theme=gray]{background:#f0f0f0}",
  ".blakfy-card[data-blakfy-theme=gray] .blakfy-btn{background:#e4e4e4;border-color:#ccc}",
  ".blakfy-card[data-blakfy-theme=gray] .blakfy-service-card-header{background:#e8e8e8}",
  ".blakfy-card[data-blakfy-theme=gray] .blakfy-service-card-header:hover{background:#ddd}",
  // ── Themes: dark ──────────────────────────────────────────────────────────
  ".blakfy-card[data-blakfy-theme=dark]{background:#1a1a1a;color:#f0f0f0;border-color:var(--blakfy-accent,#6b7280)}",
  ".blakfy-card[data-blakfy-theme=dark] p{color:#aaa}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cat-text span{color:#999}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cat{border-top-color:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-btn{background:#2a2a2a;color:#f0f0f0;border-color:#444}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-btn:hover{background:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-switch{background:#444}",
  // #59: this rule's specificity (2 classes+attribute) beats the base
  // `.blakfy-switch[aria-checked=true]` rule above (1 class+attribute) and comes
  // later in the sheet, so a checked switch in dark theme always fell back to
  // #444 instead of the accent colour. Re-declaring checked state here, scoped to
  // dark theme, restores it without touching the light-theme rule.
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-switch[aria-checked=true]{background:var(--blakfy-accent,#6b7280)}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-close{color:#aaa}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-close:hover{background:#2a2a2a}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-tabs{border-bottom-color:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn{color:#888}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn:hover{color:#f0f0f0}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-tab-btn--active{color:var(--blakfy-accent,#6b7280);border-bottom-color:var(--blakfy-accent,#6b7280)}",
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
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-caveat{background:#252525;color:#999}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-row{border-color:#333}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-name{color:#f0f0f0}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-meta{color:#999}",
  ".blakfy-card[data-blakfy-theme=dark] .blakfy-cookie-essential{color:#999}",
  // ── Reopen FAB (#34) — token API, see docs in src/ui/fab.js ────────────────
  // #35: declared on :host (the shadow root's own element), not :root — a shadow-scoped
  // stylesheet's :root never matches the document, only the shadow tree. --blakfy-accent
  // and any --blakfy-fab-* override a site sets on ITS OWN :root still inherit in across
  // the shadow boundary (custom properties are inheritable), so a site override always
  // wins; these are only the widget's own defaults.
  ":host,:root{--blakfy-fab-side:left;--blakfy-fab-offset-x:20px;--blakfy-fab-offset-y:20px;--blakfy-fab-z:2147483640;--blakfy-fab-size:40px;--blakfy-fab-target:44px;--blakfy-fab-icon-size:20px;--blakfy-fab-bg:var(--blakfy-accent,#6b7280);--blakfy-fab-color:#fff;--blakfy-fab-radius:50%;--blakfy-fab-shadow:0 2px 8px rgb(0 0 0 / 0.18);--blakfy-fab-opacity:0.55;--blakfy-fab-opacity-hover:1}",
  ".blakfy-fab{position:fixed;z-index:var(--blakfy-fab-z);width:var(--blakfy-fab-target);height:var(--blakfy-fab-target);display:flex;align-items:center;justify-content:center;padding:0;border:none;cursor:pointer;background:transparent;bottom:calc(var(--blakfy-fab-offset-y) + env(safe-area-inset-bottom,0px))}",
  ".blakfy-fab::before{content:'';position:absolute;width:var(--blakfy-fab-size);height:var(--blakfy-fab-size);border-radius:var(--blakfy-fab-radius);background:var(--blakfy-fab-bg);box-shadow:var(--blakfy-fab-shadow);opacity:var(--blakfy-fab-opacity);transition:opacity .15s}",
  ".blakfy-fab:hover::before,.blakfy-fab:focus-visible::before{opacity:var(--blakfy-fab-opacity-hover)}",
  ".blakfy-fab svg{position:relative;color:var(--blakfy-fab-color);pointer-events:none}",
  ".blakfy-fab:focus-visible{outline:2px solid var(--blakfy-fab-bg);outline-offset:2px}",
  ".blakfy-fab--left{left:calc(var(--blakfy-fab-offset-x) + env(safe-area-inset-left,0px))}",
  ".blakfy-fab--right{right:calc(var(--blakfy-fab-offset-x) + env(safe-area-inset-right,0px))}",
  "[dir=rtl] .blakfy-fab--left{left:auto;right:calc(var(--blakfy-fab-offset-x) + env(safe-area-inset-right,0px))}",
  "[dir=rtl] .blakfy-fab--right{right:auto;left:calc(var(--blakfy-fab-offset-x) + env(safe-area-inset-left,0px))}",
  "@media (prefers-reduced-motion:reduce){.blakfy-fab::before{transition:none}}",
  "@media (max-width:640px){:root{--blakfy-fab-offset-x:12px;--blakfy-fab-offset-y:12px;--blakfy-fab-size:36px}}",
];

// #35: `root` is the shadow root (or its light-DOM fallback) the widget mounts into —
// pass it so the stylesheet lives inside the isolation boundary instead of leaking
// into/out of the host document via document.head. Falls back to document.head when
// no root is given (keeps this module usable standalone, e.g. in older tests).
export const injectStyles = (root) => {
  const target = root || (typeof document !== "undefined" ? document.head : null);
  if (!target || target.querySelector("#" + STYLE_ID)) return;
  const css = document.createElement("style");
  css.id = STYLE_ID;
  css.textContent = RULES.join("");
  target.appendChild(css);
};
