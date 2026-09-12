// blakfy-cookie/src/data/cookie-inspector.js — #39 cookie transparency panel data layer
//
// Lists the cookies ACTUALLY present in document.cookie right now and matches each one
// against the registered preset catalogue (name/regex + scriptHosts), attaching the
// service's display name/purpose/category from SERVICE_METADATA where known. Cookies
// that match nothing are marked "unrecognised" — that list is the actionable output for
// the site operator (see issue #39).
//
// Caveats this module cannot fix (must be surfaced in the UI, not hidden):
//   - document.cookie cannot see HttpOnly cookies — this list is inherently partial.
//   - It says nothing about localStorage, IndexedDB, or fingerprinting.

import { COOKIE_NAME as BLAKFY_CONSENT_COOKIE } from "../core/consent-store.js";
import { readCookieNames, expireCookie } from "../gating/cleaner.js";

import { SERVICE_METADATA } from "./service-metadata.js";

const matchesPreset = (matcher, name) =>
  matcher instanceof RegExp ? matcher.test(name) : matcher === name;

const findOwningPreset = (name, presets) => {
  if (!presets) return null;
  const keys = Object.keys(presets);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const preset = presets[key];
    if (!preset || !preset.cookies) continue;
    for (let m = 0; m < preset.cookies.length; m++) {
      if (matchesPreset(preset.cookies[m], name)) {
        return { key, preset };
      }
    }
  }
  return null;
};

/**
 * Build the list of cookies currently present on the page.
 *
 * @param {object} presets - the full preset registry (src/presets/_registry.js PRESETS),
 *   NOT just the active ones — an inactive preset's cookie showing up here is exactly the
 *   platform-injected-tracker case #39 exists to surface.
 * @returns {Array<{name:string, service:string|null, category:string|null,
 *   purposes:string[], essential:boolean, unrecognised:boolean}>}
 */
export const listObservedCookies = (presets) => {
  const names = readCookieNames();
  const out = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];

    // Blakfy's own consent-record cookie is strictly necessary and cannot be deleted
    // from this panel without breaking the withdrawal mechanism itself.
    if (name === BLAKFY_CONSENT_COOKIE) {
      out.push({
        name,
        service: "Blakfy Cookie",
        category: "essential",
        purposes: ["Stores your consent decision"],
        essential: true,
        unrecognised: false,
      });
      continue;
    }

    const owner = findOwningPreset(name, presets);
    if (owner) {
      const meta = SERVICE_METADATA[owner.key];
      out.push({
        name,
        service: (meta && meta.displayName) || owner.preset.name || owner.key,
        category: owner.preset.category || (meta && meta.category) || null,
        purposes: (meta && meta.purposes) || [],
        essential: false,
        unrecognised: false,
      });
      continue;
    }

    out.push({
      name,
      service: null,
      category: null,
      purposes: [],
      essential: false,
      unrecognised: true,
    });
  }

  return out;
};

/**
 * Delete a single cookie by name using the same multi-scope expiry as category
 * cleanup (#25). Refuses to delete the essential consent-record cookie — deleting it
 * would break the site's own withdrawal path, which is exactly the failure mode #39's
 * caveats section warns about ("deleting an essential cookie can break the session").
 *
 * @returns {boolean} true if a delete was attempted, false if refused (essential cookie).
 */
export const deleteObservedCookie = (name) => {
  if (!name || name === BLAKFY_CONSENT_COOKIE) return false;
  expireCookie(name);
  return true;
};

// #39 "developer-only mode": diff what a preset's catalogue entry CLAIMS to set against
// what is actually observed — surfaces catalogue entries that are wrong or incomplete
// using real traffic instead of guesses (tarteaucitron's checkCount, adapted).
export const diffCatalogueAgainstObserved = (presets, activePresetKeys) => {
  const observedNames = readCookieNames();
  const diff = [];
  const active = Array.isArray(activePresetKeys) ? activePresetKeys : [];

  for (let i = 0; i < active.length; i++) {
    const key = active[i];
    const preset = presets && presets[key];
    if (!preset || !preset.cookies) continue;
    const declaredButNotObserved = [];
    for (let m = 0; m < preset.cookies.length; m++) {
      const matcher = preset.cookies[m];
      const seen = observedNames.some((n) => matchesPreset(matcher, n));
      if (!seen) {
        declaredButNotObserved.push(matcher instanceof RegExp ? matcher.source : matcher);
      }
    }
    if (declaredButNotObserved.length) {
      diff.push({ key, name: preset.name, declaredButNotObserved });
    }
  }

  return diff;
};
