# Blakfy Cookie Widget

> ![v2.1.1](https://img.shields.io/badge/version-2.1.1-3E5C3A) ![MIT](https://img.shields.io/badge/license-MIT-blue) ![size](https://img.shields.io/badge/size-%E2%89%A430KB-success) ![langs](https://img.shields.io/badge/languages-23-orange) ![presets](https://img.shields.io/badge/presets-18-purple)
>
> Tek script ile **KVKK + GDPR + CCPA + Google CMv2 + Microsoft UET + Yandex Metrica + IAB TCF v2.2** uyumlu cookie consent (çerez onayı) widget. **23 dil**, **18 hazır preset** (üçüncü parti araç entegrasyonu), **3 renk teması**, **3-tab tercihler modalı** (Kategoriler / Hizmetler / Hakkında), **tag-gating** (script engelleme/serbest bırakma) dahil.

**Versiyon:** 2.1.1  •  **Lisans:** MIT  •  **npm:** `@blakfy/cookie@2.1.1` · `@blakfy/cookie-next@2.1.1`  •  **CDN:** `cdn.jsdelivr.net/npm/@blakfy/cookie@2.1.1`

---

## Installation

İki yol var. Birini seç.

### A) CDN (önerilen — sıfır konfigürasyon)

| Strateji | URL | Ne zaman kullan |
|---|---|---|
| **Pinned** (sabit sürüm) | `cdn.jsdelivr.net/npm/@blakfy/cookie@2.1.1/dist/cookie.min.js` | Production — değişikliklerin gözden geçirilerek kabul edilmesini istersen |
| **Auto-patch** (semver tag) | `cdn.jsdelivr.net/npm/@blakfy/cookie@2/dist/cookie.min.js` | Otomatik güvenlik/patch güncellemeleri — major (`@3`) gelene kadar takip eder |

unpkg da çalışır: `unpkg.com/@blakfy/cookie@2.1.1/dist/cookie.min.js`.

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
<script src="https://cdn.jsdelivr.net/npm/@blakfy/cookie@2.1.1/dist/cookie-defaults.min.js"></script>
```

### 2. Site içerik script'lerin (GTM/GA4/Pixel/Clarity vb.)

Bunlar olduğu gibi kalır. Bootstrap zaten consent default'larını `denied` olarak set etti, dolayısıyla bu tag'ler kullanıcı onay verene kadar cookie yazmaz.

```html
<!-- Örnek: Google Tag Manager (değişiklik gerektirmez) -->
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');
</script>
```

### 3. Widget (body sonu, `</body>`'den önce)

```html
<script
  src="https://cdn.jsdelivr.net/npm/@blakfy/cookie@2.1.1/dist/cookie.min.js"
  data-blakfy-locale="auto"
  data-blakfy-policy-url="/cerez-politikasi"
  data-blakfy-version="1.0"
  data-blakfy-presets="ga4,gtm,facebook,clarity"
  data-blakfy-ccpa="auto"
  data-blakfy-tcf="false"
  data-blakfy-position="bottom-right"
  data-blakfy-theme="auto"
  data-blakfy-accent="#3E5C3A"></script>
```

**Bittiğinde:** Sayfa yüklendiğinde sağ alt köşede consent banner ve "Powered by Blakfy Studio" badge belirir. Kullanıcı bir karar verene kadar GTM/GA4/Facebook Pixel/Clarity tag'leri çalışmaz; karar verildiğinde otomatik aktif olur.

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
          position="bottom-right"
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

| Export | Tip | Açıklama |
|---|---|---|
| `BlakfyCookieProvider` | React component | Widget'ı `next/script beforeInteractive` ile yükler. Tüm `data-blakfy-*` attribute'ları prop olarak. |
| `ConsentModeDefault` | React component | Bootstrap script'i (gtag/uetq/ym defaults `denied`). `<head>` içinde kullan. |
| `useBlakfyConsent()` | Hook | Mevcut consent state'i döndürür, değişimde re-render. |
| `useGating(category)` | Hook | Belirtilen kategori onaylı mı (`boolean`). Conditional render için. |
| `useTcf()` | Hook | TCF v2.2 TC string ve event listener wrapper'ı. |

Tam Next.js örneği: [`examples/nextjs/`](./examples/nextjs/).
Paket README'si: [`packages/cookie-next/README.md`](./packages/cookie-next/README.md).

### GTM ile birlikte

GTM, default `denied` ile başlar (bootstrap sayesinde). Trigger'larında "Consent State" şartı eklemen yeterli — Tag → "Consent settings" → "Require additional consent for tag firing" → ilgili kategoriler (örn. `analytics_storage` veya `ad_storage`). Kullanıcı kabul edince `gtag('consent','update', ...)` otomatik çağrılır ve tag'ler kendiliğinden tetiklenir.

```js
// Doğrulama (DevTools console)
window.dataLayer.find(e => e[0] === 'consent');
// → ["consent", "default", { ad_storage: "denied", ... }]
window.BlakfyCookie.acceptAll();
// → ["consent", "update", { ad_storage: "granted", ... }]
```

### Bing Ads (Microsoft UET) ile

UET tag'ini olduğu gibi koy — bootstrap `window.uetq.push('consent','default',{ad_storage:'denied'})` çağrısını otomatik yapar. Kullanıcı `marketing` onayı verince UET'e `update` push edilir. Microsoft Clarity de aynı sinyali okur.

```html
<!-- UET tag — değişiklik gerektirmez -->
<script>
(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"XXXXXXX"};
o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,
n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;
s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},
i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i);
})(window,document,"script","//bat.bing.com/bat.js","uetq");
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

| Sekme | İçerik |
|---|---|
| **Kategoriler** | Zorunlu / Analitik / Pazarlama / Fonksiyonel toggle switch'leri. "Seçimleri Kaydet" ve "Tümünü Kabul Et" butonları. |
| **Hizmetler** | Aktif preset'lere göre accordion kartlar. Her kart: açıklama, veri işleyici, adres, amaçlar, teknolojiler, toplanan veriler, hukuki dayanak, saklama süresi, aktarım ülkeleri, gizlilik politikası linki. GDPR Madde 13/14 + KVKK Madde 10 zorunlu bilgi ifşası. |
| **Hakkında** | CMP kimliği (Blakfy Studio), platform açıklaması (GDPR / KVKK / CCPA), sürüm numarası. |

> **Yasal dayanak:** Hizmetler sekmesindeki bilgiler GDPR Madde 13/14 (bilgi yükümlülüğü) ve KVKK Madde 10 (aydınlatma yükümlülüğü) gerekliliklerini karşılar. Presets kullanmadan da her site kendi hizmet bilgilerini `SERVICE_METADATA` yapısına ekleyebilir.

---

## Renk Temaları

3 hazır tema, `data-blakfy-theme` ile seçilir:

| Tema | Açıklama | Attribute değeri |
|---|---|---|
| **Beyaz** (varsayılan) | Beyaz arka plan, koyu metin | `light` veya atlanabilir |
| **Açık gri** | `#f0f0f0` arka plan, koyu metin | `gray` |
| **Siyah** | `#1a1a1a` arka plan, açık metin | `dark` |
| **Otomatik** | Sistem `prefers-color-scheme` ayarını okur | `auto` |

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

| Attribute | Default | Tip | Açıklama |
|---|---|---|---|
| `data-blakfy-locale` | `auto` | BCP47 ya da `auto` | Dil. `auto` → tarayıcıdan tespit. 23 desteklenen dil aşağıda. |
| `data-blakfy-main-lang` | `null` | BCP47 | Sitenin **birincil dili** (audit log için). Boşsa locale ile aynı. |
| `data-blakfy-policy-url` | `/cerez-politikasi` | URL | "Çerez Politikası" linki için hedef. |
| `data-blakfy-version` | `1.0` | string | **Politika versiyonu**. Bunu artırırsan tüm kullanıcılar tekrar onay vermek zorunda (re-consent). |
| `data-blakfy-audit-endpoint` | `null` | URL | Consent kararı bu endpoint'e POST edilir (KVKK Md.12 / GDPR Art.7(1) kanıt). |
| `data-blakfy-position` | `bottom-right` | enum | `bottom-right` \| `bottom-left` \| `bottom` \| `top` \| `center` |
| `data-blakfy-theme` | `auto` | enum | **`light`** (beyaz) \| **`gray`** (açık gri) \| **`dark`** (siyah) \| `auto` (`prefers-color-scheme`) |
| `data-blakfy-accent` | `#3E5C3A` | hex | Buton ve vurgu rengi. |
| `data-blakfy-presets` | `null` | virgül listesi | Etkinleştirilecek preset key'leri. Örn: `ga4,gtm,facebook,clarity`. Aşağıda 18 preset listesi. |
| `data-blakfy-tcf` | `false` | bool | IAB TCF v2.2 modülünü aç (`__tcfapi` global). |
| `data-blakfy-cmp-id` | `0` | int | TCF CMP ID. `0` = preview/test mode. Sertifikasyon sonrası gerçek ID. |
| `data-blakfy-ccpa` | `auto` | enum | `auto` (jurisdiction tespiti), `true` (her zaman aç), `false` (kapat) |
| `data-blakfy-gpc` | `respect` | enum | `respect` (tarayıcı GPC'si auto-deny say) \| `ignore` |
| `data-blakfy-dnt` | `respect` | enum | `respect` (UI'da uyar) \| `auto-deny` (auto-reject) |
| `data-blakfy-status-url` | `cdn.jsdelivr.net/npm/@blakfy/cookie@2/status.json` | URL | Status bar mesajları için kaynak. Kendi domain'inde host'lamak için override et. |
| `data-blakfy-status` | `true` | bool | `false` ise status bar render edilmez. |

**Desteklenen 23 dil:** `tr`, `en`, `ar`, `fa`, `ur`, `fr`, `ru`, `de`, `he`, `uk`, `es`, `it`, `pt`, `nl`, `pl`, `sv`, `cs`, `zh`, `zh-TW`, `ja`, `ko`, `id`, `hi` (RTL: `ar`, `fa`, `ur`, `he`).

---

## API Reference

`window.BlakfyCookie` global olarak erişilebilir. Tüm v1 metodları korunmuştur, v2'de yeni metodlar eklendi.

| Metod | Sürüm | İmza | Açıklama |
|---|---|---|---|
| `version` | v1 | `string` | Kütüphane sürümü, örn. `"2.1.1"`. |
| `open()` | v1 | `() => void` | Tercihler modalını aç. |
| `acceptAll()` | v1 | `() => void` | Tüm kategorileri kabul et. |
| `rejectAll()` | v1 | `() => void` | Tüm kategorileri reddet (essential dışında). |
| `getConsent(cat)` | v1 | `(c: ConsentCategory) => boolean` | Kategori onaylı mı. `essential` her zaman `true`. |
| `getState()` | v1 | `() => BlakfyConsentState \| null` | Tam consent state objesi. |
| `onChange(fn)` | v1 | `(fn: (state) => void) => void` | State değişince çağrılır. |
| `setLocale(loc)` | v1 | `(loc: BlakfyLocale) => void` | Dili değiştir (UI re-render). |
| `getMainLang()` | v1 | `() => BlakfyLocale` | Audit log için ayarlanan birincil dil. |
| `onConsent(cat, fn)` | **v2** | `(c, fn: (granted: boolean) => void) => void` | Kategori-bazlı listener. Mevcut state ile **anında** çağrılır, sonra her değişimde tekrar. |
| `registerCleanup(opts)` | **v2** | `(opts: { category, cookies?, storage? }) => void` | Onay geri çekildiğinde silinecek cookie'leri/localStorage anahtarlarını kaydet. |
| `unblock(cat)` | **v2** | `(c: ConsentCategory) => void` | Kategori için tag-gating'i manuel aç. |
| `scan()` | **v2** | `() => ConsentCategory[]` | DOM'u tekrar tara (SPA navigasyonu sonrası). |
| `usePreset(name)` | **v2** | `(name: string) => Preset \| null` | Hazır preset'i runtime'da uygula. |
| `tcf.getTCString()` | **v2** | `() => string` | IAB TCF v2.2 TC string. |
| `ccpa.optOut()` | **v2** | `() => void` | CCPA "Do Not Sell" opt-out. |
| `ccpa.isOptedOut()` | **v2** | `() => boolean` | CCPA opt-out durumu. |
| `getJurisdiction()` | **v2** | `() => "GDPR" \| "CCPA" \| "LGPD" \| "default"` | Tespit edilen yetki alanı. |
| `window.__tcfapi(...)` | **v2** | IAB standart | `getTCData`, `addEventListener`, `removeEventListener` (TCF v2.2 spec). |

**ConsentCategory:** `"essential"` | `"analytics"` | `"marketing"` | `"functional"` | `"recording"`

**BlakfyConsentState alanları:** `id` (uuid), `essential` (true), `analytics`, `marketing`, `functional`, `recording`, `timestamp` (ISO), `version` (policy), `locale`, `mainLang`, `jurisdiction`, `tcString`, `uspString`.

---

## Tag-Gating

Üçüncü parti tag'lerini kullanıcı onay vermeden çalıştırma. 4 yöntem.

### Harici script

```html
<!-- type="text/plain" → tarayıcı çalıştırmaz -->
<script type="text/plain"
        data-blakfy-category="marketing"
        data-blakfy-src="https://connect.facebook.net/en_US/fbevents.js"
        async></script>
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
<iframe data-blakfy-src="https://www.youtube.com/embed/VIDEO_ID"
        data-blakfy-category="marketing"
        data-blakfy-placeholder="auto"
        width="560" height="315"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        allowfullscreen></iframe>
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

| Key | Araç | Kategori | Örnek Cookie / Storage |
|---|---|---|---|
| `ga4` | Google Analytics 4 | analytics | `_ga`, `_ga_*`, `_gid`, `_gat` |
| `gtm` | Google Tag Manager | analytics | `_dc_gtm_*` |
| `maps` | Google Maps | functional | `NID`, `SID`, `HSID` |
| `recaptcha` | Google reCAPTCHA | functional | `_GRECAPTCHA` |
| `facebook` | Facebook Pixel | marketing | `_fbp`, `_fbc`, `fr` |
| `youtube` | YouTube embed | marketing | `VISITOR_INFO1_LIVE`, `YSC`, `PREF` |
| `vimeo` | Vimeo embed | marketing | `vuid`, `_ga` |
| `hotjar` | Hotjar | analytics | `_hjSession*`, `_hjid` |
| `clarity` | Microsoft Clarity | analytics | `_clck`, `_clsk`, `MUID` |
| `linkedin` | LinkedIn Insight | marketing | `li_sugr`, `bcookie`, `lidc`, `UserMatchHistory` |
| `yandex` | Yandex Metrica | analytics + recording | `_ym_*`, `yandexuid`, `yabs-frequency` |
| `bing` | Bing Ads (UET) | marketing | `MUID`, `_uetsid`, `_uetvid` |
| `tiktok` | TikTok Pixel | marketing | `tt_*`, `_ttp` |
| `pinterest` | Pinterest Tag | marketing | `_pinterest_*`, `_pin_unauth` |
| `tawkto` | Tawk.to chat | functional | `__tawkUUID`, `Tawk_*` |
| `intercom` | Intercom | functional | `intercom-*` |
| `hubspot` | HubSpot | marketing | `__hssc`, `__hssrc`, `__hstc`, `hubspotutk` |
| `mailchimp` | Mailchimp | marketing | `_mcid`, `mc_*` |

**Manuel ekleme** (preset'sız):

```js
window.BlakfyCookie.registerCleanup({
  category: "marketing",
  cookies: ["my_custom_pixel", /^_track_/],
  storage: ["myAppMarketingCache"]
});
```

---

## Compliance

| Yasa / Standart | Yetki Alanı | Modül | Ne yapar |
|---|---|---|---|
| **GDPR** | AB | `core/` + `ui/` | Eşit prominence kabul/red butonu, pre-tick yok, granular kategori onayı. |
| **ePrivacy Directive** | AB | `core/consent-store` | Onay öncesi cookie yazılmaz. |
| **KVKK** | Türkiye | `core/audit.js` | Md.12 ispat yükümlülüğü için audit log POST. |
| **CCPA / CPRA** | Kaliforniya | `compliance/ccpa.js` | "Do Not Sell" linki, USP string `1YYY`, GPC saygısı. |
| **LGPD** | Brezilya | `i18n/pt.js` + `geo/` | Portekizce UI, jurisdiction tespiti (v2.1'de tam destek). |
| **Google Consent Mode v2** | Google ekosistemi | `compliance/google-cmv2.js` | `gtag('consent','update', {...})` 7 sinyal. |
| **Microsoft UET** | Bing Ads + Clarity | `compliance/microsoft-uet.js` | `uetq.push('consent','update', {ad_storage})` |
| **Yandex Metrica** | Yandex ekosistemi | `compliance/yandex-metrica.js` | Tag-gating + Webvisor ayrı `recording` kategori. |
| **IAB TCF v2.2** | AB AdTech (AdSense) | `compliance/tcf-v2.js` | `__tcfapi`, TC string, GVL fetch. |
| **GPC** | Tarayıcı standardı | `compliance/gpc.js` | `navigator.globalPrivacyControl` → marketing/analytics auto-deny. |
| **DNT** | Tarayıcı standardı | `compliance/dnt.js` | `navigator.doNotTrack === "1"` → UI uyarı veya auto-deny. |

### TCF v2.2 (AdSense / Ad Manager kullanıcıları için)

`data-blakfy-tcf="true" data-blakfy-cmp-id="0"` ile preview mode'da çalışır. Production için IAB Europe sertifikasyonu gerekir (~2-3 ay, yıllık ~€2.000 ücret). Süreç ve audit gereksinimleri: [`TCF-CERTIFICATION.md`](./TCF-CERTIFICATION.md).

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

`data-blakfy-cmp-id="0"` preview mode'dur. AdSense/Ad Manager production için IAB Europe sertifikasyonu sonrası atanan gerçek CMP ID girilmeli. Detay: [`TCF-CERTIFICATION.md`](./TCF-CERTIFICATION.md).

### "Powered by Blakfy Studio" badge'i nasıl gizlerim?

**Gizlenemez.** 3 katmanlı anti-tampering korumalı (CSS `!important`, MutationObserver re-injection, kod-baked HTML). Lisans şartının parçasıdır. Marka koruması.

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

Detay: [`MIGRATION.md`](./MIGRATION.md).

---

## Footer "Çerez Tercihleri" linki

```html
<a href="#" onclick="event.preventDefault(); window.BlakfyCookie.open();">
  Çerez Tercihleri
</a>
```

Veya React:

```tsx
<button onClick={() => window.BlakfyCookie?.open()}>Çerez Tercihleri</button>
```

---

## Diğer Kaynaklar

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — modül yapısı, veri akışı, boyut bütçesi
- [`COMPLIANCE.md`](./COMPLIANCE.md) — her yasa için detaylı uyumluluk mappingleri
- [`CHANGELOG.md`](./CHANGELOG.md) — sürüm notları
- [`MIGRATION.md`](./MIGRATION.md) — v1 → v2 geçiş
- [`TCF-CERTIFICATION.md`](./TCF-CERTIFICATION.md) — IAB Europe başvuru süreci
- [`packages/cookie-next/README.md`](./packages/cookie-next/README.md) — npm paketi rehberi

---

## License

MIT © Blakfy Studio. "Powered by Blakfy Studio" branding badge anti-tampering korumalı ve kaldırılamaz.

Issues: https://github.com/tariktunc/blakfy-cookie/issues
