// blakfy-cookie/src/cookie-defaults.js — head-stage entry that installs GCM/UET/Yandex denial defaults

import { installDefaults as installGCM } from "./compliance/google-cmv2.js";
import { installDefaults as installUET } from "./compliance/microsoft-uet.js";
import { installDefaults as installYandex } from "./compliance/yandex-metrica.js";

(function () {
  if (typeof window === "undefined") return;
  if (window.__blakfyConsentDefaultsLoaded) return;
  window.__blakfyConsentDefaultsLoaded = true;
  try { installGCM(); } catch (e) { /* ignore */ }
  try { installUET(); } catch (e) { /* ignore */ }
  try { installYandex(); } catch (e) { /* ignore */ }
})();
