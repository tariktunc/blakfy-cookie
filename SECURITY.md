# Security Policy

## Supported Versions

Aşağıdaki sürümler güvenlik düzeltmeleri alır:

| Version | Supported                 | End of life |
| ------- | ------------------------- | ----------- |
| 2.1.x   | ✅ Aktif desteklenir      | TBD         |
| 2.0.x   | ⚠️ Sadece kritik (90 gün) | 2026-08-07  |
| < 2.0   | ❌ Desteklenmez           | —           |

`@blakfy/cookie` ve `@blakfy/cookie-next` paketleri aynı sürüm matrisini takip eder.

## Reporting a Vulnerability

Bir güvenlik açığı bulduğunda **lütfen public GitHub issue açma**. Bunun yerine:

📧 **E-posta:** security@blakfy.com

Aşağıdaki bilgileri eklersen yararlı olur:

- Açığın tipi (XSS, prototype pollution, supply chain, vb.)
- Etkilenen sürüm(ler)
- Reproducible test case veya proof-of-concept
- Potansiyel etki alanı

## Response Timeline

| Süre    | Aksiyon                                        |
| ------- | ---------------------------------------------- |
| 72 saat | İlk yanıt + onay (alındı / inceleniyor)        |
| 7 gün   | Açığın doğrulanması ve severity scoring (CVSS) |
| 30 gün  | Kritik / yüksek öncelik için yama yayını       |
| 90 gün  | Public disclosure (yamadan sonra)              |

Coordinated disclosure tercih edilir. Bildirimi yapan araştırmacıların isimleri (rıza dahilinde) yama notlarında credit edilir.

## Out of Scope

Bu paket bir **çerez izni / consent management** widget'ıdır. Aşağıdakiler güvenlik bug'ı olarak değerlendirilmez:

- Sosyal mühendislik / phishing senaryoları (paket sınırının dışında)
- HTTP başlık eksiklikleri (site sahibinin sorumluluğu — CSP, HSTS, vs.)
- DDoS veya rate-limit eksikliği (bizim altyapı değil — CDN sağlayıcı)
- HIPAA / PCI-DSS / FERPA gibi düzenlemelerin "implementation gap"i (README → "Out of Scope" bölümü)

## Hall of Fame

Güvenlik araştırmacılarına teşekkür listesi (henüz boş — ilk olabilirsin 🎯).

---

**Coordination:** Anthropic'in [Coordinated Vulnerability Disclosure](https://anthropic.com/responsible-disclosure) yaklaşımına benzer bir politika uyguluyoruz.
