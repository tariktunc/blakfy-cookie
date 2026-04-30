# Blakfy Cookie — Next.js 15 Example

Minimal Next.js 15 App Router app demonstrating `@blakfy/cookie-next@2`:

- `BlakfyCookieProvider` wires the widget into the layout (no FOUC, `next/script` `beforeInteractive`)
- `ConsentModeDefault` sets gtag/uetq/ym defaults to `denied` before any third-party tag loads
- `useBlakfyConsent` for reactive consent state + imperative API
- `useGating("marketing")` to conditionally render a YouTube iframe
- A tag-gated `<Script type="text/plain" data-blakfy-category="analytics">`
- A `/cerez-politikasi` placeholder cookie policy page

## Run

```bash
cd examples/nextjs
npm install
npm run dev
```

Open http://localhost:3000.

## Files

| Path | Purpose |
|---|---|
| `app/layout.tsx` | Root layout — provider + bootstrap |
| `app/page.tsx` | Demo homepage with all hooks/gating examples |
| `app/cerez-politikasi/page.tsx` | Placeholder cookie policy page |
| `package.json` | Workspace deps (`@blakfy/cookie-next: workspace:*`) |
| `tsconfig.json` | Standard Next 15 strict config |
| `next.config.mjs` | Standard config |

## Notes

- The widget itself loads from jsDelivr (`cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@v2/dist/cookie.min.js`) at runtime via `next/script`. No bundling of the vanilla script needed.
- For SSR-deployed sites with ad networks, set `tcf={true}` and obtain a CMP ID via IAB Europe certification (see `TCF-CERTIFICATION.md`).
- Replace the placeholder cookie policy text with a full KVKK + GDPR compliant statement before going live.
