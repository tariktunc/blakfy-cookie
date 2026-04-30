// blakfy-cookie/scripts/build.js — esbuild driver for cookie.js + cookie-defaults.js with size budget guard

import { build, context } from "esbuild";
import { gzipSync } from "node:zlib";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src");
const DIST = resolve(ROOT, "dist");

const args = new Set(process.argv.slice(2));
const WATCH = args.has("--watch");
const SIZE_CHECK = args.has("--size-check");

const BANNER = `/*!
 * Blakfy Cookie Widget v2.1.0
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
  logLevel: "info"
};

const TARGETS = [
  { entry: resolve(SRC, "index.js"),           outfile: resolve(DIST, "cookie.js"),               minify: false, sourcemap: true  },
  { entry: resolve(SRC, "index.js"),           outfile: resolve(DIST, "cookie.min.js"),           minify: true,  sourcemap: false },
  { entry: resolve(SRC, "cookie-defaults.js"), outfile: resolve(DIST, "cookie-defaults.js"),      minify: false, sourcemap: false },
  { entry: resolve(SRC, "cookie-defaults.js"), outfile: resolve(DIST, "cookie-defaults.min.js"),  minify: true,  sourcemap: false }
];

const BUDGETS = {
  "cookie.min.js":          32 * 1024,   // raised: service-metadata DB + 3-tab modal added
  "cookie-defaults.min.js":  1.5 * 1024
};

const ensureDist = async () => {
  if (!existsSync(DIST)) await mkdir(DIST, { recursive: true });
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
      sourcemap: t.sourcemap
    });
  }
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
      sourcemap: t.sourcemap
    });
    await c.watch();
    ctxs.push(c);
  }
  process.stdout.write("[blakfy] watching " + TARGETS.length + " targets...\n");
};

const fmtKB = (bytes) => (bytes / 1024).toFixed(2) + " KB";

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
    const budget = BUDGETS[name] || null;
    const pass = budget ? gz.length <= budget : true;
    if (!pass) failed = true;
    rows.push({
      file: name,
      raw: fmtKB(buf.length),
      gzip: fmtKB(gz.length),
      budget: budget ? fmtKB(budget) : "-",
      status: budget ? (pass ? "PASS" : "FAIL") : "-"
    });
  }

  process.stdout.write("\n[size-check]\n");
  process.stdout.write("file                       raw         gzip        budget      status\n");
  process.stdout.write("-------------------------- ----------- ----------- ----------- ------\n");
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    process.stdout.write(
      r.file.padEnd(26) + " " +
      r.raw.padEnd(11) + " " +
      r.gzip.padEnd(11) + " " +
      r.budget.padEnd(11) + " " +
      r.status + "\n"
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
  process.stderr.write((err && err.stack) ? err.stack + "\n" : String(err) + "\n");
  process.exit(1);
});
