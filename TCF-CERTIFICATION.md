# IAB TCF v2.2 Sertifikasyon Süreci

> Bu doküman v2.0.0 release sonrası başlatılacak süreçtir. Kod hazır, ama IAB Europe'tan resmi CMP ID alınmadan widget "preview mode"da çalışır.

---

## Neden Sertifikasyon Lazım?

Eğer site sahibi:

- Google AdSense
- Google Ad Manager (DV360, Google Ads — re-marketing dahil)
- Major SSP'ler (Magnite, Index Exchange, Xandr...)

kullanıyorsa, **Mart 2024'ten beri** TCF v2.2 sertifikalı bir CMP zorunlu. Sertifikasız widget "non-compliant" sayılır ve Google reklam servisi durdurabilir.

---

## Süreç (5 Adım)

### 1. Başvuru

- URL: https://iabeurope.eu/cmp-list/
- Form: CMP adı, URL, teknik temas kişisi, audit dokümanları
- Süre: 1 hafta cevap

### 2. Teknik Audit

IAB Europe denetçisi şunları kontrol eder:

- `__tcfapi` global fonksiyonun varlığı ve doğru komut yüzeyi (✅ kodda var)
- TC string formatı (Base64URL, doğru segment yapısı) (✅)
- Vendor List senkronizasyonu (GVL fetch) (✅)
- UI'da vendor toggle erişilebilirliği (✅ src/ui/modal.js)
- DSAR (Data Subject Access Request) akışı dokümante edildi mi
- Consent withdrawal her zaman mümkün mü (✅ widget her zaman erişilebilir)

### 3. Ücret

- **Annual fee**: ~€2.000 (CMP boyutuna göre değişir)
- Faturalama: Yıllık peşin

### 4. CMP ID Atama

- Audit geçince IAB Europe bir **numeric CMP ID** atar (örn. `123`)
- Bu ID widget'a yazılır:
  ```html
  <script src="..." data-blakfy-cmp-id="123"></script>
  ```
- ID `0` = preview/test mode (audit öncesi)

### 5. Yıllık Yenileme

- Her yıl re-audit (kod değişikliği varsa)
- Yenileme ücreti aynı

---

## Geliştirici Tarafında Yapılacaklar (kullanıcıya talimat)

```bash
# Sertifikasyon onayı geldiğinde
1. CMP ID'yi al (örn. 123)
2. Site script tag'ine ekle:
   data-blakfy-cmp-id="123"
3. Yeniden deploy.
```

Kütüphane güncellemesi gerekmez — `data-blakfy-cmp-id="0"` (preview) ile `data-blakfy-cmp-id="123"` (prod) arasındaki tek fark TC string'in `cmpId` field'ı.

---

## Preview Mode Davranışı (CMP ID 0)

- `__tcfapi` çalışır
- TC string üretilir ama `cmpId=0`
- Test ortamlarında ve sertifikasyon beklenirken kullanılır
- Production AdSense kullanımı için **uygun değildir** — Google reddeder

---

## Vendor List

- Kaynak: `https://vendor-list.consensu.org/v3/vendor-list.json`
- Boyut: ~500 KB JSON, 1500+ vendor
- Strateji: Lazy fetch + 24 saat cache
- UI'da arama/filtreleme: src/ui/modal.js içinde (vendor toggle paneli)

---

## DSAR (Data Subject Access Request) Akışı

GDPR Art. 15 + 17 gereği kullanıcı:

- Verilerine **erişim** isteyebilir → site sahibi audit log'tan döndürür
- **Silme** isteyebilir → audit log + cookie temizlenir
- **Onay geri çekme** isteyebilir → widget her zaman açık (`BlakfyCookie.open()`)

Site sahibinin yapması gereken:

- `data-blakfy-audit-endpoint` ile DSAR taleplerini sorgulayabileceği bir endpoint kurmak
- Privacy policy sayfasında DSAR talimatları yazmak (örnek README'de)

---

## Maliyet Özeti

| Kalem                            | Yıllık                            |
| -------------------------------- | --------------------------------- |
| IAB Europe sertifikasyon ücreti  | ~€2.000                           |
| Audit hazırlık (developer saati) | bir kerelik, dahil                |
| GVL CDN serving (Cloudflare)     | ücretsiz (consensu.org host eder) |
| **TOPLAM**                       | **~€2.000/yıl**                   |

Eğer site AdSense/Ad Manager kullanmıyorsa **sertifikasyona gerek yok**, kod yine de hazır kalır.
