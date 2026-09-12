// tests/integration/spa-rebootstrap.test.js — #30 item 3: guard against double bootstrap
// on client-side route changes (Next.js App Router named test case in the issue).
//
// A soft-navigation host (App Router layout re-render, a host script re-executing itself,
// or an operator calling `window.BlakfyCookie` setup twice defensively) can call the
// module's default export (`bootstrap()`) more than once without a full document reload.
// This must be idempotent: exactly one banner, one shadow root, one set of consent-store
// event listeners — never a duplicate.

import { beforeEach, describe, expect, it, vi } from "vitest";

const FLUSH = () => new Promise((r) => setTimeout(r, 0));

const installScriptTag = () => {
  const script = document.createElement("script");
  script.id = "blakfy-cookie-script";
  script.setAttribute("data-blakfy-locale", "en");
  script.setAttribute("data-blakfy-main-lang", "en");
  script.setAttribute("data-blakfy-version", "1.0");
  script.setAttribute("data-blakfy-status", "false");
  document.body.appendChild(script);
  return script;
};

describe("#30 item 3: double bootstrap guard (SPA re-entry, no full page reload)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("two back-to-back calls before the first resolves are coalesced onto one run", async () => {
    installScriptTag();
    vi.resetModules();
    const mod = await import("../../src/index.js");

    // Fire both calls synchronously, before either has had a chance to reach an `await`
    // point internally — this is exactly the race the OLD `window.BlakfyCookie.__bootstrapped`
    // guard could not close, since window.BlakfyCookie isn't assigned until near the end of
    // the first run.
    const p1 = mod.default();
    const p2 = mod.default();
    await Promise.all([p1, p2]);
    await FLUSH();

    const hosts = document.querySelectorAll("#blakfy-cookie-root");
    expect(hosts.length).toBe(1);

    const root = hosts[0].shadowRoot || hosts[0];
    expect(root.querySelectorAll(".blakfy-card").length).toBe(1);
    expect(window.BlakfyCookie.__bootstrapped).toBe(true);
  });

  it("a call made AFTER bootstrap has already completed is a well-defined no-op, not a re-init", async () => {
    installScriptTag();
    vi.resetModules();
    const mod = await import("../../src/index.js");

    await mod.default();
    await FLUSH();

    const hostBefore = document.getElementById("blakfy-cookie-root");
    const rootBefore = hostBefore.shadowRoot || hostBefore;
    expect(rootBefore.querySelectorAll(".blakfy-card").length).toBe(1);

    // A "soft navigation" re-entry after the first bootstrap fully finished.
    await mod.default();
    await FLUSH();

    const hostsAfter = document.querySelectorAll("#blakfy-cookie-root");
    expect(hostsAfter.length).toBe(1);
    const rootAfter = hostsAfter[0].shadowRoot || hostsAfter[0];
    expect(rootAfter.querySelectorAll(".blakfy-card").length).toBe(1);
  });

  it("three concurrent calls still produce exactly one banner (not just two)", async () => {
    installScriptTag();
    vi.resetModules();
    const mod = await import("../../src/index.js");

    await Promise.all([mod.default(), mod.default(), mod.default()]);
    await FLUSH();

    expect(document.querySelectorAll("#blakfy-cookie-root").length).toBe(1);
  });
});
