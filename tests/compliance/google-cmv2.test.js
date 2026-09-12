import { describe, it, expect, beforeEach, vi } from "vitest";

// Re-import per-test to reset module-level `defaultsInstalled` flag.
const importFresh = async () => {
  const mod = await import("../../src/compliance/google-cmv2.js?t=" + Math.random());
  return mod;
};

describe("google-cmv2 installDefaults", () => {
  it("initializes window.dataLayer and window.gtag stub", async () => {
    const { installDefaults } = await importFresh();
    installDefaults();
    expect(Array.isArray(window.dataLayer)).toBe(true);
    expect(typeof window.gtag).toBe("function");
  });

  it("pushes consent default with ad_storage: 'denied' etc.", async () => {
    const { installDefaults } = await importFresh();
    installDefaults();
    const found = window.dataLayer.find((args) => {
      const a = Array.from(args);
      return a[0] === "consent" && a[1] === "default";
    });
    expect(found).toBeDefined();
    const payload = Array.from(found)[2];
    expect(payload.ad_storage).toBe("denied");
    expect(payload.ad_user_data).toBe("denied");
    expect(payload.ad_personalization).toBe("denied");
    expect(payload.analytics_storage).toBe("denied");
    expect(payload.functionality_storage).toBe("denied");
    expect(payload.security_storage).toBe("granted");
  });
});

describe("google-cmv2 pushGCM", () => {
  it("maps analytics:true, marketing:false, functional:true correctly", async () => {
    const { installDefaults, pushGCM } = await importFresh();
    installDefaults();
    pushGCM({ analytics: true, marketing: false, functional: true });

    const update = window.dataLayer.find((args) => {
      const a = Array.from(args);
      return a[0] === "consent" && a[1] === "update";
    });
    expect(update).toBeDefined();
    const payload = Array.from(update)[2];
    expect(payload.analytics_storage).toBe("granted");
    expect(payload.ad_storage).toBe("denied");
    expect(payload.ad_user_data).toBe("denied");
    expect(payload.ad_personalization).toBe("denied");
    expect(payload.functionality_storage).toBe("granted");
    expect(payload.personalization_storage).toBe("granted");
    expect(payload.security_storage).toBe("granted");
  });

  it("does nothing when gtag is undefined", async () => {
    const { pushGCM } = await importFresh();
    delete window.gtag;
    expect(() => pushGCM({ analytics: true })).not.toThrow();
  });
});

// #24 (remaining scope): warn when a host platform pushed its own granted
// consent default into dataLayer before this widget's denied-by-default signal.
describe("google-cmv2 foreign granted default detection", () => {
  beforeEach(() => {
    delete window.dataLayer;
    delete window.gtag;
  });

  it("warns when dataLayer already has a foreign granted default (e.g. Wix)", async () => {
    window.dataLayer = [
      ["consent", "default", { analytics_storage: "granted", ad_storage: "granted" }],
    ];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { installDefaults } = await importFresh();
    installDefaults();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("analytics_storage"));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("#24"));
    warnSpy.mockRestore();
  });

  it("does not warn when no prior dataLayer entries exist", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { installDefaults } = await importFresh();
    installDefaults();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("does not warn when the prior default is fully denied", async () => {
    window.dataLayer = [
      [
        "consent",
        "default",
        { analytics_storage: "denied", ad_storage: "denied", security_storage: "granted" },
      ],
    ];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { installDefaults } = await importFresh();
    installDefaults();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("warns only once per module instance even if called again", async () => {
    window.dataLayer = [["consent", "default", { ad_storage: "granted" }]];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { installDefaults } = await importFresh();
    installDefaults();
    installDefaults();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
