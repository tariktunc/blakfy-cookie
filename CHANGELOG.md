# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/) and SemVer.

---

## [2.4.6] — 2026-09-14

### Changed

- **FAB default background corrected to black (`#111827`), not gray** — 2.4.4 decoupled the FAB's background from `--blakfy-accent` (so it wouldn't silently change per site) but picked the wrong fixed color; the intended stable default is black with a white icon, per owner spec. `fabColor`/`fabIconColor` still override it per site.

## [2.4.5] — 2026-09-14

### Fixed

- **FAB icon (20px default) overflowed a custom `fabHeight` smaller than that** — shrinking the box via `fabWidth`/`fabHeight` never shrank the glyph inside it, so a small custom FAB (e.g. 28×16) had its icon touching/exceeding the box edges.

### Added

- **`fabIconSize`** (`data-blakfy-fab-icon-size`) — sizes the glyph independent of the box. Number = px, or pass a raw CSS value.

## [2.4.4] — 2026-09-14

### Fixed

- **A site's document `:root` override of `--blakfy-fab-radius` never reached the FAB** — the widget's own stylesheet sets this variable via a `:host,:root` rule, which re-declares it directly on the shadow host; that local declaration blocks inheritance from anything outside the shadow tree, so an external override was silently ignored (found while giving birinciogluticaret-com's FAB sharp rectangle corners — it stayed a 50% pill).

### Added

- **`fabRadius`** (`data-blakfy-fab-radius`) — same mechanism as `fabWidth`/`fabHeight` (an inline override set directly on the button), the only way to reliably change the FAB's corner radius. Accepts any CSS value: `"4px"`, `"50%"`, `"0"`.
- **`fabIconColor`** (`data-blakfy-fab-icon-color`) — the FAB's glyph color (default white), independent from `fabColor` (the background).

### Changed

- **`--blakfy-fab-bg` no longer auto-links to `--blakfy-accent`** — the FAB used to silently pick up whatever accent color a site set for the banner, so its "default" look changed per site without anyone asking for that (found on birinciogluticaret-com: black, not the documented neutral gray). The FAB's own default is now a fixed, stable `#6b7280` gray; a site that wants it to match its brand passes `fabColor` explicitly.

## [2.4.3] — 2026-09-14

### Fixed

- **`fabSize` didn't actually shrink the clickable FAB** — the button's positioned box always used `--blakfy-fab-target` (44px, the a11y touch-target floor); `fabSize` only shrank the visual dot drawn inside it via `::before`, leaving an invisible padding ring around the smaller shape that read as "floating"/misaligned next to a neighboring element (found on birinciogluticaret-com's WhatsApp button).

### Added

- **`fabWidth` / `fabHeight`** (`data-blakfy-fab-width` / `data-blakfy-fab-height`) — independent width and height for a genuinely rectangular (non-square) FAB. When set, both the clickable box and the visual fill move together, so there is no size mismatch.

## [cookie-next 2.3.3] — 2026-09-14

### Added

- **`fabSide` / `fabOffset` / `fabSize` / `fabColor` props** — the reopen FAB's placement was previously only configurable on the vanilla `data-blakfy-*` attribute path; `BlakfyCookieProvider` now passes these through the same way, needed for sites that must explicitly pin the FAB to one corner regardless of the package default.

## [2.4.2] — 2026-09-14

### Fixed

- **Reopen FAB no longer overlaps the accessibility widget** — the FAB's default `fabSide` was `"left"`, the same corner the Blakfy accessibility widget's FAB always occupies (CLAUDE.md Core Decision #4, non-negotiable). On every site running both widgets the two controls sat exactly on top of each other. Default flipped to `"right"`; `data-blakfy-fab="left"` stays available for sites where the right corner is genuinely occupied (e.g. a Wix chat/map widget) and the accessibility widget is off.

## [cookie-next 2.3.2] — 2026-09-14

### Changed

- **Default `cdnVersion` changed from `"2"` (floating major) to `"latest"`** — owner decision: every site auto-updates to the newest publish with zero manual redeploy, mirroring the accessibility-widget policy (CLAUDE.md 6 CORE DECISIONS #4). A site that needs SRI (which requires a fixed, hashable file) or deliberate change control should pass an explicit `cdnVersion` override — `BlakfyCookieProvider` never applies `integrity`/`crossOrigin` itself, so this is safe for every current install.

## [2.4.1] — 2026-09-13

### Fixed

- **Services accordion opens one at a time (#54)** — opening a card now closes any other open card instead of stacking them.
- **cookiePanel + tab labels translated in all 23 locales (#52, #58)** — the Cookies-tab disclaimer, empty/unrecognised/essential/delete strings, and the Categories/Services/About tab labels were English placeholders in every locale but tr/en; now real translations everywhere.
- **Gated placeholder shows the translated category name (#61)** — a blocked embed used to interpolate the raw internal id (`marketing`) into the message text in every language, including tr.
- **Service metadata localized for tr (#55)** — `getServiceMeta(key, locale)` overlays translated description/purposes/technologies/dataCollected onto the English base for all 18 presets; other locales fall back to English until translated.
- **Dark-theme checked switch was invisible (#59)** — a higher-specificity dark-theme rule was overriding the accent-colored checked state, making it indistinguishable from unchecked.
- **`window.BlakfyCookie.version` / About panel showed a stale 2.2.0 (#60)** — now sources the real build-time-injected version.
- **Default accent changed from brand green to neutral gray (#56)** — owner design decision; `data-blakfy-accent` customization unaffected.
- **Modal overflowed on short viewports with no way to scroll (#57)** — `.blakfy-overlay.modal .blakfy-card` now caps height and scrolls internally.
- **Service-card headers jittered by sub-pixel amounts and text wasn't vertically centered** — fixed min-height plus `line-height:1` on the name/category spans (inherited `line-height:1.5` was inflating each span's own line-box, so `align-items:center` centered an oversized box instead of the glyphs).
- **Accordion body silently clipped trailing fields instead of scrolling** — a flexbox spec gotcha: `.blakfy-service-card{overflow:hidden}` drops its automatic minimum size to 0, so once an opened card pushed the list past its 420px max-height, flexbox shrank every card to fit rather than the list scrolling. `flex-shrink:0` fixes it.
- **Dismissing the preferences modal (backdrop click, Escape, the X button) could delete the banner behind it and force a decision-less dead end** — before a decision exists, dismissal now closes only the modal and leaves the banner mounted; a decision (`commit()`) still closes everything.

### Changed

- **Bundle budget raised 32 → 33 KB gzip** for the bundled core (`cookie.min.js`) — the Turkish service-metadata overlay above pushed it past 32 KB; a deliberate, reviewed move rather than a silent regression.

## [cookie-next 2.3.1] — 2026-08-25

### Changed

- **`@blakfy/cookie-next` peer range widened to `next >=14 <17`** — Next.js 16 is now an accepted peer. Verified against Next 16.3.2 + React 19.2.8 in a scratch App Router build: install without `--legacy-peer-deps`, `next build` clean, Consent Mode v2 default script and the CDN loader present in the SSR output. No runtime change; the package still only uses `next/script`.

## [2.4.0] — 2026-09-13

### Changed

- **Shadow DOM izolasyonu (#35)** — Banner, modal ve reopen FAB (#34) artık tek bir shadow root içinde render ediliyor (`#blakfy-cookie-root`, `src/ui/shadow-root.js`). Enjekte edilen 3 `<style>` etiketi de aynı sınırın içine taşındı — host site CSS'i artık widget'ı bozamaz (`button{...!important}` gibi tema kuralları), ve widget'ın kendi stilleri host sayfaya sızmıyor. Bu ayrıca #29'daki CSP `style-src 'unsafe-inline'` gereksinimini kaldırıyor: enjekte edilen 3 stil artık document.head'de değil, shadow root'ta.
  - `--blakfy-accent` ve `--blakfy-fab-*` custom property API'si aynen çalışmaya devam ediyor — custom property'ler shadow sınırını miras yoluyla geçer, sitenin kendi `:root` override'ı önceliğini korur.
  - `aria-labelledby`/`aria-describedby` referansları aynı shadow ağacı içinde kalacak şekilde korundu (ID referansları shadow sınırını geçmez).
  - Focus trap (#27), odak shadow sınırını geçtiğinde `document.activeElement`'in artık shadow HOST'u döndürmesine karşı düzeltildi (`getDeepActiveElement()`, `src/ui/focus-trap.js`) — Tab döngüsü, Escape ve odak-geri-dönüşü aynen çalışıyor.
  - Badge anti-tamper MutationObserver'ı artık `document.head` yerine shadow root'u izliyor (`installAntiTamper(rootEl, styleRoot)`).
  - Theme bridge (`theme="auto"`) kasıtlı olarak DEĞİŞMEDİ — host sayfanın `<html class="dark">` sinyalini light DOM'dan okumaya devam ediyor; sonuç shadow içindeki karta uygulanıyor.
  - Shadow DOM desteklemeyen (fiilen artık yok denecek kadar az) tarayıcılarda host elemanının kendisine düz mount olarak geri düşüyor — izolasyon yok ama yapısal olarak çalışmaya devam ediyor.
  - **Risk notu:** widget sınıflarını kendi site CSS'inden override eden bir entegratör artık çalışmayacak. #22 zaten attribute/token API'sinin bugüne kadar çalışmadığını gösterdiği için kimsenin buna güvenmesi olası değil, ama minor sürüm artışıyla işaretlendi.

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
