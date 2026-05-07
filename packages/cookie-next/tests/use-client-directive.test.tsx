/**
 * RSC compat lock: Client-side hook'lar ve component'ler "use client" directive'i ile
 * işaretlenmeli. Aksi halde Next.js App Router Server Component bağlamında
 * `useState`/`useEffect`/`useCallback` çağrıları runtime'da hata fırlatır.
 *
 * Bu test, kaynak dosyaların ilk satırının "use client" directive'i içerdiğini
 * statik olarak doğrular — böylece bir refactor yanlışlıkla directive'i
 * kaldırırsa CI yakalar.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC_DIR = resolve(__dirname, "..", "src");

const readFirstLines = (filename: string, n = 3): string[] => {
  const content = readFileSync(resolve(SRC_DIR, filename), "utf8");
  return content
    .split("\n")
    .slice(0, n)
    .map((l) => l.trim());
};

describe("use client directive lock (RSC compatibility)", () => {
  it("BlakfyCookieProvider.tsx başında 'use client' var", () => {
    const lines = readFirstLines("BlakfyCookieProvider.tsx");
    expect(lines[0]).toBe('"use client";');
  });

  it("useBlakfyConsent.ts başında 'use client' var", () => {
    const lines = readFirstLines("useBlakfyConsent.ts");
    expect(lines[0]).toBe('"use client";');
  });

  it("useGating.ts başında 'use client' var", () => {
    const lines = readFirstLines("useGating.ts");
    expect(lines[0]).toBe('"use client";');
  });

  it("useTcf.ts başında 'use client' var", () => {
    const lines = readFirstLines("useTcf.ts");
    expect(lines[0]).toBe('"use client";');
  });

  it("ConsentModeDefault.tsx 'use client' GEREKMEZ (hook kullanmıyor — Server Component-safe)", () => {
    // ConsentModeDefault sadece <Script dangerouslySetInnerHTML /> render eder
    // useState/useEffect kullanmaz, dolayısıyla server-side render edilebilir
    const lines = readFirstLines("ConsentModeDefault.tsx");
    expect(lines[0]).not.toBe('"use client";');
  });

  it("index.tsx (public entry) 'use client' GEREKMEZ (sadece re-export)", () => {
    const lines = readFirstLines("index.tsx");
    expect(lines[0]).not.toBe('"use client";');
  });

  it("types.ts 'use client' GEREKMEZ (sadece tip tanımları)", () => {
    const lines = readFirstLines("types.ts");
    expect(lines[0]).not.toBe('"use client";');
  });
});
