# Blakfy Cookie Widget

> [![CI](https://github.com/tariktunc/blakfy-cookie/actions/workflows/test.yml/badge.svg)](https://github.com/tariktunc/blakfy-cookie/actions/workflows/test.yml) [![npm version](https://img.shields.io/npm/v/@blakfy/cookie.svg)](https://www.npmjs.com/package/@blakfy/cookie) [![npm downloads](https://img.shields.io/npm/dm/@blakfy/cookie.svg)](https://www.npmjs.com/package/@blakfy/cookie) ![MIT](https://img.shields.io/badge/license-MIT-blue) ![size](https://img.shields.io/badge/size-30.2KB-success) ![tests](https://img.shields.io/badge/tests-365-success) ![langs](https://img.shields.io/badge/languages-23-orange) ![presets](https://img.shields.io/badge/presets-18-purple)
>
> Tek script ile **KVKK + GDPR + CCPA + Google CMv2 + Microsoft UET + Yandex Metrica + IAB TCF v2.2** uyumlu cookie consent (çerez onayı) widget. **23 dil**, **18 hazır preset** (üçüncü parti araç entegrasyonu), **3 renk teması**, **3-tab tercihler modalı** (Kategoriler / Hizmetler / Hakkında), **tag-gating** (script engelleme/serbest bırakma) dahil.

**Versiyon:** 2.2.0 • **Lisans:** MIT • **npm:** `@blakfy/cookie@2.2.0` · `@blakfy/cookie-next@2.2.0` • **CDN:** `cdn.jsdelivr.net/npm/@blakfy/cookie@2.2.0`

---

## Installation

İki yol var. Birini seç.

### A) CDN (önerilen — sıfır konfigürasyon)

| Strateji                    | URL                                                            | Ne zaman kullan                                                               |
| --------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Pinned** (sabit sürüm)    | `cdn.jsdelivr.net/npm/@blakfy/cookie@2.2.0/dist/cookie.min.js` | Production — değişikliklerin gözden geçirilerek kabul edilmesini istersen     |
| **Auto-patch** (semver tag) | `cdn.jsdelivr.net/npm/@blakfy/cookie@2/dist/cookie.min.js`     | Otomatik güvenlik/patch güncellemeleri — major (`@3`) gelene kadar takip eder |

unpkg da çalışır: `unpkg.com/@blakfy/cookie@2.2.0/dist/cookie.min.js`.

> ⚠️ **SRI (Subresource Integrity) — zorunlu okuma.** Bu script `<head>`'de en önce yüklenen,
> `ESSENTIAL` kategoride tag-gating'den muaf, tüm sayfa üzerinde en yüksek yetkiye sahip
> script'tir. CDN'den `integrity`/`crossorigin` olmadan yüklemek, tedarik zinciri (supply-chain)
> saldırısına açık kapı bırakır — bkz. [docs/compliance.md §13](./docs/compliance.md#13-content-security-policy-csp--sri-subresource-integrity).
> Her zaman **pinned** bir sürüm (`@2.3.2`, ASLA `@2`/`@latest`) + `integrity` hash'i birlikte
> kullan; auto-patch tag SRI'yı by design bozar (hash sürümle birlikte değişir). Hash'ler her
> release'de `npm run sri` ile üretilir — bkz. Quick Start adım 1 ve 3.

### B) npm / bundler (Vite, Webpack, Rollup, Astro)

```bash
npm i @blakfy/cookie              # Vanilla / bundler için widget
npm i @blakfy/cookie-next         # Next.js / React wrapper (cookie'yi peer olarak çekmez, sadece wrapper)
```

```js
// app.js veya main.js
import "@blakfy/cookie";
```

Bundler ile gelen versiyonu kontrol etmek için: `import { version } from "@blakfy/cookie"` mevcut değil — runtime'da `window.BlakfyCookie.version`.

> 💡 **Public API:** `window.BlakfyCookie` global'i hem CDN hem npm install yöntemiyle aynı şekilde tanımlanır. Aşağıdaki Quick Start CDN örneğindedir; npm install ediyorsan `<script src=...>` yerine `import "@blakfy/cookie"` kullan, gerisi aynı.

---

## Quick Start (3 adım)

### 1. Bootstrap (head içine, ilk script olarak)

`<head>` bloğuna **en üst sıraya** koy. GTM/GA4/Pixel'den **önce** yüklenmeli — onların default `denied` durumunda başlamasını sağlar (Google Consent Mode v2 + Microsoft UET).

```html
<!-- Bootstrap: Tüm consent sinyallerini 'denied' olarak başlatır -->
<!-- integrity: her release'de "npm run sri" ile üretilir (dist/sri-hashes.json) -->
<script
  src="https://cdn.jsdelivr.net/npm/@blakfy/cookie@2.2.0/dist/cookie-defaults.min.js"
  integrity="sha384-<npm run sri çıktısındaki hash>"
  crossorigin="anonymous"
></script>
```

### 2. Site içerik script'lerin (GTM/GA4/Pixel/Clarity vb.)

Bunlar olduğu gibi kalır. Bootstrap zaten consent default'larını `denied` olarak set etti, dolayısıyla bu tag'ler kullanıcı onay verene kadar cookie yazmaz.

```html
<!-- Örnek: Google Tag Manager (değişiklik gerektirmez) -->
<script>
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", "GTM-XXXXXX");
</script>
```

### 3. Widget (body sonu, `</body>`'den önce)

```html
<!-- integrity: her release'de "npm run sri" ile üretilir (dist/sri-hashes.json) -->
<script
  src="https://cdn.jsdelivr.net/npm/@blakfy/cookie@2.2.0/dist/cookie.min.js"
  integrity="sha384-<npm run sri çıktısındaki hash>"
  crossorigin="anonymous"
  data-blakfy-locale="auto"
  data-blakfy-policy-url="/cerez-politikasi"
  data-blakfy-version="1.0"
  data-blakfy-presets="ga4,gtm,facebook,clarity"
  data-blakfy-ccpa="auto"
  data-blakfy-tcf="false"
  data-blakfy-theme="auto"
  data-blakfy-accent="#3E5C3A"
></script>
<!-- Konum varsayılanı: alt-orta (bottom-center). İstersen data-blakfy-position="bottom-right" / "top-center" vb. ile değiştir. -->
```

**Bittiğinde:** Sayfa yüklendiğinde **alt-orta**'da (varsayılan) consent banner ve "Powered by Blakfy Studio" badge belirir. Konumu değiştirmek için `data-blakfy-position` ile `bottom-right`, `bottom-left`, `top-center`, `top-right`, `top-left` seçeneklerinden birini ver. Kullanıcı bir karar verene kadar GTM/GA4/Facebook Pixel/Clarity tag'leri çalışmaz; karar verildiğinde otomatik aktif olur.

### 4. Footer'a geri çağırma linki + audit endpoint (ikisi de zorunlu, opsiyonel değil)

Yukarıdaki 3 adım widget'ı ayağa kaldırır ama **iki compliance-kritik parça** eklenmeden kurulum eksik sayılır — ikisi de sona bırakılabilecek "nice to have" değildir:

**a) Geri çekme (withdrawal) linki** — GDPR/KVKK onayı istediği kadar kolay geri alınabilir olmalı der. `data-blakfy-*` script'i tek başına bunu vermez; footer'a (veya gizlilik sayfasına) ekle:

```html
<a href="#" onclick="event.preventDefault(); window.BlakfyCookie.open();"> Çerez Tercihleri </a>
```

**b) Audit endpoint** — `data-blakfy-audit-endpoint="/api/consent-log"` verilmezse KVKK Md.12 / GDPR Art. 7(1) gerektirdiği onay kaydı hiç tutulmaz. Widget bunu tespit eder ve ilk consent değişiminde konsola **bir kez** uyarı basar (`console.warn`) — ama bu sadece geliştirici konsolunu görenlere ulaşır, canlı sitede kimse fark etmez; bu yüzden kurulumda elle eklenmesi gerekir. Sunucu tarafı için detay: [`docs/compliance.md` §10](./docs/compliance.md#10-audit-log-kvkk-md12--gdpr-art71).

```html
<script src="..." data-blakfy-audit-endpoint="/api/consent-log" ...></script>
```

Sadece yerel demo/prototip için (canlı yayın değil) ikisini de atlayabilirsin — ama canlıya alırken ikisi de olmalı.

---

## Senaryolar

### Vanilla HTML / WordPress / Shopify

Yukarıdaki 3 adımı `<head>` ve `</body>` öncesine yapıştır. Çalışır. Tam çalışan örnek için: [`examples/vanilla-html.html`](./examples/vanilla-html.html).

WordPress için PHP snippet: [`examples/wordpress-snippet.php`](./examples/wordpress-snippet.php).

Shopify için: theme `theme.liquid` dosyasının `<head>` ve `</body>` öncesi noktalarına aynı 3 adım eklenir. Ek bir paket gerekmez.

### Next.js 14+ (önerilen — App Router)

```bash
npm install @blakfy/cookie-next@2
```

`app/layout.tsx`:

```tsx
import { BlakfyCookieProvider, ConsentModeDefault } from "@blakfy/cookie-next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {/* Bootstrap: GCM/UET/Yandex default denied */}
        <ConsentModeDefault />
      </head>
      <body>
        <BlakfyCookieProvider
          locale="auto"
          policyUrl="/cerez-politikasi"
          policyVersion="1.0"
          presets="ga4,gtm,facebook,clarity"
          ccpa="auto"
          tcf={false}
          // position varsayılanı "bottom-center" — değiştirmek istersen aç:
          // position="bottom-right"
          theme="auto"
          accent="#3E5C3A"
        >
          {children}
        </BlakfyCookieProvider>
      </body>
    </html>
  );
}
```

**`@blakfy/cookie-next` export'ları:**

| Export                 | Tip             | Açıklama                                                                                             |
| ---------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `BlakfyCookieProvider` | React component | Widget'ı `next/script beforeInteractive` ile yükler. Tüm `data-blakfy-*` attribute'ları prop olarak. |
| `ConsentModeDefault`   | React component | Bootstrap script'i (gtag/uetq/ym defaults `denied`). `<head>` içinde kullan.                         |
| `useBlakfyConsent()`   | Hook            | Mevcut consent state'i döndürür, değişimde re-render.                                                |
| `useGating(category)`  | Hook            | Belirtilen kategori onaylı mı (`boolean`). Conditional render için.                                  |
| `useTcf()`             | Hook            | TCF v2.2 TC string ve event listener wrapper'ı.                                                      |

Tam Next.js (App Router) örneği: [`examples/nextjs/`](./examples/nextjs/).
Paket README'si: [`packages/cookie-next/README.md`](./packages/cookie-next/README.md).

### Next.js Pages Router (legacy projeler)

Aynı paket Pages Router ile de çalışır — provider router-agnostik. `pages/_app.tsx`:

```tsx
import type { AppProps } from "next/app";
import { BlakfyCookieProvider, ConsentModeDefault } from "@blakfy/cookie-next";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ConsentModeDefault />
      <BlakfyCookieProvider
        locale="auto"
        policyUrl="/cerez-politikasi"
        policyVersion="1.0"
        presets="ga4,gtm,facebook,clarity"
      >
        <Component {...pageProps} />
      </BlakfyCookieProvider>
    </>
  );
}
```

`ConsentModeDefault`'u `_document.tsx`'in `<Head>` içine de koyabilirsin (daha erken yükleme). Provider `next/script beforeInteractive` ile yüklendiği için ekstra konfig gerekmez.

### GTM ile birlikte

GTM, default `denied` ile başlar (bootstrap sayesinde). Trigger'larında "Consent State" şartı eklemen yeterli — Tag → "Consent settings" → "Require additional consent for tag firing" → ilgili kategoriler (örn. `analytics_storage` veya `ad_storage`). Kullanıcı kabul edince `gtag('consent','update', ...)` otomatik çağrılır ve tag'ler kendiliğinden tetiklenir.

```js
// Doğrulama (DevTools console)
window.dataLayer.find((e) => e[0] === "consent");
// → ["consent", "default", { ad_storage: "denied", ... }]
window.BlakfyCookie.acceptAll();
// → ["consent", "update", { ad_storage: "granted", ... }]
```

### Bing Ads (Microsoft UET) ile

UET tag'ini olduğu gibi koy — bootstrap `window.uetq.push('consent','default',{ad_storage:'denied'})` çağrısını otomatik yapar. Kullanıcı `marketing` onayı verince UET'e `update` push edilir. Microsoft Clarity de aynı sinyali okur.

```html
<!-- UET tag — değişiklik gerektirmez -->
<script>
  (function (w, d, t, r, u) {
    var f, n, i;
    ((w[u] = w[u] || []),
      (f = function () {
        var o = { ti: "XXXXXXX" };
        ((o.q = w[u]), (w[u] = new UET(o)), w[u].push("pageLoad"));
      }),
      (n = d.createElement(t)),
      (n.src = r),
      (n.async = 1),
      (n.onload = n.onreadystatechange =
        function () {
          var s = this.readyState;
          (s && s !== "loaded" && s !== "complete") ||
            (f(), (n.onload = n.onreadystatechange = null));
        }),
      (i = d.getElementsByTagName(t)[0]),
      i.parentNode.insertBefore(n, i));
  })(window, document, "script", "//bat.bing.com/bat.js", "uetq");
</script>
```

### Yandex Metrica ile

Yandex'in standart consent API'si yoktur, tag-gating kullanılır. Metrica embed kodunu `type="text/plain"` ile sar:

```html
<script type="text/plain" data-blakfy-category="analytics">
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],
  k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window,document,"script","https://mc.yandex.ru/metrica/tag.js","ym");
  ym(XXXXXXXX, "init", { clickmap:true, trackLinks:true, accurateTrackBitrate:true });
</script>
```

**Webvisor (session replay)** için ayrı `recording` kategori onayı gerekir (KVKK/GDPR yorumu). Otomatik temizlenen cookie'ler: `_ym_*`, `yandexuid`, `yabs-frequency`.

---

## Tercihler Modalı (3 Sekme)

"Tercihler" veya `window.BlakfyCookie.open()` çağrıldığında açılan modal 3 sekmeden oluşur:

| Sekme           | İçerik                                                                                                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kategoriler** | Zorunlu / Analitik / Pazarlama / Fonksiyonel toggle switch'leri. "Seçimleri Kaydet" ve "Tümünü Kabul Et" butonları.                                                                                                                                              |
| **Hizmetler**   | Aktif preset'lere göre accordion kartlar. Her kart: açıklama, veri işleyici, adres, amaçlar, teknolojiler, toplanan veriler, hukuki dayanak, saklama süresi, aktarım ülkeleri, gizlilik politikası linki. GDPR Madde 13/14 + KVKK Madde 10 zorunlu bilgi ifşası. |
| **Hakkında**    | CMP kimliği (Blakfy Studio), platform açıklaması (GDPR / KVKK / CCPA), sürüm numarası.                                                                                                                                                                           |

> **Yasal dayanak:** Hizmetler sekmesindeki bilgiler GDPR Madde 13/14 (bilgi yükümlülüğü) ve KVKK Madde 10 (aydınlatma yükümlülüğü) gerekliliklerini karşılar. Presets kullanmadan da her site kendi hizmet bilgilerini `SERVICE_METADATA` yapısına ekleyebilir.

### Opsiyonel 4. Sekme: Cookie Transparency Panel (#39)

`data-blakfy-cookie-panel="true"` ile açılan **"Cookies"** sekmesi, kategorilerin
öngördüğü değil, `document.cookie`'de **gerçekten o an var olan** çerezleri listeler —
her satırda çerez adı, eşleşen hizmet (varsa), kategori ve amaç; eşleşmeyen çerezler
"unrecognised" olarak işaretlenir (operatör için asıl aksiyon alınacak liste budur).
Zorunlu (essential) kategorideki çerezler ve widget'ın kendi onay kaydı çerezi
silinemez; diğerleri tek tıkla, kategori reddi ile aynı çok-kapsamlı silme mantığıyla
(`src/gating/cleaner.js`) kaldırılır.

**Varsayılan: kapalı.** Bir site açıkça opt-in olmalı.

```html
<script src="..." data-blakfy-cookie-panel="true" ...></script>
```

**Sınırlamalar (UI'da da belirtilir):**

- `document.cookie` `HttpOnly` çerezleri göremez — liste kaçınılmaz olarak eksiktir.
- `localStorage`, `IndexedDB` veya fingerprinting hakkında hiçbir şey söylemez.

---

## Renk Temaları

3 hazır tema, `data-blakfy-theme` ile seçilir:

| Tema                   | Açıklama                                   | Attribute değeri         |
| ---------------------- | ------------------------------------------ | ------------------------ |
| **Beyaz** (varsayılan) | Beyaz arka plan, koyu metin                | `light` veya atlanabilir |
| **Açık gri**           | `#f0f0f0` arka plan, koyu metin            | `gray`                   |
| **Siyah**              | `#1a1a1a` arka plan, açık metin            | `dark`                   |
| **Otomatik**           | Sistem `prefers-color-scheme` ayarını okur | `auto`                   |

```html
<!-- Açık gri tema -->
<script src="...cookie.min.js" data-blakfy-theme="gray" ...></script>

<!-- Siyah tema -->
<script src="...cookie.min.js" data-blakfy-theme="dark" ...></script>

<!-- Sistem temasını takip et -->
<script src="...cookie.min.js" data-blakfy-theme="auto" ...></script>
```

Tüm temalarda `--blakfy-accent` CSS değişkeni geçerliliğini korur — buton ve aktif sekme rengi `data-blakfy-accent` ile özelleştirilebilir.

---

## Configuration Reference

Tüm `<script>` tag'i üzerine konabilen `data-blakfy-*` attribute'ları:

| Attribute                    | Default                                             | Tip                | Açıklama                                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-blakfy-locale`         | `auto`                                              | BCP47 ya da `auto` | Dil. `auto` → tarayıcıdan tespit. 23 desteklenen dil aşağıda.                                                                                                                 |
| `data-blakfy-main-lang`      | `null`                                              | BCP47              | Sitenin **birincil dili** (audit log için). Boşsa locale ile aynı.                                                                                                            |
| `data-blakfy-policy-url`     | `/cerez-politikasi`                                 | URL                | "Çerez Politikası" linki için hedef.                                                                                                                                          |
| `data-blakfy-version`        | `1.0`                                               | string             | **Politika versiyonu**. Bunu artırırsan tüm kullanıcılar tekrar onay vermek zorunda (re-consent).                                                                             |
| `data-blakfy-audit-endpoint` | `null`                                              | URL                | Consent kararı bu endpoint'e POST edilir (KVKK Md.12 / GDPR Art.7(1) kanıt).                                                                                                  |
| `data-blakfy-position`       | `bottom-center`                                     | enum               | `bottom-center` \| `bottom-right` \| `bottom-left` \| `top-center` \| `top-right` \| `top-left`                                                                               |
| `data-blakfy-theme`          | `auto`                                              | enum               | **`light`** (beyaz) \| **`gray`** (açık gri) \| **`dark`** (siyah) \| `auto` (`prefers-color-scheme`)                                                                         |
| `data-blakfy-accent`         | `#3E5C3A`                                           | hex                | Buton ve vurgu rengi.                                                                                                                                                         |
| `data-blakfy-presets`        | `null`                                              | virgül listesi     | Etkinleştirilecek preset key'leri. Örn: `ga4,gtm,facebook,clarity`. Aşağıda 18 preset listesi.                                                                                |
| `data-blakfy-tcf`            | `false`                                             | bool               | IAB TCF v2.2 modülünü aç (`__tcfapi` global).                                                                                                                                 |
| `data-blakfy-cmp-id`         | `0`                                                 | int                | TCF CMP ID. `0` = preview/test mode. Sertifikasyon sonrası gerçek ID.                                                                                                         |
| `data-blakfy-ccpa`           | `auto`                                              | enum               | `auto` (jurisdiction tespiti), `true` (her zaman aç), `false` (kapat)                                                                                                         |
| `data-blakfy-gpc`            | `respect`                                           | enum               | `respect` (tarayıcı GPC'si auto-deny say) \| `ignore`                                                                                                                         |
| `data-blakfy-cookie-domain`  | `null` (host-only)                                  | string             | `.example.com` verilirse tek onay kararı apex + tüm alt alan adlarında geçerli olur. Boşsa `www.example.com` ve `example.com` ayrı site sayılır, ziyaretçiye iki kez sorulur. |
| `data-blakfy-dnt`            | `respect`                                           | enum               | `respect` (UI'da uyar) \| `auto-deny` (auto-reject)                                                                                                                           |
| `data-blakfy-status-url`     | `cdn.jsdelivr.net/npm/@blakfy/cookie@2/status.json` | URL                | Status bar mesajları için kaynak. Kendi domain'inde host'lamak için override et.                                                                                              |
| `data-blakfy-status`         | `true`                                              | bool               | `false` ise status bar render edilmez.                                                                                                                                        |
| `data-blakfy-cookie-panel`   | `false`                                             | bool               | `true` ise modal'a "Cookies" sekmesi eklenir (#39) — o an gerçekten var olan çerezlerin listesi + tek tek silme. Bkz. "Opsiyonel 4. Sekme" bölümü.                            |
| `data-blakfy-attribution`    | `null` (host-name)                                  | string/`off`       | "Powered by" badge linkinin `utm_source`'unu domain yerine bir slug'a sabitler; `off` atıfı tamamen kapatır (#40).                                                            |

**Desteklenen 23 dil:** `tr`, `en`, `ar`, `fa`, `ur`, `fr`, `ru`, `de`, `he`, `uk`, `es`, `it`, `pt`, `nl`, `pl`, `sv`, `cs`, `zh`, `zh-TW`, `ja`, `ko`, `id`, `hi` (RTL: `ar`, `fa`, `ur`, `he`).

---

## API Reference

`window.BlakfyCookie` global olarak erişilebilir. Tüm v1 metodları korunmuştur, v2'de yeni metodlar eklendi.

| Metod                   | Sürüm      | İmza                                               | Açıklama                                                                                                                                                                            |
| ----------------------- | ---------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`               | v1         | `string`                                           | Kütüphane sürümü, örn. `"2.2.0"`.                                                                                                                                                   |
| `open()`                | v1         | `() => void`                                       | Tercihler modalını aç.                                                                                                                                                              |
| `acceptAll()`           | v1         | `() => void`                                       | Tüm kategorileri kabul et.                                                                                                                                                          |
| `rejectAll()`           | v1         | `() => void`                                       | Tüm kategorileri reddet (essential dışında).                                                                                                                                        |
| `getConsent(cat)`       | v1         | `(c: ConsentCategory) => boolean`                  | Kategori onaylı mı. `essential` her zaman `true`.                                                                                                                                   |
| `getState()`            | v1         | `() => BlakfyConsentState \| null`                 | Tam consent state objesi.                                                                                                                                                           |
| `onChange(fn)`          | v1         | `(fn: (state) => void) => void`                    | State değişince çağrılır.                                                                                                                                                           |
| `setLocale(loc)`        | v1         | `(loc: BlakfyLocale) => void`                      | Dili değiştir (UI re-render).                                                                                                                                                       |
| `getMainLang()`         | v1         | `() => BlakfyLocale`                               | Audit log için ayarlanan birincil dil.                                                                                                                                              |
| `onConsent(cat, fn)`    | **v2**     | `(c, fn: (granted: boolean) => void) => void`      | Kategori-bazlı listener. Mevcut state ile **anında** çağrılır, sonra her değişimde tekrar.                                                                                          |
| `registerCleanup(opts)` | **v2**     | `(opts: { category, cookies?, storage? }) => void` | Onay geri çekildiğinde silinecek cookie'leri/localStorage anahtarlarını kaydet.                                                                                                     |
| `unblock(cat)`          | **v2**     | `(c: ConsentCategory) => void`                     | Kategori için tag-gating'i manuel aç.                                                                                                                                               |
| `scan()`                | **v2**     | `() => ConsentCategory[]`                          | DOM'u tekrar tara (SPA navigasyonu sonrası).                                                                                                                                        |
| `usePreset(name)`       | **v2**     | `(name: string) => Preset \| null`                 | Hazır preset'i runtime'da uygula.                                                                                                                                                   |
| `tcf.getTCString()`     | **v2**     | `() => string`                                     | IAB TCF v2.2 TC string.                                                                                                                                                             |
| `ccpa.optOut()`         | **v2**     | `() => void`                                       | CCPA "Do Not Sell" opt-out.                                                                                                                                                         |
| `ccpa.isOptedOut()`     | **v2**     | `() => boolean`                                    | CCPA opt-out durumu.                                                                                                                                                                |
| `getJurisdiction()`     | **v2**     | `() => "GDPR" \| "CCPA" \| "LGPD" \| "default"`    | Tespit edilen yetki alanı.                                                                                                                                                          |
| `getLeaks()`            | **v2.3.2** | `() => LeakReport[]`                               | Aktif preset'lerin host'larına uyan ama Blakfy'nin `type="text/plain"` kapısından geçmemiş script'leri bulur. Bkz. [Platform-native tracker riski](#platform-native-tracker-riski). |
| `window.__tcfapi(...)`  | **v2**     | IAB standart                                       | `getTCData`, `addEventListener`, `removeEventListener` (TCF v2.2 spec).                                                                                                             |

**ConsentCategory:** `"essential"` | `"analytics"` | `"marketing"` | `"functional"` | `"recording"`

**BlakfyConsentState alanları:** `id` (uuid), `essential` (true), `analytics`, `marketing`, `functional`, `recording`, `timestamp` (ISO), `version` (policy), `locale`, `mainLang`, `jurisdiction`, `tcString`, `uspString`.

---

## Tag-Gating

Üçüncü parti tag'lerini kullanıcı onay vermeden çalıştırma. 4 yöntem.

### Harici script

```html
<!-- type="text/plain" → tarayıcı çalıştırmaz -->
<script
  type="text/plain"
  data-blakfy-category="marketing"
  data-blakfy-src="https://connect.facebook.net/en_US/fbevents.js"
  async
></script>
```

Onay verildiğinde widget script'in `type` attribute'unu `text/javascript`'e çevirir, `data-blakfy-src` → `src` taşır ve DOM'a yeniden ekler.

### Inline script

```html
<script type="text/plain" data-blakfy-category="analytics">
  console.log("Analytics tag fired");
  fbq('init', 'PIXEL_ID');
</script>
```

### Iframe (YouTube, Vimeo, harita, vb.)

```html
<iframe
  data-blakfy-src="https://www.youtube.com/embed/VIDEO_ID"
  data-blakfy-category="marketing"
  data-blakfy-placeholder="auto"
  width="560"
  height="315"
  title="YouTube video"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
  allowfullscreen
></iframe>
```

`data-blakfy-placeholder="auto"` → otomatik "Çerez onayı bekleniyor" placeholder UI'ı gösterilir.

### React/Next.js declarative gating

```tsx
"use client";
import { useGating } from "@blakfy/cookie-next";

export function YouTubeEmbed({ id }: { id: string }) {
  const allowed = useGating("marketing");
  if (!allowed) {
    return (
      <div className="aspect-video rounded bg-zinc-100 flex items-center justify-center">
        Onay bekleniyor — bu içeriği görmek için pazarlama çerezlerini kabul edin.
      </div>
    );
  }
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      className="w-full aspect-video"
      title="YouTube"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope"
      allowFullScreen
    />
  );
}
```

---

## 18 Hazır Preset

`data-blakfy-presets="ga4,gtm,facebook,clarity"` gibi virgüllü liste ile aktive edilir. Preset; cookie'leri ve localStorage anahtarlarını otomatik **registerCleanup**'a kaydeder, böylece kullanıcı onayı geri çekince bunlar otomatik silinir.

| Key         | Araç               | Kategori              | Örnek Cookie / Storage                           |
| ----------- | ------------------ | --------------------- | ------------------------------------------------ |
| `ga4`       | Google Analytics 4 | analytics             | `_ga`, `_ga_*`, `_gid`, `_gat`                   |
| `gtm`       | Google Tag Manager | analytics             | `_dc_gtm_*`                                      |
| `maps`      | Google Maps        | functional            | `NID`, `SID`, `HSID`                             |
| `recaptcha` | Google reCAPTCHA   | functional            | `_GRECAPTCHA`                                    |
| `facebook`  | Facebook Pixel     | marketing             | `_fbp`, `_fbc`, `fr`                             |
| `youtube`   | YouTube embed      | marketing             | `VISITOR_INFO1_LIVE`, `YSC`, `PREF`              |
| `vimeo`     | Vimeo embed        | marketing             | `vuid`, `_ga`                                    |
| `hotjar`    | Hotjar             | analytics             | `_hjSession*`, `_hjid`                           |
| `clarity`   | Microsoft Clarity  | analytics             | `_clck`, `_clsk`, `MUID`                         |
| `linkedin`  | LinkedIn Insight   | marketing             | `li_sugr`, `bcookie`, `lidc`, `UserMatchHistory` |
| `yandex`    | Yandex Metrica     | analytics + recording | `_ym_*`, `yandexuid`, `yabs-frequency`           |
| `bing`      | Bing Ads (UET)     | marketing             | `MUID`, `_uetsid`, `_uetvid`                     |
| `tiktok`    | TikTok Pixel       | marketing             | `tt_*`, `_ttp`                                   |
| `pinterest` | Pinterest Tag      | marketing             | `_pinterest_*`, `_pin_unauth`                    |
| `tawkto`    | Tawk.to chat       | functional            | `__tawkUUID`, `Tawk_*`                           |
| `intercom`  | Intercom           | functional            | `intercom-*`                                     |
| `hubspot`   | HubSpot            | marketing             | `__hssc`, `__hssrc`, `__hstc`, `hubspotutk`      |
| `mailchimp` | Mailchimp          | marketing             | `_mcid`, `mc_*`                                  |

**Manuel ekleme** (preset'sız):

```js
window.BlakfyCookie.registerCleanup({
  category: "marketing",
  cookies: ["my_custom_pixel", /^_track_/],
  storage: ["myAppMarketingCache"],
});
```

---

## Platform-native tracker riski

**Blakfy sadece kendi enjekte ettiği / `type="text/plain"` ile işaretlenmiş script'leri yönetebilir.** Wix, Shopify, İkas, Ticimax gibi platformların kendi "Marketing Integrations" / "Pazarlama Entegrasyonları" panelinden bağlanan GA4, Facebook Pixel, Yandex Metrica gibi araçlar bu widget'ın **tamamen dışında**, platformun kendi runtime'ı tarafından enjekte edilir — reddet/kabul kararına bakmadan çalışırlar.

Bunu canlıda yaşadık: Wix'te GA4 + Facebook Pixel, hem "Marketing Integrations" panelinden hem de ayrı bir "Marketing Tags" API katmanından bağlıydı; birini kapatmak yetmedi, ikisini de bulup kapatmak gerekti. Ayrıca Facebook'un **Conversions API (server-side)** gibi entegrasyonlar tarayıcıdan bağımsız çalıştığı için client-side gating'in görüş alanının tamamen dışındadır — GDPR/KVKK kapsamı dışında değildir, ayrıca gate edilmesi gerekir.

**v2.3.2+ ile: sızıntı tespiti (`getLeaks()`)**

Aktif preset'lerden (`data-blakfy-presets`) her biri için host listesi (`googletagmanager.com`, `connect.facebook.net`, vb.) taranır; sayfada bu host'lara uyan ama Blakfy'nin kapısından geçmemiş (`data-blakfy-unblocked="true"` işareti olmayan) bir `<script src>` bulunursa, bootstrap'tan ~3 saniye sonra otomatik `console.warn` ile bildirilir. Manuel tetiklemek için:

```js
window.BlakfyCookie.getLeaks();
// → [{ preset: "ga4", name: "Google Analytics 4", host: "googletagmanager.com", src: "...", category: "analytics", consentGranted: false }]
```

**Bunun yapamadığı şey:** sadece _tespit_ eder, engelleyemez — platformun kendi native entegrasyonu tarayıcı düzeyinde Blakfy'nin erişemeyeceği bir yerden enjekte edildiği için silinmesi gerekir (platformun kendi ayarlar panelinden). Sunucu-taraflı (CAPI gibi) entegrasyonlar hiç görülemez, ayrıca elle denetlenmelidir.

**Platform bazlı not:** Wix'te doğrulandı (Marketing Integrations + ayrı Marketing Tags API). Shopify, İkas, Ticimax, WordPress'te native entegrasyon panellerinin aynı şekilde bypass edip etmediği **doğrulanmadı** — her platformda bu widget'ı devreye almadan önce `getLeaks()` ile veya DevTools Network sekmesinden reddet-sonrası kontrol yapılmalı.

---

## Compliance

| Yasa / Standart            | Yetki Alanı         | Modül                          | Ne yapar                                                                 |
| -------------------------- | ------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| **GDPR**                   | AB                  | `core/` + `ui/`                | Eşit prominence kabul/red butonu, pre-tick yok, granular kategori onayı. |
| **ePrivacy Directive**     | AB                  | `core/consent-store`           | Onay öncesi cookie yazılmaz.                                             |
| **KVKK**                   | Türkiye             | `core/audit.js`                | Md.12 ispat yükümlülüğü için audit log POST.                             |
| **CCPA / CPRA**            | Kaliforniya         | `compliance/ccpa.js`           | "Do Not Sell" linki, USP string `1YYY`, GPC saygısı.                     |
| **LGPD**                   | Brezilya            | `i18n/pt.js` + `geo/`          | Portekizce UI, jurisdiction tespiti (v2.1'de tam destek).                |
| **Google Consent Mode v2** | Google ekosistemi   | `compliance/google-cmv2.js`    | `gtag('consent','update', {...})` 7 sinyal.                              |
| **Microsoft UET**          | Bing Ads + Clarity  | `compliance/microsoft-uet.js`  | `uetq.push('consent','update', {ad_storage})`                            |
| **Yandex Metrica**         | Yandex ekosistemi   | `compliance/yandex-metrica.js` | Tag-gating + Webvisor ayrı `recording` kategori.                         |
| **IAB TCF v2.2**           | AB AdTech (AdSense) | `compliance/tcf-v2.js`         | `__tcfapi`, TC string, GVL fetch.                                        |
| **GPC**                    | Tarayıcı standardı  | `compliance/gpc.js`            | `navigator.globalPrivacyControl` → marketing/analytics auto-deny.        |
| **DNT**                    | Tarayıcı standardı  | `compliance/dnt.js`            | `navigator.doNotTrack === "1"` → UI uyarı veya auto-deny.                |

### ❌ Kapsam dışı (Out of Scope)

Bu widget **çerez izni / tracking consent** için tasarlanmıştır. Aşağıdaki düzenlemeler **konu dışı** ve eklenti bunlara katkı sağlamaz:

| Düzenleme                     | Neden kapsam dışı                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIPAA** (ABD - sağlık)      | PHI (Protected Health Information) korunması; BAA imza, encryption, audit access log gerektirir. Hosting/uygulama katmanı sorumluluğudur (Wix Enterprise BAA, AWS BAA, Azure BAA). |
| **FERPA** (ABD - eğitim)      | Öğrenci kayıt verisi; kurumsal access control + storage encryption sorunu.                                                                                                         |
| **GLBA / SOX** (ABD - finans) | Finansal kayıt güvenliği; sistem-seviye audit ve encryption.                                                                                                                       |
| **PCI-DSS**                   | Ödeme kartı verisi; payment processor (Stripe/Adyen) sorumluluğu.                                                                                                                  |
| **SOC 2 / ISO 27001**         | Organizasyonel security management; sertifikasyon süreçleri.                                                                                                                       |

**Bir HIPAA / PCI / FERPA-altında çalışan site bu widget'ı kullanabilir** — site'in çerez consent yükümlülüğü için tasarlandığı için sorun yaratmaz. Ancak widget'ın varlığı siteni o standartlara uyumlu yapmaz; o uyumluluklar **veri işleme + altyapı katmanlarında** çözülür.

### TCF v2.2 (AdSense / Ad Manager kullanıcıları için)

`data-blakfy-tcf="true" data-blakfy-cmp-id="0"` ile preview mode'da çalışır. Production için IAB Europe sertifikasyonu gerekir (~2-3 ay, yıllık ~€2.000 ücret). Süreç ve audit gereksinimleri: [`docs/tcf-certification.md`](./docs/tcf-certification.md).

```js
// TC string okuma
window.BlakfyCookie.tcf.getTCString();
// IAB standart API
window.__tcfapi("getTCData", 2, (data, success) => console.log(data));
```

### CCPA / CPRA (ABD trafiği)

`data-blakfy-ccpa="auto"` → `geo/jurisdiction.js` Kaliforniya tespit ederse:

- Banner'daki "Reddet" → **"Do Not Sell or Share My Personal Information"**
- Footer'a kalıcı `<a class="blakfy-ccpa-link">` (yasal zorunluluk)
- USP string `1YYY` (versiyon, opt-out, sale, third-party) `__uspapi` üzerinden expose edilir
- `Sec-GPC: 1` header otomatik opt-out sayılır

### GPC / DNT default davranışı

- **GPC** (`navigator.globalPrivacyControl === true`): Kullanıcı açık onay vermediyse `marketing` ve `analytics` otomatik **denied**. CCPA jurisdiction'da yasal opt-out.
- **DNT** (`navigator.doNotTrack === "1"`): Default'ta sadece banner'da uyarı yazısı. `data-blakfy-dnt="auto-deny"` ile auto-reject yapılabilir. (DNT zayıf bir standart; GPC tercih edilir.)

---

## Troubleshooting

### Widget hiç görünmüyor

1. Console'da hata var mı? Network sekmesinde `cookie.min.js` 200 dönüyor mu?
2. Script tag'i `</body>`'den önce mi? `<head>` içine konursa DOM hazır olmadan render denenir.
3. Daha önce kabul/red verildiyse banner görünmez (kalıcı). Modal'ı tetiklemek için: `window.BlakfyCookie.open()` veya footer'a "Çerez Tercihleri" linki koy.

### Banner her sayfada / her seferinde tekrar açılıyor

`data-blakfy-version` (politika versiyonu) değişti mi? Bu değer her cookie'de saklanır; uyuşmuyorsa re-consent tetiklenir. **Dikkat:** Kütüphane sürümü `cookie.min.js` patch güncellemeleri kullanıcıyı **etkilemez** (v2 düzeltmesi). v1'de bu bir bug'dı.

### GTM / GA4 tetiklenmiyor

- **Bootstrap script GTM'den önce mi yükleniyor?** `cookie-defaults.min.js` `<head>`'in **ilk** script'i olmalı. Aksi halde GTM `consent default` çağrısını kaçırır.
- Tag → "Consent settings" → "Require additional consent for tag firing" doğru kategorilere ayarlı mı?
- Kullanıcı kabul etti mi: `window.BlakfyCookie.getState()` ile kontrol et.

### Yandex Metrica çalışıyor ama Webvisor (session replay) çalışmıyor

Webvisor `marketing` değil, **`recording`** kategorisi gerektirir. Modal'da bu seçeneğe ayrı onay vermelisin. KVKK/GDPR yorumu: session replay biyometriye yakın özel veri olduğu için ek granular onay zorunlu.

### TCF preview mode'da takıldım

`data-blakfy-cmp-id="0"` preview mode'dur. AdSense/Ad Manager production için IAB Europe sertifikasyonu sonrası atanan gerçek CMP ID girilmeli. Detay: [`docs/tcf-certification.md`](./docs/tcf-certification.md).

### "Powered by Blakfy Studio" badge'i nasıl gizlerim?

**Gizlenemez.** 3 katmanlı anti-tampering korumalı (CSS `!important`, MutationObserver re-injection, kod-baked HTML). Lisans şartının parçasıdır. Marka koruması.

### Badge linki hangi siteden geldiğini nasıl bildiriyor?

Badge `href`'i `utm_source` (host `location.hostname`'i, `www.` atılmış hali), `utm_medium=cookie-badge` ve `utm_campaign=powered-by` ile etiketlenir; `rel="noopener"` kullanılır (`noreferrer` değil), böylece UTM parametreleri bir yönlendirme veya gizlilik uzantısı tarafından silinirse `Referer` başlığı yedek sinyal olarak kalır (`referrerPolicy="origin"` ile sadece origin gönderilir, path/query asla). Ziyaretçinin kendi verisi taşınmaz; sadece müşteri sitesinin domaini, ve sadece tıklama anında.

- `<html data-blakfy-attribution="musteri-slug">` — domain yerine sabit bir hesap adı gönderir (bir müşterinin birden fazla domaini varsa faydalı).
- `<html data-blakfy-attribution="off">` — atıf tamamen kapatılır, badge linki çıplak `https://blakfy.com/` olur.

Bu davranış cookie/consent kapsamı dışındadır: hiçbir cookie yazılmaz, hiçbir kimlik oluşturulmaz, sayfa yüklenirken hiçbir istek atılmaz (sadece tıklamada). `@blakfy/accessibility-widget`'taki eşdeğer badge için de aynı şema geçerlidir, farklı `utm_medium` ile (ayrı repo, ayrı sürüm).

### Next.js'te FOUC (içerik atlaması) görüyorum

`@blakfy/cookie-next@2`'ye yükselt. v1'de FOUC vardı; v2'de `next/script` `beforeInteractive` strateji kullanılıyor.

### `acceptAll()` sonrası 3rd-party tag'ler hala engelli

`window.BlakfyCookie.scan()` çağır — SPA navigasyonu veya dinamik DOM ekleme sonrası gating observer'ı tekrar tetikler.

---

## Migration v1 → v2

**Kısa cevap:** Değişiklik gerekmez. v1 kullanıcıları `@1` etiketinde kalır, çalışmaya devam eder. v2'ye opt-in yapmak için **CDN URL'sini npm registry kaynağına çevir**:

```diff
- <script src="https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@1/cookie.js"></script>
+ <script src="https://cdn.jsdelivr.net/npm/@blakfy/cookie@2/dist/cookie.min.js"></script>
```

Tüm v1 attribute'ları korunur, kullanıcı consent cookie'si geriye uyumlu okunur. v2'de yeni eklenen özellikler (3-tab modal, 3 renk teması, 18 preset, TCF v2.2, CCPA, GPC) **opt-in** — varsayılanlar v1 davranışını taklit eder.

Bundler kullanıyorsan: `npm i @blakfy/cookie` ve `import "@blakfy/cookie"`.

Detay: [`docs/migration.md`](./docs/migration.md).

---

## Footer "Çerez Tercihleri" linki

```html
<a href="#" onclick="event.preventDefault(); window.BlakfyCookie.open();"> Çerez Tercihleri </a>
```

Veya React:

```tsx
<button onClick={() => window.BlakfyCookie?.open()}>Çerez Tercihleri</button>
```

---

## Diğer Kaynaklar

- [`docs/platform-guides.md`](./docs/platform-guides.md) — Wix (doğrulandı) / İkas / Ticimax / Shopify / WordPress kurulum + native tracker kontrol adımları
- [`docs/architecture.md`](./docs/architecture.md) — modül yapısı, veri akışı, boyut bütçesi
- [`docs/compliance.md`](./docs/compliance.md) — her yasa için detaylı uyumluluk mappingleri
- [`CHANGELOG.md`](./CHANGELOG.md) — sürüm notları
- [`docs/migration.md`](./docs/migration.md) — v1 → v2 geçiş
- [`docs/tcf-certification.md`](./docs/tcf-certification.md) — IAB Europe başvuru süreci
- [`packages/cookie-next/README.md`](./packages/cookie-next/README.md) — npm paketi rehberi

---

## License

MIT © Blakfy Studio. "Powered by Blakfy Studio" branding badge anti-tampering korumalı ve kaldırılamaz.

Issues: https://github.com/tariktunc/blakfy-cookie/issues
