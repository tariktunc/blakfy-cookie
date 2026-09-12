# OSS Architecture Reference (issue #33)

> Perspective only. No code copied from either project — WebForge policy: OSS is read for ideas,
> never pasted, because quality/licence terms are not something we can vouch for wholesale.

Source projects read for this analysis (measured 2026-09-12):

| Project                  | Stars | Licence | Latest release       | Commits/52wk |
| ------------------------ | ----- | ------- | -------------------- | ------------ |
| AmauriC/tarteaucitron.js | 1,055 | MIT     | v1.34.0 (2026-07-03) | 60           |
| orestbida/cookieconsent  | 5,668 | MIT     | v3.1.0 (2025-02-04)  | 10           |
| kiprotect/klaro          | 1,510 | unclear | none                 | 0 (dead)     |
| osano/cookieconsent      | 3,576 | MIT     | 3.1.1 (2019)         | 0 (dead)     |

Only the first two are actively maintained; klaro and osano/cookieconsent are reference-only,
not adoption candidates.

## Six patterns identified, and their disposition

| #   | Pattern                                                            | Source                                                                    | Disposition                                                          |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Multi-scope cookie deletion (3 domain scopes)                      | tarteaucitron                                                             | Landed — fixes #25 (`fix(cleaner): public-suffix-aware root domain`) |
| 2   | Cookie list lives on the service definition, not a separate array  | tarteaucitron                                                             | Landed — fixes #37 (service catalogue), closed                       |
| 3   | Theme as CSS custom properties only, one `.darkmode` class         | cookieconsent                                                             | Landed — fixes #23 (light theme regression)                          |
| 4   | Shadow DOM isolation from host page CSS                            | Wix/Usercentrics CMP (in-house precedent: `@blakfy/accessibility-widget`) | Tracked as #35 — NOT done this pass, see report                      |
| 5   | Declarative tag gating via `type="text/plain"` + `data-category`   | tarteaucitron                                                             | Landed — fixes #36, closed                                           |
| 6   | Re-assert categories on every consent update, not just first grant | cookieconsent                                                             | Landed — fixes #24                                                   |

## Not adopted, and why

- **osano/cookieconsent's IAB TCF vendor list auto-sync** — dead project, no security patches since
  2020; we already run our own TCF v2.2 layer (`src/compliance/tcf-v2.js`) and do not want an
  unmaintained dependency in the compliance path.
- **klaro's app-manifest YAML config** — config surface duplicate of our own preset system
  (`src/presets/`); adopting it would mean maintaining two parallel service-declaration formats.
- **tarteaucitron's inline `<style>` per-service theming** — supersede by our own single
  `--blakfy-*` custom-property surface (pattern 3); a per-service style tag is more surface area
  for host-page CSP conflicts (see #29), not less.

## Open follow-ups this reference produced

- #35 — Shadow DOM isolation (pattern 4). Architectural, touches banner/modal/badge/status-bar/
  focus-trap/styles + the bootstrap in `src/index.js`. Requires a dedicated pass — not done in
  this iteration, see the delivery report for what would need to change and why it was not
  attempted as a partial patch.
- #34 — reopen FAB. Independent of Shadow DOM in principle (can render in light DOM first, move
  into the shadow root later), tracked separately.

This document is descriptive of decisions already made across #23–#37; it does not itself
introduce new behavior.
