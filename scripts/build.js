// blakfy-cookie/scripts/build.js — esbuild driver for cookie.js + cookie-defaults.js with size budget guard

import { existsSync } from "node:fs";
import { readFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, brotliCompressSync, constants as zlibConstants } from "node:zlib";

import { build, context } from "esbuild";

import { REMOTE_LOCALES } from "../src/i18n/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src");
const DIST = resolve(ROOT, "dist");
const I18N_DIST = resolve(DIST, "i18n");

const args = new Set(process.argv.slice(2));
const WATCH = args.has("--watch");
const SIZE_CHECK = args.has("--size-check");

const PKG_VERSION = JSON.parse(await readFile(resolve(ROOT, "package.json"), "utf8")).version;

const BANNER = `/*!
 * Blakfy Cookie Widget v${PKG_VERSION}
 * https://github.com/tariktunc/blakfy-cookie
 * MIT License | (c) Blakfy Studio
 *
 * KVKK + GDPR + CCPA + Google CMv2 + Microsoft UET + Yandex + TCF v2.2 + GPC + DNT
 * 23 languages | 18 presets | Tag-gating | Powered by Blakfy Studio
 */`;

const baseOpts = {
  bundle: true,
  platform: "browser",
  target: ["es2018"],
  format: "iife",
  legalComments: "linked",
  banner: { js: BANNER },
  logLevel: "info",
  // #41: src/core/config.js pins the status.json request to the exact version this
  // bundle was built as, instead of CDN_BASE's floating "@2" major tag.
  define: { __BLAKFY_PKG_VERSION__: JSON.stringify(PKG_VERSION) },
};

const TARGETS = [
  {
    entry: resolve(SRC, "index.js"),
    outfile: resolve(DIST, "cookie.js"),
    minify: false,
    sourcemap: true,
  },
  {
    entry: resolve(SRC, "index.js"),
    outfile: resolve(DIST, "cookie.min.js"),
    minify: true,
    sourcemap: false,
  },
  {
    entry: resolve(SRC, "cookie-defaults.js"),
    outfile: resolve(DIST, "cookie-defaults.js"),
    minify: false,
    sourcemap: false,
  },
  {
    entry: resolve(SRC, "cookie-defaults.js"),
    outfile: resolve(DIST, "cookie-defaults.min.js"),
    minify: true,
    sourcemap: false,
  },
];

const BUDGETS = {
  // #38: tr/en bundled inline, other 21 locales split into dist/i18n/. Raised
  // 32 -> 33 KB in 2.4.1 — the Turkish service-metadata overlay (#55, TR
  // descriptions/purposes/technologies/dataCollected for all 18 presets) pushed the
  // bundled core past 32 KB; a conscious, owner-approved budget move rather than a
  // silent regression.
  "cookie.min.js": 33 * 1024,
  "cookie-defaults.min.js": 1.5 * 1024,
};

// #38: per-locale budget for the code-split dist/i18n/{locale}.min.js chunks. Generous —
// these are fetched at most once per (site, locale) and never touch tr/en visitors at all.
const I18N_CHUNK_BUDGET = 3 * 1024;

// #30 (item 1): budget for the code-split dist/tcf-v2.min.js chunk. Only fetched by sites
// that turn on data-blakfy-tcf="true" — never touches the default visitor.
const TCF_CHUNK_BUDGET = 3 * 1024;

const ensureDist = async () => {
  if (!existsSync(DIST)) await mkdir(DIST, { recursive: true });
  if (!existsSync(I18N_DIST)) await mkdir(I18N_DIST, { recursive: true });
};

// #38: build one dist/i18n/{locale}.min.js chunk per remote locale. Each chunk imports only
// its own translation module and registers it on window.__blakfyI18n — src/i18n/index.js's
// loadTranslation() injects a <script src> pointing at these files as siblings of the main
// bundle, only for a locale that isn't tr/en.
const buildI18nChunks = async () => {
  for (let i = 0; i < REMOTE_LOCALES.length; i++) {
    const locale = REMOTE_LOCALES[i];
    const translationPath = resolve(SRC, "i18n/translations", locale + ".js").replace(/\\/g, "/");
    const stdinContents =
      'import t from "' +
      translationPath +
      '";\n' +
      "window.__blakfyI18n = window.__blakfyI18n || {};\n" +
      'window.__blakfyI18n["' +
      locale +
      '"] = t;\n';
    await build({
      stdin: {
        contents: stdinContents,
        resolveDir: SRC,
        sourcefile: locale + "-i18n-entry.js",
        loader: "js",
      },
      bundle: true,
      platform: "browser",
      target: ["es2018"],
      format: "iife",
      minify: true,
      sourcemap: false,
      logLevel: "silent",
      outfile: resolve(I18N_DIST, locale + ".min.js"),
    });
  }
  process.stdout.write(
    "[i18n]     " + REMOTE_LOCALES.length + " remote locale chunks -> dist/i18n/\n"
  );
};

// #30 (item 1): build the code-split dist/tcf-v2.min.js chunk. Registers its exports on
// window.__blakfyTCF — src/compliance/tcf-loader.js injects a <script src> pointing at this
// file as a sibling of the main bundle's own <script src>, only when a site opts in.
const buildTCFChunk = async () => {
  const tcfPath = resolve(SRC, "compliance/tcf-v2.js").replace(/\\/g, "/");
  const stdinContents =
    'import { installTCFAPI, getTCString } from "' +
    tcfPath +
    '";\n' +
    "window.__blakfyTCF = { installTCFAPI: installTCFAPI, getTCString: getTCString };\n";
  await build({
    stdin: {
      contents: stdinContents,
      resolveDir: SRC,
      sourcefile: "tcf-v2-entry.js",
      loader: "js",
    },
    bundle: true,
    platform: "browser",
    target: ["es2018"],
    format: "iife",
    minify: true,
    sourcemap: false,
    logLevel: "silent",
    outfile: resolve(DIST, "tcf-v2.min.js"),
  });
  process.stdout.write("[tcf]      1 code-split chunk -> dist/tcf-v2.min.js\n");
};

const copyTypes = async () => {
  const src = resolve(SRC, "types.d.ts");
  const dst = resolve(DIST, "cookie.d.ts");
  if (existsSync(src)) {
    await copyFile(src, dst);
    process.stdout.write("[types]    cookie.d.ts (copied from src/types.d.ts)\n");
  }
};

const buildAll = async () => {
  await ensureDist();
  for (let i = 0; i < TARGETS.length; i++) {
    const t = TARGETS[i];
    await build({
      ...baseOpts,
      entryPoints: [t.entry],
      outfile: t.outfile,
      minify: t.minify,
      sourcemap: t.sourcemap,
    });
  }
  await buildI18nChunks();
  await buildTCFChunk();
  await copyTypes();
};

const watchAll = async () => {
  await ensureDist();
  const ctxs = [];
  for (let i = 0; i < TARGETS.length; i++) {
    const t = TARGETS[i];
    const c = await context({
      ...baseOpts,
      entryPoints: [t.entry],
      outfile: t.outfile,
      minify: t.minify,
      sourcemap: t.sourcemap,
    });
    await c.watch();
    ctxs.push(c);
  }
  await buildI18nChunks(); // #38: remote locale chunks aren't watched, just built once up front
  await buildTCFChunk(); // #30: same — not watched, built once up front
  process.stdout.write("[blakfy] watching " + TARGETS.length + " targets...\n");
};

const fmtKB = (bytes) => (bytes / 1024).toFixed(2) + " KB";

// #30 (item 1): quality 11 matches what a CDN/host precompresses at build/publish time
// (Vercel, Cloudflare, most static hosts) — not a runtime cost paid per-request.
const brotli = (buf) =>
  brotliCompressSync(buf, {
    params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
  });

const sizeCheck = async () => {
  const rows = [];
  let failed = false;
  const files = ["cookie.js", "cookie.min.js", "cookie-defaults.js", "cookie-defaults.min.js"];
  for (let i = 0; i < files.length; i++) {
    const name = files[i];
    const p = resolve(DIST, name);
    if (!existsSync(p)) continue;
    const buf = await readFile(p);
    const gz = gzipSync(buf);
    const br = brotli(buf);
    const budget = BUDGETS[name] || null;
    // Budget is enforced against gzip only (matches the README's "~30KB gz" claim and the
    // existing CI gate) — brotli is reported for visibility, not gated, since not every host
    // serves brotli.
    const pass = budget ? gz.length <= budget : true;
    if (!pass) failed = true;
    rows.push({
      file: name,
      raw: fmtKB(buf.length),
      gzip: fmtKB(gz.length),
      brotli: fmtKB(br.length),
      budget: budget ? fmtKB(budget) : "-",
      status: budget ? (pass ? "PASS" : "FAIL") : "-",
    });
  }

  process.stdout.write("\n[size-check]\n");
  process.stdout.write(
    "file                       raw         gzip        brotli      budget      status\n"
  );
  process.stdout.write(
    "-------------------------- ----------- ----------- ----------- ----------- ------\n"
  );
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    process.stdout.write(
      r.file.padEnd(26) +
        " " +
        r.raw.padEnd(11) +
        " " +
        r.gzip.padEnd(11) +
        " " +
        r.brotli.padEnd(11) +
        " " +
        r.budget.padEnd(11) +
        " " +
        r.status +
        "\n"
    );
  }

  // #38: also check every remote i18n chunk against a per-locale budget, so a translation
  // file bloating out doesn't silently defeat the point of splitting it out.
  if (existsSync(I18N_DIST)) {
    for (let i = 0; i < REMOTE_LOCALES.length; i++) {
      const locale = REMOTE_LOCALES[i];
      const p = resolve(I18N_DIST, locale + ".min.js");
      if (!existsSync(p)) continue;
      const buf = await readFile(p);
      const gz = gzipSync(buf);
      const pass = gz.length <= I18N_CHUNK_BUDGET;
      if (!pass) failed = true;
      process.stdout.write(
        ("i18n/" + locale + ".min.js").padEnd(26) +
          " " +
          fmtKB(buf.length).padEnd(11) +
          " " +
          fmtKB(gz.length).padEnd(11) +
          " " +
          fmtKB(brotli(buf).length).padEnd(11) +
          " " +
          fmtKB(I18N_CHUNK_BUDGET).padEnd(11) +
          " " +
          (pass ? "PASS" : "FAIL") +
          "\n"
      );
    }
  }

  // #30 (item 1): the code-split TCF chunk — fetched only by sites with data-blakfy-tcf="true".
  const tcfPath = resolve(DIST, "tcf-v2.min.js");
  if (existsSync(tcfPath)) {
    const buf = await readFile(tcfPath);
    const gz = gzipSync(buf);
    const pass = gz.length <= TCF_CHUNK_BUDGET;
    if (!pass) failed = true;
    process.stdout.write(
      "tcf-v2.min.js".padEnd(26) +
        " " +
        fmtKB(buf.length).padEnd(11) +
        " " +
        fmtKB(gz.length).padEnd(11) +
        " " +
        fmtKB(brotli(buf).length).padEnd(11) +
        " " +
        fmtKB(TCF_CHUNK_BUDGET).padEnd(11) +
        " " +
        (pass ? "PASS" : "FAIL") +
        "\n"
    );
  }

  if (failed) {
    process.stderr.write("\n[size-check] one or more bundles exceeded budget\n");
    process.exit(1);
  }
};

const run = async () => {
  if (WATCH) {
    await watchAll();
    return;
  }
  await buildAll();
  if (SIZE_CHECK) await sizeCheck();
};

run().catch((err) => {
  process.stderr.write(err && err.stack ? err.stack + "\n" : String(err) + "\n");
  process.exit(1);
});
