/**
 * Pages Router uyumluluk: BlakfyCookieProvider hem App Router hem Pages Router
 * ile çalışmalı. Bunun için Provider'ın router-spesifik API'lere bağımlılığı
 * olmaması gerekir (next/router VEYA next/navigation import etmemeli).
 *
 * Bu test statik olarak source dosyalarını analiz eder.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC_DIR = resolve(__dirname, "..", "src");

const readSource = (filename: string): string => readFileSync(resolve(SRC_DIR, filename), "utf8");

describe("Pages Router uyumluluk (router-agnostic)", () => {
  const sourceFiles = [
    "BlakfyCookieProvider.tsx",
    "ConsentModeDefault.tsx",
    "useBlakfyConsent.ts",
    "useGating.ts",
    "useTcf.ts",
    "index.tsx",
  ];

  it.each(sourceFiles)("%s does NOT import next/router (Pages Router-only API)", (file) => {
    const src = readSource(file);
    expect(src).not.toMatch(/from\s+["']next\/router["']/);
  });

  it.each(sourceFiles)("%s does NOT import next/navigation (App Router-only API)", (file) => {
    const src = readSource(file);
    expect(src).not.toMatch(/from\s+["']next\/navigation["']/);
  });

  it.each(sourceFiles)("%s does NOT use next/headers (Server Components only)", (file) => {
    const src = readSource(file);
    expect(src).not.toMatch(/from\s+["']next\/headers["']/);
  });

  it("BlakfyCookieProvider only imports next/script (router-agnostic)", () => {
    const src = readSource("BlakfyCookieProvider.tsx");
    const nextImports = src.match(/from\s+["']next\/[^"']+["']/g) || [];
    expect(nextImports).toEqual(['from "next/script"']);
  });

  it("ConsentModeDefault only imports next/script", () => {
    const src = readSource("ConsentModeDefault.tsx");
    const nextImports = src.match(/from\s+["']next\/[^"']+["']/g) || [];
    expect(nextImports).toEqual(['from "next/script"']);
  });

  it("hooks (useBlakfyConsent, useGating, useTcf) do NOT import any next/* (work in plain React too)", () => {
    const hookFiles = ["useBlakfyConsent.ts", "useGating.ts", "useTcf.ts"];
    for (const file of hookFiles) {
      const src = readSource(file);
      const nextImports = src.match(/from\s+["']next\/[^"']+["']/g) || [];
      expect(nextImports, `${file} importing next/*`).toEqual([]);
    }
  });
});
