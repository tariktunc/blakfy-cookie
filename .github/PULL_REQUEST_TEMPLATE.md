<!-- Lütfen PR'ınızı açıklayın. Boş bırakılan başlıklar inceleme yavaşlatabilir. -->

## Özet

<!-- 1-3 cümlede ne değişti, neden? -->

## Tip

<!-- Uygulanabilenleri işaretleyin -->

- [ ] 🐛 Bug fix (mevcut davranışı değiştirmeyen düzeltme)
- [ ] ✨ Feature (yeni özellik)
- [ ] 💥 Breaking change (mevcut API'yi değiştiren düzenleme)
- [ ] 📝 Docs (yalnızca dokümantasyon)
- [ ] 🔧 Build / CI / DevOps
- [ ] ⚡️ Performance
- [ ] 🧪 Test (yalnızca test ekleme/düzenleme)

## React / Next.js uyumluluğu

<!-- @blakfy/cookie-next'i etkiliyorsa bunlar gözden geçirilmeli -->

- [ ] React 18 ve 19 ile test edildi
- [ ] Next.js 14 ve 15 ile test edildi (App Router)
- [ ] Pages Router uyumluluğu doğrulandı (gerektiğinde)
- [ ] SSR-safe (hydration mismatch yok)
- [ ] Provider'da `"use client"` directive korundu (RSC sınırı)
- [ ] FOUC riski yok (`next/script beforeInteractive` ile)
- [ ] N/A (Next/React'i etkilemiyor)

## Compliance etkisi

<!-- Yasal uyumluluk modüllerini etkiliyor mu? -->

- [ ] GDPR / ePrivacy
- [ ] KVKK
- [ ] CCPA / CPRA
- [ ] Google Consent Mode v2
- [ ] Microsoft UET
- [ ] IAB TCF v2.2
- [ ] N/A

## Test planı

<!-- Nasıl doğrulandı? -->

- [ ] `npm test` 97/97+ PASS
- [ ] `npm run lint` 0 error
- [ ] `npm run build:all` temiz
- [ ] Bundle size (`npm run size`) limitlerin altında
- [ ] Manuel smoke test: \***\*\_\_\_\_\*\***

## Changeset

<!-- Yayın için changeset eklendi mi? -->

- [ ] `npx changeset` ile entry oluşturuldu
- [ ] N/A (docs/CI/test only — sürüm bump gerekmiyor)

## Ek notlar

<!-- Reviewer'ın bilmesi gereken her şey: known limitations, follow-up issues, vs -->
