// tests/scripts/generate-sri.test.js — SRI hash generator (#29): correctness + drift guard

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect, beforeAll } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const DIST = resolve(ROOT, "dist");

const sriHash = (buf) => "sha384-" + createHash("sha384").update(buf).digest("base64");

describe("scripts/generate-sri.js", () => {
  beforeAll(() => {
    // dist/ must already be built for this to mean anything; the release runbook
    // always runs `npm run build` before `npm run sri` (see docs/release.md).
    if (!existsSync(resolve(DIST, "cookie.min.js"))) {
      execFileSync("node", [resolve(ROOT, "scripts/build.js")], { cwd: ROOT });
    }
    execFileSync("node", [resolve(ROOT, "scripts/generate-sri.js")], { cwd: ROOT });
  });

  it("writes dist/sri-hashes.json with the current package version", async () => {
    const pkg = JSON.parse(await readFile(resolve(ROOT, "package.json"), "utf8"));
    const out = JSON.parse(await readFile(resolve(DIST, "sri-hashes.json"), "utf8"));
    expect(out.version).toBe(pkg.version);
    expect(Array.isArray(out.files)).toBe(true);
  });

  it("hashes exactly the two head-loaded ESSENTIAL files (defaults + widget)", async () => {
    const out = JSON.parse(await readFile(resolve(DIST, "sri-hashes.json"), "utf8"));
    const names = out.files.map((f) => f.file).sort();
    expect(names).toEqual(["cookie-defaults.min.js", "cookie.min.js"]);
  });

  it("integrity string is a real sha384 base64 digest matching the actual file bytes", async () => {
    const out = JSON.parse(await readFile(resolve(DIST, "sri-hashes.json"), "utf8"));
    for (const entry of out.files) {
      const buf = await readFile(resolve(DIST, entry.file));
      expect(entry.integrity).toBe(sriHash(buf));
      expect(entry.integrity).toMatch(/^sha384-[A-Za-z0-9+/]+=*$/);
    }
  });
});
