# Platform Setup Guides

> Her platformda aynı iki adım var: (1) Blakfy script'lerini `<head>`/`</body>` öncesine ekle, (2) o platformun **kendi native pazarlama entegrasyon panelini** kontrol et — GA4/FB Pixel/vb. oradan da bağlıysa Blakfy'nin gating'ini bypass eder. Kurulumdan sonra `window.BlakfyCookie.getLeaks()` ile doğrula.

---

## Wix

**Doğrulandı — canlı sitede test edildi (senelli.com, 2026-07).**

1. Wix Editor → Settings → **Custom Code** → yeni kod ekle:
   - Head: `cookie-defaults.min.js`
   - Body end: `cookie.min.js` (+ `data-blakfy-presets`)
   - Kategori olarak **"Temel"/Essential** seç — Wix'in kendi kategori sistemi asıl gating'i yapmıyor, sadece HTML'i her zaman ekleyip eklememesini kontrol ediyor. Gerçek kilit Blakfy'nin `type="text/plain"` mekanizması.
2. **Native entegrasyonu kapat — İKİ ayrı yerde kontrol et:**
   - Marketing & SEO → **Marketing Integrations** panelinden GA4/FB Pixel bağlantısını kaldır.
   - Ayrıca ayrı bir **Marketing Tags API** katmanı var (`marketing/v1/tags`) — panelden kaldırmak buraya işlemeyebilir, bu da ayrıca kontrol edilip silinmeli. (Bunu bulmak bize bir tam günümüzü aldı — panel-only kontrolüne güvenme.)
3. GA4/FB Pixel verisini kaybetmemek için: yeni bir Custom Code snippet'i olarak, senin GA4 ölçüm ID / Pixel ID'nle, `type="text/plain" data-blakfy-category="analytics|marketing"` sarmalı script ekle (örnek: README → "Tag-Gating" bölümü).
4. **Facebook Server Side Events (Conversions API)** gibi ayrı bir Wix app'i kurulu olabilir — bu server-side olduğu için Blakfy hiç göremez, ayrıca elle kontrol/gate edilmeli.
5. Wix Stores kullanıyorsan native GA4 entegrasyonunu kaldırmak, Wix'in otomatik ecommerce event'lerini (purchase, add_to_cart) de kaybettirir — Blakfy'nin `ga4` preset'i şu an bu event'leri **karşılamıyor** (sadece cookie/host metadata'sı, otomatik injection yok). E-ticaret sitesi öncesi bunu ayrıca çöz.

---

## İkas

**Doğrulanmadı — sadece kamuya açık destek dokümanlarından, canlı test yapılmadı.**

İkas'ta da Wix'e benzer iki ayrı yüzey var:

1. **Native entegrasyon paneli:** Satış Kanalları → Eklentiler → Google Analytics / Facebook Pixel / GTM — buraya girilen ID'ler İkas'ın kendi runtime'ı tarafından yönetilir, Blakfy'den bağımsız.
2. **Tema özel kod alanı:** Sales Channels → Online Store → Themes → tema dosyası → `<head>` içine manuel kod ekleme (Blakfy'nin script'leri buraya gider).
3. İkas resmi dokümantasyonu "GTM ile panelden GA kodu aynı anda eklemeyin, çift entegrasyondan kaçının" diye uyarıyor — bu, panelin ve manuel kodun **aynı anda, birbirinden habersiz** çalışabildiğini doğruluyor (Wix'teki gibi).
4. **Rollout öncesi mutlaka:** Blakfy kurulumundan sonra reddet + `getLeaks()` / Network sekmesi ile native panelden bağlı bir şey kalıp kalmadığı kontrol edilmeli — Wix'te panel-only kontrolü yetmemişti, İkas'ta da aynı riski varsay.

Kaynaklar: [support.ikas.com — Google, Facebook ve Diğer Entegrasyonlar](https://support.ikas.com/tr/google-facebook-ve-di%C4%9Fer-entegrasyonlar), [support.ikas.com — Eklentiler](https://support.ikas.com/tr/eklentiler)

---

## Ticimax

**Doğrulanmadı — sadece kamuya açık destek dokümanlarından, canlı test yapılmadı.**

1. **Native entegrasyon paneli:** Digital Marketing → General Settings — GA4, Google Ads, Meta Pixel, Yandex Metrica buradan tek tıkla bağlanabiliyor.
2. **Script Yönetimi modülü:** site geneline veya belirli sayfalara özel kod eklemek için ayrı bir alan — Blakfy'nin script'leri buraya gider. GTM burada checkout dahil tüm sayfalarda çalışıyor (bazı platformlarda checkout'ta 3. parti script engellenir, Ticimax'ta engellenmiyor — bu Blakfy açısından iyi, gating orada da işleyebilir demek, ama doğrulanmadı).
3. Aynı çift-yüzey riski geçerli: General Settings'ten bağlanan bir GA4/Pixel, Script Yönetimi'ndeki Blakfy kurulumundan habersiz çalışır.
4. Rollout öncesi aynı native-kontrol adımı zorunlu.

Kaynaklar: [destekalani.com — Script Yönetimi](https://www.destekalani.com/Icerik/script-yonetimi-381), [ticimax.com — Meta Pixel Nedir](https://www.ticimax.com/blog/meta-pixel-nedir)

---

## Shopify

**Doğrulanmadı — genel platform bilgisi, canlı test yapılmadı.**

1. `theme.liquid` dosyasının `<head>` ve `</body>` öncesine Blakfy'nin 3 adımını ekle (bkz. README → Senaryolar).
2. Native kontrol noktası: **Online Store → Preferences** (Facebook Pixel, Google Analytics burada legacy olarak bağlanabiliyordu) ve **Settings → Customer events / Web pixels** (Shopify'ın yeni "Customer Events" API'si) — ikisi de ayrı ayrı kontrol edilmeli.
3. Shopify'ın "Web Pixels" API'si sandboxed çalışır ve kendi consent API'sine (`customerPrivacy`) sahiptir — Blakfy'nin `type="text/plain"` mekanizmasıyla doğrudan uyumlu değildir, ayrı bir köprü/araştırma gerekir.

---

## WordPress

**Doğrulanmadı — genel platform bilgisi.**

1. `functions.php` (`wp_head`/`wp_footer` hook'ları) veya bir "header/footer script" eklentisi ile Blakfy'nin 3 adımını ekle.
2. Native kontrol noktası: kurulu SEO/Analytics eklentileri (Yoast, MonsterInsights, Site Kit, PixelYourSite vb.) — bunlar genellikle KENDİ consent/cookie yönetimi sunar ve Blakfy ile çakışabilir. İkisini birden aktif tutma; ya eklentinin native trackingini kapat ya da Blakfy'yi devre dışı bırak.

---

## Genel kural (her platform için)

Bir platforma Blakfy kurduktan sonra, yayına almadan önce:

1. Çerezi temizle, sayfayı taze aç, `document.cookie` içinde consent kaydı olmadığını doğrula.
2. `window.BlakfyCookie.getLeaks()` çağır — boş dönmeli.
3. DevTools → Network → "Reddet"e bas, sayfayı yenile — GA4/FB/vb. domain'lerine istek gitmediğini doğrula.
4. "Kabul Et"e bas, aynı isteklerin şimdi gittiğini doğrula.

Bu 4 adım olmadan "kuruldu" demek yetmez — panel-only kontrolü Wix'te bizi yanılttı.
