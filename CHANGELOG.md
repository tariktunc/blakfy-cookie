# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/) and SemVer.

---

## [2.3.0] — 2026-05-09

### Added

- **Site theme bridge** (`src/ui/theme-bridge.js`) — `theme="auto"` artık host site'ın class/data-theme sözleşmesini okur ve değişiklikleri canlı izler. Site light moddayken widget light, dark moddayken dark. Eskiden sadece OS-level `prefers-color-scheme` okunuyordu — artık çoklu sinyal zinciri:
  1. `<html class="dark">` veya `<html class="light">` ← WebForge canonical (Tailwind class strategy)
  2. `<body class>` aynı sinyaller (yedek)
  3. `<html data-theme>` ← uyumluluk (DaisyUI, shadcn-style)
  4. `<html data-mode>` ← legacy uyumluluk
  5. `<body>` arka plan luminance heuristik
  6. `prefers-color-scheme` ← son çare OS-level
- **MutationObserver tabanlı tema senkronu** — Site tema toggle'ı çevrilince widget 50ms içinde uyum sağlar (debounce'lu, jank-free).
- **Theme bridge testleri** (`tests/ui/theme-bridge.test.js`) — 20 test: detect priority chain, watch/dispose, debounce, applyThemeToCard idempotency.

### Changed

- **`@blakfy/cookie-next` `BlakfyCookieProvider`** — Explicit defaults: `position="bottom-center"`, `theme="auto"`. Eskiden default'lar Provider'da yoktu; vanilla `DEFAULTS` yedeğine düşüyordu. Şimdi React component davranışı öngörülebilir.
- **`config.position` doğrulama** — Geçersiz veya boş `data-blakfy-position` artık `bottom-center`'a düşürülür (eskiden `bottom-right` yedeğine düşüyordu — tutarsızdı).
- **Explicit `theme="light"` veya `theme="dark"`** — Bridge devre dışı bırakılır, kullanıcı seçimi kilitli kalır (kaçış kapısı).

### Fixed

- **Light tema sitelerde widget'ın dark görünmesi sorunu** — Kullanıcının OS'u dark mode'da olduğunda widget zorla dark renderlanıyor, site içeriğiyle çelişiyordu. Artık site sinyali öncelikli.
- **`bottom-center` default'unun bazı senaryolarda uygulanmaması** — `DEFAULTS.position` doğru ayarlıydı ama mount fallback `bottom-right`'a düşüyordu. Artık tüm zincir tutarlı.

### Notes

- Public API davranışı değişmedi; mevcut kullanıcılar otomatik geçiş yapar.
- `theme="auto"` (default) → bridge aktif. `theme="light"` veya `theme="dark"` → bridge pas, manuel kontrol.
- WebForge sitelerinde `<html class="dark">` / class kaldırma pattern'i tema kontratı olarak resmileştirildi (bkz. `webforge/specs/theme-system.md`).
- Bundle boyutu: `cookie.min.js` 121.5kb → 124.4kb (+2.9kb theme-bridge).
- `@2` semver tag jsDelivr CDN otomatik bu sürüme geçer (~5-10 dk cache propagation).

---

## [2.2.0] — 2026-05-07

### Added

- **TypeScript public types** — `dist/cookie.d.ts` artık paket içinde; TS kullanıcıları `import type { BlakfyCookieAPI, BlakfyConsentState, ConsentCategory } from "@blakfy/cookie"` yapabilir. Tam IntelliSense desteği.
- **`@blakfy/cookie-next` test kapsamı** — vitest + React Testing Library setup, 68 test (Provider/ConsentModeDefault/3 hook + SSR safety + Hydration + Pages Router compat + RSC use client lock).
- **Modern npm packaging** — `exports`, `sideEffects`, `engines: ">=18"`, `unpkg`, `jsdelivr`, `publishConfig.provenance`, `bugs.url`, `funding` alanları.
- **`status.json` paket içine alındı** — runtime'da widget cdn.jsdelivr.net/npm/@blakfy/cookie@2/status.json'u tüketir.
- **Pages Router uyumluluk dokümantasyonu** — README'ye `_app.tsx` örneği. Provider hâlihazırda router-agnostik (statik test ile lock'lı).
- **`@blakfy/cookie-next` peerDependencies range** — `next: ">=14 <16"`, `react: ">=18 <20"`, `react-dom: ">=18 <20"` (React 19 + Next 15 explicit destekli).

### Changed

- **`cookie-next/package.json` `module`/`main` paths** — tsup 8.x output ile hizalandı: `main: dist/index.cjs` (CJS), `module: dist/index.js` (ESM). Önceki `dist/index.mjs` referansı yanlıştı.
- **README CDN örnekleri** — `cdn.jsdelivr.net/npm/@blakfy/cookie@2.2.0/...`.
- **CDN_BASE banner** — `scripts/build.js` dinamik olarak `package.json` version'ını okur (manuel sync hatası önlenir).

### Fixed

- **`window.BlakfyCookie.version`** runtime'da artık doğru sürümü (`"2.2.0"`) döndürür (önceki sürümlerde `src/api.js` `VERSION` constant senkronize değildi).
- **`data-blakfy-position` belgesi** — README'de yanlış olarak `bottom-right` default yazılmıştı; düzeltildi (`bottom-center`, kodda zaten 2.1.0'dan beri böyleydi).

### Notes

- Public API davranışı değişmedi; mevcut kullanıcılar otomatik geçiş yapabilir.
- `@2` semver tag jsDelivr CDN otomatik bu sürüme geçer (~5-10 dk cache propagation).
- TypeScript users: ek `@types/blakfy-cookie` paketi GEREKMEZ — types pakete dahil.

### Dev Infrastructure (paket içeriğine girmez)

- ESLint v9 flat config + Prettier (React/jsx-a11y/Next plugin'leri)
- husky + lint-staged + commitlint (conventional commits)
- changesets (monorepo versioning)
- @vitest/coverage-v8 + threshold gate
- CodeQL security scanning workflow
- size-limit + PR comment action
- GitHub templates (issue, PR, security, CoC, dependabot)
- TypeScript infrastructure (tsconfig + types.d.ts; src/ migration deferred)

---

## [2.1.2] — 2026-05-07

### Fixed

- `src/api.js` `VERSION` constant `"2.1.0"` → `"2.1.2"` (önceki yayınlarda paket sürümü ile senkron değildi; `window.BlakfyCookie.version` artık doğru sürümü döner)

### Docs

- README'de `data-blakfy-position` default değeri `bottom-right` olarak yanlış belgelenmişti → düzeltildi (`bottom-center`, kodda zaten böyleydi); enum tam liste ile güncellendi
- README Quick Start örneklerinden gereksiz `data-blakfy-position` override'ı kaldırıldı (default zaten alt-orta)
- examples/vanilla-html.html + wordpress-snippet.php: `bottom-right` → `bottom-center` (default ile hizalama)
- Installation bölümü eklendi (npm install + CDN seçenekleri: pinned vs auto-patch)
- `@blakfy/cookie-next` export tablosu eklendi
- Migration v1→v2 örneği npm CDN akışına güncellendi
- `RELEASE.md` baştan yeniden yazıldı (npm publish akışı, granular token, iki paket için manuel publish)

### Notes

- Bu **sadece patch + docs yayınıdır**; davranış değişmedi, public API değişmedi.
- `@2` semver tag jsDelivr CDN otomatik bu sürüme geçer.

---

## [2.1.1] — 2026-05-07

### Changed

- **CDN_BASE** runtime URL'i `cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@v2` → `cdn.jsdelivr.net/npm/@blakfy/cookie@2` (versiyonlu, immutable, npm registry kaynağı)
- `cookie-next` `BlakfyCookieProvider`: `cdnVersion` prop'u artık npm CDN URL'i üretir (default `"2"` → `@blakfy/cookie@2`)
- `package.json` `files` listesine `status.json` eklendi (widget runtime'da fetch eder)

### Notes

- Bu sadece patch yayınıdır; v2.1.0 ile tüm public API'ler ve davranış aynıdır.
- `srcOverride` (Next wrapper) ile özel CDN URL'i geçenler etkilenmez.

---

## [2.1.0] — 2026-04-30

### Added

- **3-tab preferences modal** — Kategoriler / Hizmetler / Hakkında
  - Hizmetler sekmesi: GDPR Madde 13/14 + KVKK Madde 10 uyumlu servis ifşası (veri işleyici, adres, amaçlar, teknolojiler, toplanan veriler, hukuki dayanak, saklama süresi, aktarım ülkeleri, gizlilik politikası linkleri)
  - Accordion kartlar: accordion expand/collapse per service
  - Hakkında sekmesi: CMP kimliği, platform açıklaması, sürüm
- **18 preset için `SERVICE_METADATA`** (`src/data/service-metadata.js`) — ga4, gtm, facebook, clarity, hotjar, youtube, vimeo, linkedin, yandex, bing, tiktok, pinterest, tawkto, intercom, hubspot, mailchimp, maps, recaptcha
- **3 renk teması** — `light` (beyaz), `gray` (açık gri), `dark` (siyah); `auto` → `prefers-color-scheme`
- 23 dile `tabs`, `service`, `svcAbout` çeviri anahtarları eklendi

### Changed

- Banner emoji kaldırıldı (kurumsal uyumluluk)
- Banner butonları `flex:1 flex-wrap:nowrap` ile eşit genişlikte, yatay düzen
- Widget kart genişliği `min(96vw,1100px)` (önceki: 780px)
- Widget kart `border-radius: 8px` (önceki: 16px)
- Buton `min-height: 36px` (önceki: 44px)
- Service list `max-height: 420px` (önceki: 340px)
- Bundle size budget `32 KB` (önceki: 24 KB) — service-metadata DB nedeniyle

### Fixed

- CDN URL `@v2` → jsDelivr semver tag desteği

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
