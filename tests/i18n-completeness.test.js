// blakfy-cookie/tests/i18n-completeness.test.js
// 23 dil arasında key parity testi: tr.js baseline alınır, tüm diğer diller
// aynı key set'ine sahip olmalı. Yeni özellik için tr'ye key eklendiğinde
// 22 dile eklemek unutulursa bu test fail eder ve eksik key'leri raporlar.

import { describe, it, expect } from "vitest";

import { TRANSLATIONS, DEFAULT_LOCALE } from "../src/i18n/index.js";

/**
 * Bir objenin tüm key path'lerini recursive olarak çıkarır.
 * Örn: { a: { b: 1 } } → ["a.b"]
 * Array veya primitive değerler için path döner ama içine girmez.
 */
const flattenKeys = (obj, prefix = "") => {
  const keys = [];
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return keys;
  for (const k of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    keys.push(path);
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      keys.push(...flattenKeys(obj[k], path));
    }
  }
  return keys;
};

const baselineKeys = new Set(flattenKeys(TRANSLATIONS[DEFAULT_LOCALE]));

describe("i18n completeness — tr.js baseline parity", () => {
  it(`baseline (${DEFAULT_LOCALE}) has at least 30 keys`, () => {
    expect(baselineKeys.size).toBeGreaterThanOrEqual(30);
  });

  const locales = Object.keys(TRANSLATIONS).filter((l) => l !== DEFAULT_LOCALE);

  for (const locale of locales) {
    it(`${locale} has all baseline keys (no missing)`, () => {
      const localeKeys = new Set(flattenKeys(TRANSLATIONS[locale]));
      const missing = [];
      for (const k of baselineKeys) {
        if (!localeKeys.has(k)) missing.push(k);
      }
      expect(missing, `${locale} eksik ${missing.length} key: ${missing.join(", ")}`).toEqual([]);
    });
  }

  for (const locale of locales) {
    it(`${locale} has no extra keys (drift detection)`, () => {
      const localeKeys = new Set(flattenKeys(TRANSLATIONS[locale]));
      const extra = [];
      for (const k of localeKeys) {
        if (!baselineKeys.has(k)) extra.push(k);
      }
      // Extra key tolere edilebilir (locale-specific) ama yine de raporla
      // Strict olmadığı için sadece warning seviyesinde — şimdilik fail etmiyor
      if (extra.length > 0) {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] ${locale} ekstra key(ler): ${extra.join(", ")}`);
      }
      expect(extra.length).toBeLessThanOrEqual(5); // makul tolerans
    });
  }
});
