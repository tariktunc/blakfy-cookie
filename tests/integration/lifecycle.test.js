// tests/integration/lifecycle.test.js — #31: real DOM lifecycle integration layer
//
// Everything below runs the actual `bootstrap()` entry (src/index.js) against a real
// jsdom document — no mocked deps, no api.js called directly. This is the layer the
// issue asked for: init -> banner shown -> consent choice -> cookies set/cleaned ->
// modal reopen -> withdrawal, driven the same way a real browser would (attribute
// config on a <script> tag, DOM clicks).
//
// Each test does a fresh `vi.resetModules()` + dynamic import so module-level singleton
// state (ccpa.js opt-out flag, tcf-v2.js lastTCString, i18n remote cache) never leaks
// between tests, matching a fresh page load.

import { beforeEach, describe, expect, it, vi } from "vitest";

const FLUSH = () => new Promise((r) => setTimeout(r, 0));

/**
 * Injects a <script> tag configured like a real install (data-blakfy-* attributes),
 * appended last in <body> so core/config.js's getScriptEl() fallback picks it up
 * (document.currentScript is null for a module imported by the test runner, exactly
 * like it would be for a script loaded with `async` — but we test the *widget*
 * lifecycle here, not placement detection, so a plain synchronous tag is correct).
 */
const installScriptTag = (attrs = {}) => {
  const script = document.createElement("script");
  script.id = "blakfy-cookie-script";
  const defaults = {
    "data-blakfy-locale": "en",
    "data-blakfy-main-lang": "en",
    "data-blakfy-version": "1.0",
    "data-blakfy-status": "false",
  };
  const merged = Object.assign({}, defaults, attrs);
  Object.keys(merged).forEach((k) => {
    if (merged[k] !== undefined && merged[k] !== null) script.setAttribute(k, String(merged[k]));
  });
  document.body.appendChild(script);
  return script;
};

const boot = async (attrs) => {
  installScriptTag(attrs);
  vi.resetModules();
  const mod = await import("../../src/index.js");
  await mod.default();
  await FLUSH();
};

const card = () => document.querySelector(".blakfy-card");
const clickAct = (act) => {
  const btn = document.querySelector('[data-act="' + act + '"]');
  expect(btn, "button [data-act=" + act + "] should exist").toBeTruthy();
  btn.click();
};
const readConsentCookie = () => {
  const match = document.cookie.match(/(^| )blakfy_consent=([^;]+)/);
  if (!match) return null;
  return JSON.parse(decodeURIComponent(match[2]));
};

describe("full DOM lifecycle (#31)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("init with no prior consent shows the banner", async () => {
    await boot();
    expect(card()).toBeTruthy();
    expect(readConsentCookie()).toBeNull();
  });

  it("Accept All: writes a granted cookie and removes the banner", async () => {
    await boot();
    clickAct("accept");
    await FLUSH();

    const state = readConsentCookie();
    expect(state).toBeTruthy();
    expect(state.analytics).toBe(true);
    expect(state.marketing).toBe(true);
    expect(document.querySelector(".blakfy-card")).toBeNull();
  });

  it("withdrawing a granted analytics category cleans up its registered cookies (#25)", async () => {
    // registers the ga4 preset (category: analytics, cookies: /^_ga/, ...) so a
    // granted-then-withdrawn analytics decision has something real to clean.
    await boot({ "data-blakfy-presets": "ga4" });
    clickAct("accept");
    await FLUSH();
    expect(readConsentCookie().analytics).toBe(true);

    // simulate the tag having dropped its cookie while analytics was granted
    document.cookie = "_ga=GA1.1.integration-test";
    expect(document.cookie).toMatch(/_ga=/);

    window.BlakfyCookie.rejectAll();
    await FLUSH();

    const state = readConsentCookie();
    expect(state.analytics).toBe(false);
    // #25: withdrawing a granted category must clean up its registered cookies
    expect(document.cookie).not.toMatch(/_ga=/);
  });

  it("Preferences -> modal opens, per-category save persists only the chosen categories", async () => {
    await boot();
    clickAct("prefs");
    await FLUSH();

    const modalCard = document.querySelector(".blakfy-card[aria-modal='true']");
    expect(modalCard, "opening Preferences should mount the modal").toBeTruthy();

    const analyticsToggle = modalCard.querySelector('[data-cat="analytics"]');
    expect(analyticsToggle, "modal should expose an analytics category switch").toBeTruthy();
    expect(analyticsToggle.getAttribute("aria-checked")).toBe("false");
    analyticsToggle.click();
    expect(analyticsToggle.getAttribute("aria-checked")).toBe("true");

    clickAct("save");
    await FLUSH();

    const state = readConsentCookie();
    expect(state.analytics).toBe(true);
    expect(state.marketing).toBe(false);
  });

  it("reopening after a decision (BlakfyCookie.open) shows the modal, not the first-visit banner", async () => {
    await boot();
    clickAct("accept");
    await FLUSH();
    expect(document.querySelector(".blakfy-card")).toBeNull();

    window.BlakfyCookie.open();
    await FLUSH();

    const modalCard = document.querySelector(".blakfy-card[aria-modal='true']");
    expect(modalCard).toBeTruthy();
  });

  it("withdrawal: rejecting after a prior Accept All flips granted categories back to denied", async () => {
    await boot();
    clickAct("accept");
    await FLUSH();
    expect(readConsentCookie().analytics).toBe(true);

    window.BlakfyCookie.rejectAll();
    await FLUSH();

    const state = readConsentCookie();
    expect(state.analytics).toBe(false);
    expect(state.marketing).toBe(false);
    // withdrawal keeps the same consent record id (it is an update, not a new visitor)
  });

  it("#26: reopen FAB -> withdraw a category -> consent-change hooks fire and cookie updates", async () => {
    // fabSide defaults to "left" (not "off") — the reopen control this test drives
    // must be reachable without any extra config, matching a stock install.
    await boot();
    clickAct("accept");
    await FLUSH();
    expect(readConsentCookie().analytics).toBe(true);

    const changeSpy = vi.fn();
    const analyticsSpy = vi.fn();
    window.BlakfyCookie.onChange(changeSpy);
    window.BlakfyCookie.onConsent("analytics", analyticsSpy);
    analyticsSpy.mockClear(); // onConsent fires immediately with the current (true) state

    const fab = document.querySelector(".blakfy-fab");
    expect(fab, "reopen FAB should be mounted once a decision exists (#34)").toBeTruthy();
    fab.click();
    await FLUSH();

    const modalCard = document.querySelector(".blakfy-card[aria-modal='true']");
    expect(modalCard, "FAB click should reopen the preferences modal").toBeTruthy();

    const analyticsToggle = modalCard.querySelector('[data-cat="analytics"]');
    expect(analyticsToggle.getAttribute("aria-checked")).toBe("true");
    analyticsToggle.click();
    expect(analyticsToggle.getAttribute("aria-checked")).toBe("false");

    clickAct("save");
    await FLUSH();

    // withdrawal actually cleared the stored consent
    const state = readConsentCookie();
    expect(state.analytics).toBe(false);

    // and re-fired the consent-change hooks/events (GDPR Art. 7(3): withdrawal is
    // as effective and as observable to integrators as granting was)
    expect(changeSpy).toHaveBeenCalled();
    expect(analyticsSpy).toHaveBeenCalledWith(false);
  });

  it("#26: recording is its own explicit consent category, not bundled into analytics", async () => {
    await boot();
    clickAct("prefs");
    await FLUSH();

    const modalCard = document.querySelector(".blakfy-card[aria-modal='true']");
    const recordingToggle = modalCard.querySelector('[data-cat="recording"]');
    expect(
      recordingToggle,
      "modal should expose a dedicated recording category switch, separate from analytics"
    ).toBeTruthy();
    expect(recordingToggle.getAttribute("aria-checked")).toBe("false");

    recordingToggle.click();
    clickAct("save");
    await FLUSH();

    const state = readConsentCookie();
    expect(state.recording).toBe(true);
    expect(state.analytics).toBe(false); // toggling recording must not leak into analytics
  });

  it("a returning visitor with a stored decision does not see the banner again", async () => {
    await boot();
    clickAct("accept");
    await FLUSH();

    // reload the page: fresh module graph, same cookie jar
    vi.resetModules();
    installScriptTag();
    const mod2 = await import("../../src/index.js");
    await mod2.default();
    await FLUSH();

    expect(document.querySelector(".blakfy-card")).toBeNull();
  });
});
