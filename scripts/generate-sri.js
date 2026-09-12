// blakfy-cookie/scripts/generate-sri.js — SRI (Subresource Integrity) hash generator (#29)
//
// Computes the sha384 integrity hash for every published CDN artifact and writes
// dist/sri-hashes.json alongside a human-readable table on stdout. Run this AFTER
// `npm run build` and BEFORE tagging a release, so the hashes always match the
// artifact actually published — never hand-typed, never allowed to drift.
//
// Usage: node scripts/generate-sri.js

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");

// Only the files documented in the README install snippet get a published hash —
// these are the ones that run with ESSENTIAL/highest privilege in <head>.
const FILES = ["cookie-defaults.min.js", "cookie.min.js"];

const sriHash = (buf) => "sha384-" + createHash("sha384").update(buf).digest("base64");

const main = async () => {
  const pkg = JSON.parse(await readFile(resolve(ROOT, "package.json"), "utf8"));
  const version = pkg.version;

  const results = [];
  for (const file of FILES) {
    const filePath = resolve(DIST, file);
    if (!existsSync(filePath)) {
      console.error(
        `[generate-sri] MISSING: ${file} — run "npm run build" first, then re-run this script.`
      );
      process.exitCode = 1;
      continue;
    }
    const buf = await readFile(filePath);
    results.push({ file: file, integrity: sriHash(buf), bytes: buf.length });
  }

  if (process.exitCode === 1) return;

  const out = {
    version: version,
    generatedAt: new Date().toISOString(),
    files: results,
  };

  await writeFile(resolve(DIST, "sri-hashes.json"), JSON.stringify(out, null, 2) + "\n");

  console.log(`\nSRI hashes for @blakfy/cookie@${version} (dist/sri-hashes.json written)\n`);
  for (const r of results) {
    console.log(`  ${r.file}`);
    console.log(`    integrity="${r.integrity}"`);
  }
  console.log(
    "\nPaste these into the README install snippet, the release notes, and " +
      "docs/compliance.md §13 before publishing — a version bump without a matching " +
      "hash update is a broken release, not a documentation gap.\n"
  );
};

main();
