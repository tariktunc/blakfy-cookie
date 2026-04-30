# Blakfy Cookie — v2.0 Architecture

> Tek script ile yüklenen, sıfır bağımlılık, çok motorlu uyumluluk sağlayan widget tabanlı cookie consent sistemi. Vanilla + Next.js destekli, jsDelivr CDN üzerinden otomatik güncellenir.

---

## Tasarım İlkeleri

| İlke | Karar | Neden |
|---|---|---|
| **Dağıtım** | jsDelivr `@2` major-pin | Kullanıcılar `@2`'ye bağlanır; biz `git tag v2.x.x` push edince anında yayılır. `@latest` yasak. |
| **Sıfır bağımlılık** | Vanilla JS, IIFE, ES5 syntax (cookie.js); ESM build (cookie-next) | Eski tarayıcılar, çoklu stack |
| **Geriye uyumluluk** | v1 API kontratı v2'de korunur | Mevcut `@1` entegrasyonları kırılmaz, yeni metotlar additive |
| **Boyut bütçesi** | Core ≤ 24 KB minified+gzip (gerçek: ~23 KB) | Site performansı; rakipler 50-150 KB |
| **Re-consent disiplini** | Sadece `data-blakfy-version` (policyVersion) re-consent tetikler | `cookie.js` bump'ı kullanıcıyı etkilemez |
| **Branding** | "Powered by Blakfy Studio" badge — kapatılamaz, anti-tampering korumalı | Marka koruması |
| **Compliance kapsamı** | Google CMv2 + Microsoft UET + Yandex Metrica + IAB TCF v2.2 + CCPA + GPC + DNT | Üç büyük arama motoru + AB + ABD yasal uyumluluk |

---

## Klasör Yapısı

```
blakfy-cookie/
├── src/                              # v2 kaynak ağacı
│   ├── core/                         # consent state, cookie I/O, audit, events
│   ├── compliance/                   # motor + yasal uyumluluk modülleri
│   │   ├── google-cmv2.js
│   │   ├── microsoft-uet.js
│   │   ├── yandex-metrica.js
│   │   ├── tcf-v2.js
│   │   ├── ccpa.js
│   │   ├── gpc.js
│   │   └── dnt.js
│   ├── i18n/                         # 23 dil, BCP47 detect
│   ├── ui/                           # banner, modal, status-bar, badge, focus-trap
│   ├── gating/                       # script + iframe unblocker, observer, cleaner
│   ├── presets/                      # 18 hazır araç entegrasyonu
│   ├── geo/                          # jurisdiction tespiti (GDPR/CCPA/LGPD)
│   ├── api.js                        # window.BlakfyCookie public API
│   └── index.js                      # entry
├── packages/
│   └── cookie-next/                  # Next.js wrapper (npm: @blakfy/cookie-next)
├── dist/                             # CDN servis edilen build çıktısı
├── examples/                         # vanilla + nextjs + wordpress
├── tests/                            # Vitest (jsdom)
├── scripts/                          # esbuild build script'i
├── .github/workflows/                # test.yml + release.yml
├── legacy/                           # v1.x kaynak (geri dönüş güvenliği)
├── ARCHITECTURE.md                   # bu dosya
├── COMPLIANCE.md                     # uyumluluk detayları
├── TCF-CERTIFICATION.md              # IAB Europe başvuru süreci
├── CHANGELOG.md
├── MIGRATION.md                      # v1 → v2 (genelde sıfır iş)
└── README.md                         # AI-friendly kurulum kılavuzu
```

---

## Veri Akışı

```
┌─────────────────────────────────────────────────────┐
│  1. Bootstrap (cookie-defaults.min.js, <head> ilk)  │
│     - GCM v2 default 'denied'                       │
│     - UET default 'denied'                          │
│     - Yandex cookies engelli                        │
│     - GPC/DNT header okundu, opt-out flag set       │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  2. Widget (cookie.min.js, <body> sonu)             │
│     ─────────────────────────────────────────       │
│     a) src/geo/jurisdiction tespit (GDPR/CCPA/...)  │
│     b) src/core/consent-store cookie oku            │
│     c) Yoksa → src/ui/banner render                 │
│        (sağ alt köşede badge dahil)                 │
│     d) src/gating/observer DOM tara                 │
│     e) Aktif preset'leri kaydet                     │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  3. Kullanıcı kararı                                │
│     - acceptAll / rejectAll / save preferences      │
│     ↓                                               │
│     src/core/consent-store cookie yaz               │
│     src/compliance/* her motora sinyal gönder       │
│     src/gating/script-unblocker tag'leri aktive et  │
│     src/core/audit endpoint POST                    │
│     window.BlakfyCookie.onChange listener'ları emit │
└─────────────────────────────────────────────────────┘
```

---

## Public API Yüzeyi

### v1 Uyumluluğu (kırılmaz)

```js
window.BlakfyCookie.open() / acceptAll() / rejectAll()
window.BlakfyCookie.getConsent("analytics")
window.BlakfyCookie.getState() / onChange(fn) / setLocale("ar")
window.BlakfyCookie.version
```

### v2 Yeni API

```js
// Tag-gating
BlakfyCookie.onConsent("marketing", granted => {})
BlakfyCookie.registerCleanup({ category, cookies, storage })
BlakfyCookie.unblock("marketing")
BlakfyCookie.scan()
BlakfyCookie.usePreset("google-analytics")

// IAB TCF v2.2
window.__tcfapi("getTCData", 2, callback)
BlakfyCookie.tcf.getTCString()

// CCPA / CPRA
BlakfyCookie.ccpa.optOut() / isOptedOut()

// Jurisdiction
BlakfyCookie.getJurisdiction()  // "GDPR" | "CCPA" | "LGPD" | "default"
```

---

## Re-consent Politikası

Tek tetikleyici: `data-blakfy-version` (politika versiyonu) değişimi.

```js
// Cookie okuma
if (s.version !== config.policyVersion) return null;  // re-consent
// blakfy version (kütüphane sürümü) artık karşılaştırılmıyor — v1 bug fix
```

Yani sen `cookie.js`'i `v2.0.0 → v2.0.1` güncellersen kullanıcılar etkilenmez. Sadece sen `data-blakfy-version="1.0" → "2.0"` yaparsan re-consent tetiklenir.

---

## Branding (Anti-Tampering)

3 katmanlı koruma:

1. **CSS:** `.blakfy-badge { display: flex !important; opacity: 1 !important; pointer-events: auto !important; }`
2. **DOM:** `MutationObserver` widget kökünü izler. Badge silinirse 50ms sonra geri ekler. `data-*` attribute manipulation görmezden gelinir.
3. **Kod:** Badge HTML build sırasında sabitlenir, config'den okumaz.

Test: `tests/badge-anti-tamper.test.js` — silme, CSS injection, attribute tampering senaryoları.

---

## Boyut Bütçesi

| Katman | Hedef (gzip) |
|---|---|
| Core (consent + UI + i18n + badge) | ≤ 14 KB |
| Compliance toplamı (lazy) | ≤ 6 KB |
| 18 Preset (lazy) | ≤ 4 KB |
| **TOPLAM (her şey aktif)** | **≤ 22 KB** |

`scripts/build.js` her release'de boyut kontrolü yapar; bütçeyi aşan PR'lar CI'da fail olur.

---

## Geliştirme Akışı

```bash
npm install              # workspace + cookie-next deps
npm run dev              # esbuild watch
npm test                 # Vitest jsdom
npm run build            # dist/cookie.min.js + cookie-defaults.min.js
npm run build:next       # tsup → packages/cookie-next/dist
npm run size             # bundle size guard
```

Release:
```bash
git tag v2.0.0
git push --tags
# GitHub Actions → tests + build + npm publish + GitHub Release
# jsDelivr @2 anında güncellenir
```
