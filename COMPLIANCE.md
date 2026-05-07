# Blakfy Cookie — Compliance Reference

> Hangi yasa/motor/standart için ne yapıyoruz, hangi modül karşılıyor.

---

## 1. Compliance Matrisi

| Yasa / Standart                  | Yetki Alanı                    | Modül                                              | Durum (v2.0.0)            |
| -------------------------------- | ------------------------------ | -------------------------------------------------- | ------------------------- |
| **GDPR**                         | AB                             | core + ui (eşit prominence butonlar, pre-tick yok) | ✅                        |
| **ePrivacy Directive**           | AB                             | core (consent öncesi cookie konmaz)                | ✅                        |
| **KVKK**                         | Türkiye                        | core/audit.js (Md.12 kanıt yükümlülüğü)            | ✅                        |
| **CCPA / CPRA**                  | Kaliforniya, ABD               | compliance/ccpa.js                                 | ✅                        |
| **LGPD**                         | Brezilya                       | i18n/translations/pt.js + jurisdiction             | ⚠️ (v2.1)                 |
| **Google Consent Mode v2**       | Google ekosistemi              | compliance/google-cmv2.js                          | ✅                        |
| **Microsoft UET Consent Mode**   | Bing Ads + Clarity             | compliance/microsoft-uet.js                        | ✅                        |
| **Yandex Metrica Consent**       | Yandex ekosistemi              | compliance/yandex-metrica.js                       | ✅                        |
| **IAB TCF v2.2**                 | AB AdTech (AdSense/Ad Manager) | compliance/tcf-v2.js                               | ✅ kod + ⏳ sertifikasyon |
| **GPC** (Global Privacy Control) | Tarayıcı standardı, CA yasal   | compliance/gpc.js                                  | ✅                        |
| **DNT** (Do Not Track)           | Tarayıcı standardı             | compliance/dnt.js                                  | ✅                        |

---

## 2. Google Consent Mode v2

**Sinyal:**

```js
gtag("consent", "update", {
  ad_storage: marketing ? "granted" : "denied",
  ad_user_data: marketing ? "granted" : "denied",
  ad_personalization: marketing ? "granted" : "denied",
  analytics_storage: analytics ? "granted" : "denied",
  functionality_storage: functional ? "granted" : "denied",
  personalization_storage: functional ? "granted" : "denied",
  security_storage: "granted",
});
```

**Bootstrap (cookie-defaults.min.js):**

- Tüm sinyaller default `denied`
- `wait_for_update: 500` ile GTM/GA4 cevap bekler
- `gtag` global fonksiyonu yoksa stub kurulur

---

## 3. Microsoft UET Consent Mode

**Sinyal:**

```js
window.uetq = window.uetq || [];
window.uetq.push("consent", "update", {
  ad_storage: marketing ? "granted" : "denied",
});
```

Bing Ads (UET tag) ve Microsoft Clarity bunu okur. v2.0.0 itibariyle Clarity zaten bu sinyali destekliyor.

**Bootstrap:** `uetq` push queue stub kurulur, default `denied`.

---

## 4. Yandex Metrica Consent

Yandex'in Google gibi standart bir consent API'si yok. Yaklaşımımız:

- Onay yokken Metrica script'leri **engellenir** (gating layer).
- Onay verilince `ym(counterId, 'init', {...})` çağrılır.
- **Webvisor (session replay)** ekstra kategori — `marketing` değil, ayrı `recording` kategorisi olarak işaretlenir (KVKK/GDPR yorum farkı).
- Cookie temizliği: `_ym_*`, `_ym_uid`, `_ym_d`, `_ym_isad`, `yabs-frequency`, `yandexuid`.

---

## 5. IAB TCF v2.2

**Teknik kapsam (v2.0.0 ile gelen kod):**

- `window.__tcfapi(command, version, callback, parameter)` global fonksiyonu (IAB standardı)
- TC string encoding (Base64URL, vendor segments dahil)
- Global Vendor List (GVL) fetch — `vendor-list.consensu.org/v3/vendor-list.json`
- `getTCData`, `addEventListener`, `removeEventListener` komutları
- `data-blakfy-cmp-id="0"` → preview/test mode

**Sertifikasyon süreci (kullanıcı tarafı):**

1. https://iabeurope.eu/cmp-list/ üzerinden başvuru
2. Audit (kod + UI + DSAR/data subject request akışı incelenir)
3. Annual fee (~€2.000)
4. CMP ID atanır → `data-blakfy-cmp-id="123"` ile yazılır
5. Onay öncesi widget "preview mode"da çalışır, onay sonrası prod

⏱ Süreç 2-3 ay. Detay: [TCF-CERTIFICATION.md](./TCF-CERTIFICATION.md)

---

## 6. CCPA / CPRA

**Kapsam:** Kaliforniya sakinleri için.

**Tetiklenme:** `src/geo/jurisdiction.js` ABD/CA tespit ederse:

- Banner "Reddet" yerine **"Do Not Sell or Share My Personal Information"** olarak değiştirilir.
- Footer'a kalıcı `<a class="blakfy-ccpa-link">` eklenir (yasal zorunluluk).
- `Sec-GPC: 1` header otomatik opt-out say.
- USP string `1YYY` formatında set edilir (versiyon, opt-out, sale, third-party).

**API:**

```js
BlakfyCookie.ccpa.optOut();
BlakfyCookie.ccpa.isOptedOut();
```

---

## 7. GPC (Global Privacy Control)

`navigator.globalPrivacyControl === true` ise:

- `marketing` ve `analytics` kategorileri **otomatik denied** (kullanıcı açık onay vermediyse)
- CCPA jurisdiction'da yasal olarak zorunlu opt-out
- GDPR jurisdiction'da rehberlik niteliğinde, biz default'ta saygı gösteriyoruz

Override: `data-blakfy-gpc="ignore"` ile kapatılabilir (önerilmez).

---

## 8. DNT (Do Not Track)

`navigator.doNotTrack === "1"` ise:

- Default'ta **sadece UI'da işaret** (kullanıcı görsün, "GPC veya DNT etkin" yazısı)
- `data-blakfy-dnt="auto-deny"` ile auto-deny opsiyonel

DNT eski/zayıf bir standart, GPC tercih edilir.

---

## 9. Jurisdiction Tespiti

`src/geo/jurisdiction.js` 3 strateji dener:

1. **Cloudflare** `CF-IPCountry` header (server-rendered sites)
2. **Server endpoint** `data-blakfy-geo-endpoint="/api/geo"` (opt-in)
3. **Client-side fallback:** `Intl.DateTimeFormat().resolvedOptions().timeZone` → kaba bölge tahmini

Sonuç: `"GDPR"` | `"CCPA"` | `"LGPD"` | `"default"`

---

## 10. Audit Log (KVKK Md.12 + GDPR Art.7(1))

Her consent değişikliği `data-blakfy-audit-endpoint`'e POST edilir:

```json
{
  "id": "uuid-v4-anonim-id",
  "timestamp": "2026-04-30T12:00:00Z",
  "action": "accept_all" | "reject_all" | "save_preferences",
  "state": { ... },
  "jurisdiction": "GDPR",
  "userAgent": "...",
  "url": "...",
  "policyVersion": "1.0",
  "blakfy": "2.0.0",
  "tcString": "...",
  "uspString": "..."
}
```

**Anonim ID:** `crypto.randomUUID()` — fingerprint **değil** (v1'deki `makeHash()` kaldırıldı).

---

## 11. Kategori → Yasal Temel Eşlemesi

| Kategori               | GDPR Yasal Temel                   | KVKK              | CCPA                  |
| ---------------------- | ---------------------------------- | ----------------- | --------------------- |
| `essential`            | Art. 6(1)(b) — sözleşme/zorunluluk | Md.5(2)(c)        | exempt                |
| `analytics`            | Art. 6(1)(a) — açık rıza           | Md.5(1)           | optable               |
| `marketing`            | Art. 6(1)(a) — açık rıza           | Md.5(1)           | optable + GPC saygısı |
| `functional`           | Art. 6(1)(a) — açık rıza           | Md.5(1)           | optable               |
| `recording` (Webvisor) | Art. 6(1)(a) — ek granular onay    | Md.5(1) açık rıza | optable               |

---

## 12. Test Kapsamı

`tests/compliance/` altında her modül için ayrı test:

- `google-cmv2.test.js` — gtag stub kurulumu, update sinyalleri
- `microsoft-uet.test.js` — uetq queue, consent push
- `yandex-metrica.test.js` — cookie engelleme, Webvisor ayrı kategori
- `tcf-v2.test.js` — `__tcfapi` komut yüzeyi, TC string format
- `ccpa.test.js` — USP string, DNT/GPC saygısı
- `gpc.test.js` — auto-deny davranışı
