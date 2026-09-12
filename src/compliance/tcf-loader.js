// blakfy-cookie/src/compliance/tcf-loader.js — on-demand loader for the TCF v2.2 chunk (#30 item 1)
//
// TCF v2.2 is opt-in only (data-blakfy-tcf="true", default "false" — most Blakfy client sites
// never turn it on; it is an RTB/programmatic-ads surface, not a general consent requirement).
// Rather than pay ~2.4KB gzip in every visitor's main bundle for a feature almost nobody uses,
// the actual encoder/CMP-API code ships as a separate dist/tcf-v2.min.js chunk (same
// script-injection pattern as the remote i18n locale chunks, #38) and is fetched only by the
// sites that ask for it, as a sibling of the main bundle's own <script src>.
//
// Loaded once per page via window.__blakfyTCF; never rejects — any failure (no baseHref,
// network error, parse error) resolves to null so a broken/blocked CDN never stalls bootstrap
// or leaves TCF half-installed (see #43's loud-failure pattern for how the failure itself is
// still reported).

let inflight = null;

const cached = () => (typeof window !== "undefined" ? window.__blakfyTCF || null : null);

export const loadTCF = (baseHref) => {
  const existing = cached();
  if (existing) return Promise.resolve(existing);
  if (!baseHref || typeof document === "undefined") return Promise.resolve(null);
  if (inflight) return inflight;

  inflight = new Promise((resolvePromise) => {
    const base = baseHref.replace(/\/[^/]*$/, "/");
    const script = document.createElement("script");
    script.src = base + "tcf-v2.min.js";
    script.async = true;
    const finish = () => resolvePromise(cached());
    script.onload = finish;
    script.onerror = () => {
      // #43-style loud failure: TCF was requested but the chunk could not be fetched.
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[blakfy-cookie] TCF v2.2 chunk failed to load from " + script.src);
      }
      resolvePromise(null);
    };
    document.head.appendChild(script);
  }).finally(() => {
    inflight = null;
  });

  return inflight;
};
