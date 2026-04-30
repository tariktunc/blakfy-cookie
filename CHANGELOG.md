# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/) and SemVer.

---

## [2.0.0] — Unreleased

### Architecture
- **Modular source tree** under `src/` — split monolithic `cookie.js` into `core/`, `compliance/`, `i18n/`, `ui/`, `gating/`, `presets/`, `geo/`.
- **Build pipeline** with esbuild — produces `dist/cookie.min.js`, `dist/cookie-defaults.min.js`, and tsup-built `cookie-next` package.
- **Bundle size budget** — core ≤ 22 KB minified+gzip, enforced in CI.

### Compliance (NEW)
- Microsoft UET Consent Mode (Bing Ads, Clarity)
- Yandex Metrica consent + Webvisor as separate `recording` category
- IAB TCF v2.2 — `__tcfapi` global, TC string encoding, vendor list (preview mode until CMP ID assigned)
- CCPA / CPRA — opt-out mode, USP string, "Do Not Sell" footer link, GPC respect
- GPC (Global Privacy Control) — `navigator.globalPrivacyControl` auto-deny
- DNT (Do Not Track) — opt-in respect mode
- Jurisdiction detection (`GDPR` / `CCPA` / `LGPD` / `default`)

### Tag-Gating (NEW)
- `<script type="text/plain" data-blakfy-category="...">` automatic activation
- `<iframe data-blakfy-src="..." data-blakfy-category="...">` placeholder UI
- MutationObserver for SPA / dynamically added tags
- Cookie & localStorage cleanup on consent withdrawal

### Presets (NEW — 18 tools)
- Google: Analytics 4, Tag Manager, Maps, reCAPTCHA
- Meta: Facebook Pixel
- Video: YouTube, Vimeo
- Analytics: Hotjar, Microsoft Clarity, LinkedIn Insight, Yandex Metrica
- Ads: Bing Ads (UET), TikTok Pixel, Pinterest Tag
- Chat/CRM: Tawk.to, Intercom, HubSpot, Mailchimp

### Public API Additions
- `BlakfyCookie.onConsent(category, fn)` — category-specific callback
- `BlakfyCookie.registerCleanup({ category, cookies, storage })`
- `BlakfyCookie.unblock(category)`
- `BlakfyCookie.scan()` — re-scan DOM after SPA navigation
- `BlakfyCookie.usePreset(name)`
- `BlakfyCookie.tcf.getTCString()`
- `BlakfyCookie.ccpa.optOut()` / `isOptedOut()`
- `BlakfyCookie.getJurisdiction()`
- `window.__tcfapi(...)` IAB standard

### Branding
- "Powered by Blakfy Studio" badge — bottom-right, **non-removable**, anti-tampering protected (CSS `!important` + MutationObserver re-injection + code-baked HTML).

### Security & Privacy Fixes
- `makeHash()` device fingerprint **removed** → replaced with `crypto.randomUUID()` anonymous ID.
- `renderStatus` innerHTML XSS vector → `textContent` + DOM construction.
- Consent cookie `SameSite=Lax` → `SameSite=Strict`.
- status.json fetch `@latest` → version-pinned `@2`.

### Bug Fixes
- **Re-consent storm fix:** v1 triggered re-consent on every `cookie.js` version bump (`cookie.js:494`). Now only `data-blakfy-version` (policy version) triggers re-consent.
- TypeScript `BlakfyLocale` type expanded from 9 to 23 locales.
- Next.js `BlakfyCookieProvider` now uses `next/script` `beforeInteractive` (no more FOUC).
- `useBlakfyConsent` polling removed — event-driven now.

### Documentation
- AI-readable README with copy-paste install, scenario coverage (vanilla / Next.js / WordPress / GTM), full attribute & API tables.
- `ARCHITECTURE.md`, `COMPLIANCE.md`, `TCF-CERTIFICATION.md`, `MIGRATION.md`.
- Real `examples/nextjs/` Next 15 app.

### Breaking Changes
- None at API level — v1 contracts preserved.
- `cookie.js` location: `https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@1/cookie.js` → `@2/dist/cookie.min.js`. v1 users unaffected; opt into `@2` for new features.

---

## [1.2.0] — 2026-04-30 (legacy)

- Status bar via central `status.json` (CDN-hosted)
- BCP47 locale detection (`zh-TW`, `pt-BR` etc.)
- 23 languages

## [1.0.0] — 2026-04-25

- Initial release: Google Consent Mode v2, KVKK + GDPR + ePrivacy, 9 languages, vanilla JS, Next.js wrapper.
