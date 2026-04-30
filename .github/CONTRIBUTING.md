# Contributing to Blakfy Cookie

Thanks for your interest! This guide covers everything you need to ship a clean PR.

## Setup

```bash
# 1. Fork and clone
git clone https://github.com/<your-user>/blakfy-cookie.git
cd blakfy-cookie

# 2. Install (workspaces — installs root + packages/cookie-next)
npm install

# 3. Run tests (Vitest, jsdom)
npm test

# 4. Build the bundle (esbuild → dist/)
npm run build

# 5. Watch mode for local development
npm run dev
```

Optional:
- `npm run size` — bundle size budget check (core ≤ 22 KB min+gzip)
- `npm run build:next` — build the Next.js wrapper (`packages/cookie-next`)
- `npm run build:all` — both

## Branching

Use a short prefix that matches the change type:

- `feat/<topic>` — new feature
- `fix/<topic>` — bug fix
- `docs/<topic>` — documentation only
- `chore/<topic>` — tooling, deps, build
- `refactor/<topic>` — internal restructure, no behavior change
- `test/<topic>` — tests only

Example: `feat/preset-tiktok`, `fix/tcf-vendor-list`.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Keep the
subject under ~72 chars; use the body for the *why*.

```
feat(presets): add TikTok Pixel preset
fix(tcf): correct TC string vendor consent encoding
docs(readme): clarify SSR-safe loader pattern
chore(deps): bump esbuild to 0.24
refactor(core): extract storage adapter
test(gating): cover dynamically-injected iframes
```

Allowed types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

## Pull Request checklist

Before requesting review, please verify:

- [ ] `npm test` passes locally
- [ ] `npm run build` succeeds
- [ ] `npm run size` is within budget (core ≤ 22 KB min+gzip)
- [ ] `CHANGELOG.md` updated under the upcoming version section
- [ ] No new runtime dependencies without prior discussion in an issue
- [ ] New public API surface has a test and a README/docs entry
- [ ] Screenshots for UI changes (if applicable)

CI runs the same checks via `.github/workflows/test.yml` on every PR.

## Architecture overview

The full module layout, build pipeline, and data flow are documented in
[`ARCHITECTURE.md`](../ARCHITECTURE.md). Quick map:

- `src/core/` — consent engine, storage, events
- `src/compliance/` — TCF v2.2, CCPA/USP, GPC, DNT, jurisdiction
- `src/i18n/` — 23 locales
- `src/ui/` — banner, preferences modal, badge
- `src/gating/` — tag gating, MutationObserver, cleanup
- `src/presets/` — third-party tool presets (GA4, GTM, Pixel, …)
- `src/geo/` — geolocation / jurisdiction detection
- `packages/cookie-next/` — Next.js + React wrapper

## Adding a new preset

Presets live in `src/presets/` and are registered centrally so they can be
loaded via `BlakfyCookie.usePreset(name)`.

1. **Create the file** `src/presets/<name>.js` exporting a preset object with
   `id`, `category`, `cookies`, `storage`, and an `activate(consent)` hook.
2. **Register it** in `src/presets/_registry.js` — add an entry mapping the
   preset id to the module export.
3. **Document it** — add a row to the presets table in `README.md` (id,
   default category, cookies cleaned up).

Add a test in `tests/presets/<name>.test.js` covering activation and the
cleanup path on consent withdrawal.

## Adding a new language

Locales live in `src/i18n/`. Each locale is a flat key/value map of UI strings
keyed by BCP-47 tag.

1. **Create the file** `src/i18n/<bcp47>.js` (e.g. `pl.js`, `pt-BR.js`) — copy
   `src/i18n/en.js` as the template and translate every key. Do not add or
   remove keys.
2. **Register it** in `src/i18n/_index.js` — import and add to the `locales`
   map.
3. **TypeScript types** — extend the `BlakfyLocale` union in
   `packages/cookie-next/src/types.ts` with the new tag.
4. **Document** — add the language to the supported-languages list in
   `README.md`.

If your locale has a regional variant (e.g. `pt` and `pt-BR`), the BCP-47
detector falls back from the more specific tag to the base tag automatically.

## Reporting bugs / requesting features

Open an issue with:
- Reproduction steps or a minimal example
- Browser / Node version, package version (`@blakfy/cookie@x.y.z`)
- Expected vs. actual behavior
- For consent / TCF bugs: jurisdiction, GPC state, and a sanitized TC string
  if available

## Releases

Releases are tag-driven and run from `.github/workflows/release.yml`. See
[`RELEASE.md`](../RELEASE.md) for the operator runbook.

## License

By contributing, you agree your contributions are licensed under the MIT
License (see [`LICENSE`](../LICENSE)).
