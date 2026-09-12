// blakfy-cookie/tests/i18n-completeness.test.js
// 23 dil arasında key parity testi: tr.js baseline alınır, tüm diğer diller
// aynı key set'ine sahip olmalı. Yeni özellik için tr'ye key eklendiğinde
// 22 dile eklemek unutulursa bu test fail eder ve eksik key'leri raporlar.

import { describe, it, expect } from "vitest";

import { DEFAULT_LOCALE } from "../src/i18n/index.js";

// #38 note: src/i18n/index.js's TRANSLATIONS only holds the two bundled locales (tr, en) —
// the other 21 now ship as code-split dist/i18n/{locale}.min.js chunks (see i18n/index.js
// and scripts/build.js). This test's whole point is key-parity across ALL 23 languages, so
// it imports every translation module directly here, bypassing the runtime split entirely.
import ar from "../src/i18n/translations/ar.js";
import cs from "../src/i18n/translations/cs.js";
import de from "../src/i18n/translations/de.js";
import en from "../src/i18n/translations/en.js";
import es from "../src/i18n/translations/es.js";
import fa from "../src/i18n/translations/fa.js";
import fr from "../src/i18n/translations/fr.js";
import he from "../src/i18n/translations/he.js";
import hi from "../src/i18n/translations/hi.js";
import idLocale from "../src/i18n/translations/id.js";
import itLocale from "../src/i18n/translations/it.js";
import ja from "../src/i18n/translations/ja.js";
import ko from "../src/i18n/translations/ko.js";
import nl from "../src/i18n/translations/nl.js";
import pl from "../src/i18n/translations/pl.js";
import pt from "../src/i18n/translations/pt.js";
import ru from "../src/i18n/translations/ru.js";
import sv from "../src/i18n/translations/sv.js";
import tr from "../src/i18n/translations/tr.js";
import uk from "../src/i18n/translations/uk.js";
import ur from "../src/i18n/translations/ur.js";
import zhTW from "../src/i18n/translations/zh-TW.js";
import zh from "../src/i18n/translations/zh.js";

const TRANSLATIONS = {
  tr,
  en,
  ar,
  cs,
  de,
  es,
  fa,
  fr,
  he,
  hi,
  id: idLocale,
  it: itLocale,
  ja,
  ko,
  nl,
  pl,
  pt,
  ru,
  sv,
  uk,
  ur,
  zh,
  "zh-TW": zhTW,
};

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
        console.warn(`[i18n] ${locale} ekstra key(ler): ${extra.join(", ")}`);
      }
      expect(extra.length).toBeLessThanOrEqual(5); // makul tolerans
    });
  }
});
