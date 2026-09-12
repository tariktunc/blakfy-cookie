// tests/integration/bootstrap-error.test.js — #30 item 6: init throws must fail loud + closed
//
// Simulates the "init throws" failure mode by making core/config.js's readConfig() throw
// synchronously — the very first statement inside runBootstrap(), unwrapped in any local
// try/catch. Before this fix that produced a silent unhandled promise rejection (no console
// signal at all beyond the default browser "Uncaught (in promise)" noise, no operator hook).
// This asserts: (1) console.error fires with a specific, actionable message, (2) the optional
// data-blakfy-error-endpoint hook is POSTed via sendBeacon when configured, (3) gated tags stay
// untouched (fail-closed — already guaranteed structurally per #30 item 5, verified here too),
// (4) the promise returned by bootstrap() itself never rejects (callers don't need their own
// .catch() to avoid an unhandled rejection).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/core/config.js", async () => {
  const actual = await vi.importActual("../../src/core/config.js");
  return {
    ...actual,
    readConfig: () => {
      throw new Error("simulated config parse failure");
    },
  };
});

const FLUSH = () => new Promise((r) => setTimeout(r, 0));

const installScriptTag = (attrs = {}) => {
  const script = document.createElement("script");
  script.id = "blakfy-cookie-script";
  Object.keys(attrs).forEach((k) => script.setAttribute(k, attrs[k]));
  document.body.appendChild(script);
  return script;
};

describe("#30 item 6: bootstrap() init-throws failure mode", () => {
  let sendBeaconSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    document.body.innerHTML = "";
    sendBeaconSpy = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      writable: true,
      value: sendBeaconSpy,
    });
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.resetModules();
  });

  it("logs loudly via console.error instead of failing silently", async () => {
    installScriptTag();
    vi.resetModules();
    const mod = await import("../../src/index.js");

    await expect(mod.default()).resolves.toBeUndefined();
    await FLUSH();

    expect(consoleErrorSpy).toHaveBeenCalled();
    const loggedText = consoleErrorSpy.mock.calls.map((c) => c[0]).join(" ");
    expect(loggedText).toContain("[Blakfy Cookie] bootstrap failed");
    expect(loggedText).toContain("simulated config parse failure");
  });

  it("reports to data-blakfy-error-endpoint via sendBeacon when configured", async () => {
    installScriptTag({ "data-blakfy-error-endpoint": "/api/blakfy-errors" });
    vi.resetModules();
    const mod = await import("../../src/index.js");

    // Note: the module auto-runs bootstrap() at import time (document.readyState is already
    // "complete" in this jsdom test), and this explicit call is a second attempt — since the
    // simulated failure happens before __bootstrapped is ever set, each attempt retries and
    // reports again. That's correct behavior (every real attempt should be visible to the
    // operator), so this asserts "at least once", not an exact count.
    await mod.default();
    await FLUSH();

    expect(sendBeaconSpy).toHaveBeenCalled();
    const [endpoint, blob] = sendBeaconSpy.mock.calls[0];
    expect(endpoint).toBe("/api/blakfy-errors");
    // jsdom's Blob has no .text()/.arrayBuffer() — read via FileReader instead (payload
    // shape itself is covered at the unit level by tests/audit.test.js).
    const text = await new Promise((resolvePromise, rejectPromise) => {
      const reader = new FileReader();
      reader.onload = () => resolvePromise(String(reader.result));
      reader.onerror = () => rejectPromise(reader.error);
      reader.readAsText(blob);
    });
    const payload = JSON.parse(text);
    expect(payload.type).toBe("bootstrap_error");
    expect(payload.message).toContain("simulated config parse failure");
    expect(typeof payload.timestamp).toBe("string");
  });

  it("makes no network call at all when no error endpoint is configured", async () => {
    installScriptTag();
    vi.resetModules();
    const mod = await import("../../src/index.js");

    await mod.default();
    await FLUSH();

    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it("a gated tag stays inert (fail-closed) when init throws before gating ever runs", async () => {
    installScriptTag();
    const gated = document.createElement("script");
    gated.setAttribute("type", "text/plain");
    gated.setAttribute("data-blakfy-category", "marketing");
    gated.setAttribute("data-blakfy-src", "https://example.test/should-stay-blocked.js");
    document.body.appendChild(gated);

    vi.resetModules();
    const mod = await import("../../src/index.js");
    await mod.default();
    await FLUSH();

    expect(
      document.querySelector('script[src="https://example.test/should-stay-blocked.js"]')
    ).toBeNull();
    expect(
      document.querySelector('script[type="text/plain"][data-blakfy-category="marketing"]')
    ).not.toBeNull();
  });
});
