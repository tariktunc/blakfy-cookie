// blakfy-cookie/src/gating/leak-detector.js — detects known tracker scripts running outside Blakfy's own gating
//
// Platform-native integrations (e.g. Wix Marketing Tags, Shopify "Online Store Preferences",
// a CMS's own analytics connector) can inject the same trackers Blakfy manages, but bypass
// the type="text/plain" gate entirely. Blakfy has no way to block those — this module only
// detects and reports them so the site owner knows to go disable the platform-native copy.

const isOwnUnblocked = (el) => el.getAttribute("data-blakfy-unblocked") === "true";

export const scanForLeaks = ({ activePresetNames, presets, getConsent }) => {
  if (typeof document === "undefined" || !Array.isArray(activePresetNames)) return [];

  const leaks = [];
  const scripts = document.querySelectorAll("script[src]");

  for (let i = 0; i < activePresetNames.length; i++) {
    const preset = presets[activePresetNames[i]];
    const hosts = preset && preset.scriptHosts;
    if (!preset || !hosts || !hosts.length) continue;

    for (let j = 0; j < scripts.length; j++) {
      const el = scripts[j];
      if (isOwnUnblocked(el)) continue;
      const src = el.src || "";

      for (let k = 0; k < hosts.length; k++) {
        if (src.indexOf(hosts[k]) === -1) continue;
        leaks.push({
          preset: activePresetNames[i],
          name: preset.name,
          host: hosts[k],
          src: src,
          category: preset.category,
          consentGranted: typeof getConsent === "function" ? !!getConsent(preset.category) : null,
        });
        break;
      }
    }
  }

  return leaks;
};

export const warnLeaks = (leaks) => {
  if (!Array.isArray(leaks) || !leaks.length) return;
  if (typeof console === "undefined" || typeof console.warn !== "function") return;

  for (let i = 0; i < leaks.length; i++) {
    const l = leaks[i];
    console.warn(
      "[Blakfy Cookie] Un-gated tracker detected: " +
        l.name +
        " (" +
        l.host +
        ") is running outside Blakfy's consent gating" +
        (l.consentGranted ? "" : ", and consent for '" + l.category + "' was NOT granted") +
        '. This script was not loaded via a type="text/plain" Blakfy tag, so this widget cannot control it — ' +
        "check the platform's own marketing/analytics integrations panel (e.g. Wix Marketing Tags, Shopify Preferences) " +
        "for a native copy of this tool and disconnect it there. src=" +
        l.src
    );
  }
};
