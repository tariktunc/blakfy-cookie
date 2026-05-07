# Release Runbook

Operator-facing guide for cutting a Blakfy Cookie release. Bu repository iki npm paketi yayınlar (`@blakfy/cookie` ve `@blakfy/cookie-next`). Yayın akışı **tag-driven** — tag push'tan sonra GitHub Actions (`.github/workflows/release.yml`) GitHub Release oluşturur ve jsDelivr cache purge eder.

> **Not:** Şu anki workflow npm publish için sadece `@blakfy/cookie-next`'i yayınlıyor. Manuel yayın akışını kullanıyoruz — aşağıda her iki paketi de elle yayınlamayı içeren güncel akış var. Workflow'u iki paket yayınına genişletmek ayrı bir iş (TODO).

## Pre-release checklist

- [ ] Tüm PR'lar `main`'e merge edildi
- [ ] `CHANGELOG.md` yeni `[x.y.z]` bölümü ile güncellendi
- [ ] Sürüm bump'lı:
  - [ ] `package.json` (`version`)
  - [ ] `packages/cookie-next/package.json` (`version`)
  - [ ] `src/api.js` `VERSION` constant
  - [ ] README header (badge + `Versiyon:` satırı + örnek CDN URL'leri)
  - [ ] `examples/` içindeki HTML/PHP CDN URL'leri (önemliyse)
- [ ] Build çalışıyor: `npm run build:all` (esbuild + tsup)
- [ ] Test green: `npm test`
- [ ] Boyut bütçesi: `npm run size` (core ≤ 32 KB)
- [ ] `npm pack --dry-run` (kök) ve `cd packages/cookie-next && npm pack --dry-run` ile tarball içeriği doğrulandı
  - Kök paket için: `dist/`, `status.json`, README, ARCHITECTURE.md, COMPLIANCE.md, TCF-CERTIFICATION.md, MIGRATION.md, CHANGELOG.md, LICENSE
  - cookie-next için: `dist/index.{js,mjs,d.ts,d.mts}`, README

## npm authentication setup (one-time)

Yayın için npm token gerekiyor. **Granular Access Token** öneriliyor (Classic Automation Token yerine):

1. https://www.npmjs.com/settings/<USER>/tokens/granular-access-tokens/new
2. **Token name:** `blakfy-publish-bypass2fa` (veya tercih ettiğin)
3. **Expiration:** 30-90 gün (uzun süreli token önerilmez)
4. **Permissions:**
   - **Packages and scopes:** "Read and write" + scope `@blakfy`
   - **Organizations:** "Read and write" + `blakfy`
5. **Bypass two-factor authentication:** ✅ (otomasyon için)
6. Generate → token'ı kopyala (sadece bir kez gösterilir)
7. Yerel yayın için: `~/.npmrc` dosyasına ekle:
   ```
   //registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxx
   ```
   veya CI için GitHub repo Secrets'a `NPM_TOKEN` adıyla ekle.

Doğrulama: `npm whoami` → kullanıcı adın görünmeli.

## Releasing v2.x.y (current — manual two-package publish)

### Step 1 — Source güncellemeleri

```bash
# Sürümü her yerde bump et
# package.json, packages/cookie-next/package.json, src/api.js VERSION
# CHANGELOG.md'ye yeni bölüm ekle
# README'deki sabit CDN URL örneklerini güncelle (@2.x.y)
```

### Step 2 — Build + dry-run

```bash
npm install                       # ilk kurulum veya lockfile değiştiyse
npm run build:all                 # esbuild + tsup
npm test
npm pack --dry-run                # ana paket içeriği
cd packages/cookie-next
npm pack --dry-run                # cookie-next içeriği
cd ../..
```

### Step 3 — Publish

```bash
# Ana paket
npm publish --access public

# Wrapper paket
cd packages/cookie-next
npm publish --access public
cd ../..
```

Token bypass-2FA ise OTP istenmez. Aksi takdirde `--otp=123456` ekle.

### Step 4 — Commit + tag + push

```bash
git add -u
git commit -m "chore(release): v2.x.y — <ana değişiklik>"
git tag -a v2.x.y -m "Release v2.x.y"
git push origin main
git push origin v2.x.y
```

Pre-release tag'leri (örn. `v2.0.0-alpha.1`) workflow tarafından otomatik prerelease işaretlenir (`-` içerirse).

### Step 5 — GitHub Release

Workflow tag push'tan sonra otomatik release oluşturur (build + body + asset'ler). İçerik genellikle güzel olmaz (CHANGELOG'un tamamını body olarak çeker). Manuel düzeltme:

```bash
gh release edit v2.x.y --title "v2.x.y — <başlık>" --notes-file <(cat <<'EOF'
## Summary
...

## Changed
...

## Notes
...
EOF
)
```

Veya release yoksa oluştur:

```bash
gh release create v2.x.y --title "..." --notes-file ...
```

### Step 6 — Verify

```bash
# npm registry (CLI cache 1-2 dakika gecikebilir)
npm view @blakfy/cookie version
npm view @blakfy/cookie-next version

# CDN
curl -I https://cdn.jsdelivr.net/npm/@blakfy/cookie@2.x.y/dist/cookie.min.js
curl -I https://cdn.jsdelivr.net/npm/@blakfy/cookie@2/dist/cookie.min.js
```

- npm sayfaları:
  - https://www.npmjs.com/package/@blakfy/cookie
  - https://www.npmjs.com/package/@blakfy/cookie-next
- GitHub Release: https://github.com/tariktunc/blakfy-cookie/releases
- Smoke test: `examples/vanilla-html.html` veya `examples/nextjs/` ile real-world test.

### Step 7 — Communicate

- README zaten yayında olan version'ı yansıtmalı (Step 1'de güncellendi).
- Major/minor için duyuru (Twitter / LinkedIn).
- Breaking change varsa `MIGRATION.md` linkle.

## Hotfix / patch process

1. `main`'den fix branch: `git checkout -b fix/<topic>`
2. PR → `main`, CI green sonrası merge
3. Patch version bump (`v2.x.(y+1)`), `CHANGELOG.md` güncel, commit
4. Yukarıdaki Step 2-6 akışını izle (build, publish, tag, release)
5. jsDelivr `@2` semver tag'i yeni patch'i otomatik servise alır (~5-10 dakika cache propagasyon)

## Rolling back

**Tag veya GitHub Release silme** — CDN tüketicilerinin cache'i bozulur, reproducibility kaybedilir.

Bunun yerine:

1. Düzeltmeyi `main`'e land et
2. Yeni patch tag (`v2.x.(y+1)`) at + yayınla
3. `@2` major-pinned jsDelivr URL'i otomatik yeni patch'e geçer

npm üzerinde **`npm unpublish` yapma** — 72 saat içinde mümkün ama topluluk uyarır. Bunun yerine yeni patch'le düzelt. Acil durumda `npm deprecate @blakfy/cookie@2.x.y "<reason>"` ile eskisini deprecate et — kullanıcı hâlâ kurabilir ama uyarı görür.

## TCF v2.2 sertifikasyon

Bkz. [tcf-certification.md](./tcf-certification.md). Sertifikasyon öncesi: `cmpId=0` (preview mode). Sonrası: atanan CMP ID'yi source'a yaz ve site'larda `data-blakfy-cmp-id` attribute'ını güncelle.

## Troubleshooting

- **`npm publish` E403 / 401**: Token yok, scope yetersiz veya 2FA OTP gerekiyor. Granular token'ın `@blakfy` scope read+write olmalı, "Bypass 2FA" işaretli.
- **`npm publish` E409 (conflict)**: Aynı sürüm zaten yayında. Patch bump et, yeniden dene.
- **`npm view` E404 sonra publish**: Registry CDN propagasyonu, 1-2 dakika bekle.
- **jsDelivr eski dosyayı serve ediyor**: jsDelivr CDN cache TTL ~12 saat semver tag'lerde. Force purge:
  ```bash
  curl https://purge.jsdelivr.net/npm/@blakfy/cookie@<version>/dist/cookie.min.js
  ```
- **Release notes boş gözüküyor**: Workflow `body_path: CHANGELOG.md` kullanır → tüm CHANGELOG body'ye düşer. Manuel `gh release edit` ile sürüme özgü içeriği yaz.
- **Pre-release latest olarak işaretlendi**: Tag adında `-` olmalı (`v2.0.0-alpha.1`). Workflow `prerelease: true`'yu otomatik flagler.
- **Workflow `publish-npm` skipped**: `NPM_TOKEN` secret yoksa skip — manuel publish ile kapatılabilir (current default).
