import { describe, it, expect, vi, beforeEach } from "vitest";

import { scanForLeaks, warnLeaks } from "../src/gating/leak-detector.js";

const FAKE_PRESETS = {
  ga4: { name: "Google Analytics 4", category: "analytics", scriptHosts: ["googletagmanager.com"] },
  facebook: {
    name: "Facebook Pixel",
    category: "marketing",
    scriptHosts: ["connect.facebook.net"],
  },
};

describe("scanForLeaks", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("flags a real (non-gated) script matching an active preset's host", () => {
    const s = document.createElement("script");
    s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXX";
    document.body.appendChild(s);

    const leaks = scanForLeaks({
      activePresetNames: ["ga4"],
      presets: FAKE_PRESETS,
      getConsent: () => false,
    });

    expect(leaks.length).toBe(1);
    expect(leaks[0].preset).toBe("ga4");
    expect(leaks[0].consentGranted).toBe(false);
  });

  it("ignores scripts already unblocked by Blakfy itself", () => {
    const s = document.createElement("script");
    s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXX";
    s.setAttribute("data-blakfy-unblocked", "true");
    document.body.appendChild(s);

    const leaks = scanForLeaks({
      activePresetNames: ["ga4"],
      presets: FAKE_PRESETS,
      getConsent: () => true,
    });

    expect(leaks.length).toBe(0);
  });

  it("ignores presets that are not active", () => {
    const s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.body.appendChild(s);

    const leaks = scanForLeaks({
      activePresetNames: ["ga4"],
      presets: FAKE_PRESETS,
      getConsent: () => false,
    });

    expect(leaks.length).toBe(0);
  });

  it("ignores unrelated scripts", () => {
    const s = document.createElement("script");
    s.src = "https://example.test/app.js";
    document.body.appendChild(s);

    const leaks = scanForLeaks({
      activePresetNames: ["ga4", "facebook"],
      presets: FAKE_PRESETS,
      getConsent: () => false,
    });

    expect(leaks.length).toBe(0);
  });

  it("returns [] when activePresetNames is not an array", () => {
    expect(scanForLeaks({ activePresetNames: null, presets: FAKE_PRESETS })).toEqual([]);
  });
});

describe("warnLeaks", () => {
  it("logs one console.warn per leak, mentioning the preset name and host", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnLeaks([
      {
        preset: "ga4",
        name: "Google Analytics 4",
        host: "googletagmanager.com",
        src: "https://www.googletagmanager.com/gtag/js?id=G-XXXX",
        category: "analytics",
        consentGranted: false,
      },
    ]);
    expect(spy).toHaveBeenCalledTimes(1);
    const msg = spy.mock.calls[0][0];
    expect(msg).toContain("Google Analytics 4");
    expect(msg).toContain("googletagmanager.com");
    spy.mockRestore();
  });

  it("does nothing when given an empty list", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnLeaks([]);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
