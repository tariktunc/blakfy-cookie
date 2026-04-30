# Migration: v1 → v2

> Kısa cevap: **Değişiklik yapmana gerek yok.** v1 kullanıcıları `@1` etiketinde kalır, çalışmaya devam eder. v2 yeni features için opt-in.

---

## v1'de kal — hiçbir şey değişmez

```html
<!-- Bu çalışmaya devam ediyor, kırılmıyor -->
<script src="https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@1/cookie.js"
        data-blakfy-locale="auto"
        data-blakfy-policy-url="/cerez-politikasi"></script>
```

v1 son sürümü `1.2.0`'da donduruldu. Critical security patch çıkarsa `1.2.x` patch sürümleri devam edebilir.

---

## v2'ye geç — 1 satır değişiklik

```diff
- <script src="https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@1/cookie.js"
+ <script src="https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@2/dist/cookie.min.js"
          data-blakfy-locale="auto"
          data-blakfy-policy-url="/cerez-politikasi"></script>
```

Tüm v1 attribute'ları çalışmaya devam eder, kullanıcı consent'i korunur (cookie formatı uyumlu).

---

## Yeni Özellikleri Aktif Et (opsiyonel)

### Tag-gating
```html
<!-- 3rd-party script'leri sar -->
<script type="text/plain"
        data-blakfy-category="marketing"
        data-blakfy-src="https://connect.facebook.net/en_US/fbevents.js"></script>
```

### Preset kullan
```diff
  <script src="...@2/dist/cookie.min.js"
          data-blakfy-locale="auto"
+         data-blakfy-presets="ga4,gtm,facebook,clarity"></script>
```

### TCF v2.2
```diff
+ <script ... data-blakfy-tcf="true" data-blakfy-cmp-id="0"></script>
```
(CMP ID `0` preview mode, sertifikasyon onayı sonrası gerçek ID girilir.)

### CCPA
```diff
+ <script ... data-blakfy-ccpa="auto"></script>
```
(Otomatik jurisdiction tespitiyle Kaliforniya kullanıcılarına "Do Not Sell" linki gösterilir.)

---

## Next.js (cookie-next) Migration

### v1 (npm paketi yoktu, sadece GitHub'tan import)

```tsx
// Eski
import { BlakfyCookieProvider } from "@blakfy/cookie-next";  // ham .tsx
```

### v2 (npm public paketi)

```bash
npm install @blakfy/cookie-next@2
```

```tsx
// Yeni — TypeScript tipler genişledi (23 dil), yeni hook'lar var
import {
  BlakfyCookieProvider,
  ConsentModeDefault,
  useBlakfyConsent,
  useGating,        // YENİ
  useTcf,           // YENİ
} from "@blakfy/cookie-next";
```

### Yeni hook örnekleri

```tsx
// Kategori-tabanlı koşullu render
function YouTubeEmbed({ id }: { id: string }) {
  const allowed = useGating("marketing");
  if (!allowed) return <Placeholder />;
  return <iframe src={`https://www.youtube.com/embed/${id}`} />;
}
```

---

## API Değişiklikleri

| API | v1 | v2 | Not |
|---|---|---|---|
| `acceptAll/rejectAll/open` | ✅ | ✅ | aynı |
| `getConsent/getState` | ✅ | ✅ | aynı |
| `onChange` | ✅ | ✅ | aynı |
| `setLocale` | 9 dil | 23 dil | TS tipi genişletildi |
| `onConsent(cat, fn)` | ❌ | ✅ | YENİ |
| `registerCleanup` | ❌ | ✅ | YENİ |
| `unblock/scan/usePreset` | ❌ | ✅ | YENİ |
| `tcf.*` | ❌ | ✅ | YENİ |
| `ccpa.*` | ❌ | ✅ | YENİ |
| `getJurisdiction` | ❌ | ✅ | YENİ |
| `getMainLang` | ✅ | ✅ | aynı |

---

## Cookie Formatı

v2 cookie formatı v1 ile **geriye uyumlu**. v1 cookie'si v2 tarafından okunur, eksik alanlar default değerlerle doldurulur.

```js
// v1 cookie örneği
{ essential, analytics, marketing, functional, timestamp, version, blakfy, locale, hash }

// v2 cookie örneği (eklemeler)
{ ..., id (uuid), jurisdiction, tcString?, uspString?, mainLang? }
```

Eski `hash` alanı v2'de okunmaz ama silinmez (geri dönüş güvenliği).

---

## Re-consent Davranışı

### v1 (BUG)
`cookie.js` her sürüm güncellendiğinde **tüm kullanıcılar yeniden onay vermek zorundaydı**. Bu KVKK/GDPR uyumlu davranış değildi.

### v2 (DÜZELDİ)
Sadece `data-blakfy-version` (politika versiyonu) değişimi re-consent tetikler. `cookie.js` patch/minor güncellemeleri kullanıcıyı etkilemez.

```js
// v1
if (s.version !== config.policyVersion || s.blakfy !== VERSION) return null;
// v2
if (s.version !== config.policyVersion) return null;
```

---

## Soru / Sorun?

GitHub Issues → https://github.com/tariktunc/blakfy-cookie/issues
