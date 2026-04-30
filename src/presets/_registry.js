// blakfy-cookie/src/presets/_registry.js — central registry mapping short keys to preset modules

import ga4 from "./google-analytics.js";
import gtm from "./google-tag-manager.js";
import maps from "./google-maps.js";
import recaptcha from "./google-recaptcha.js";
import facebook from "./facebook-pixel.js";
import youtube from "./youtube.js";
import vimeo from "./vimeo.js";
import hotjar from "./hotjar.js";
import clarity from "./microsoft-clarity.js";
import linkedin from "./linkedin-insight.js";
import yandex from "./yandex-metrica.js";
import bing from "./bing-ads-uet.js";
import tiktok from "./tiktok-pixel.js";
import pinterest from "./pinterest-tag.js";
import tawkto from "./tawk-to.js";
import intercom from "./intercom.js";
import hubspot from "./hubspot.js";
import mailchimp from "./mailchimp.js";

export const PRESETS = {
  ga4,
  gtm,
  maps,
  recaptcha,
  facebook,
  youtube,
  vimeo,
  hotjar,
  clarity,
  linkedin,
  yandex,
  bing,
  tiktok,
  pinterest,
  tawkto,
  intercom,
  hubspot,
  mailchimp
};

export const applyPreset = (name, { registerCleanup }) => {
  const preset = PRESETS[name];
  if (!preset) return null;
  if (typeof registerCleanup === "function") {
    registerCleanup({
      category: preset.category,
      cookies: preset.cookies || [],
      storage: preset.storage || []
    });
    if (preset.subCategory) {
      registerCleanup({
        category: preset.subCategory,
        cookies: preset.cookies || [],
        storage: preset.storage || []
      });
    }
  }
  return preset;
};
