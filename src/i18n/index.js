// blakfy-cookie/src/i18n/index.js — aggregates 23 translation modules and exposes lookup with fallback

import tr from "./translations/tr.js";
import en from "./translations/en.js";
import ar from "./translations/ar.js";
import fa from "./translations/fa.js";
import ur from "./translations/ur.js";
import fr from "./translations/fr.js";
import ru from "./translations/ru.js";
import de from "./translations/de.js";
import he from "./translations/he.js";
import uk from "./translations/uk.js";
import es from "./translations/es.js";
import it from "./translations/it.js";
import pt from "./translations/pt.js";
import nl from "./translations/nl.js";
import pl from "./translations/pl.js";
import sv from "./translations/sv.js";
import cs from "./translations/cs.js";
import zh from "./translations/zh.js";
import zhTW from "./translations/zh-TW.js";
import ja from "./translations/ja.js";
import ko from "./translations/ko.js";
import id from "./translations/id.js";
import hi from "./translations/hi.js";

export const DEFAULT_LOCALE = "tr";

export const TRANSLATIONS = {
  tr, en, ar, fa, ur,
  fr, ru, de, he, uk,
  es, it, pt, nl, pl, sv, cs,
  zh, "zh-TW": zhTW, ja, ko,
  id, hi,
};

export const getTranslation = (locale) =>
  TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
