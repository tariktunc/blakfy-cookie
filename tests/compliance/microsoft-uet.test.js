import { describe, it, expect } from "vitest";

const importFresh = async () => {
  const mod = await import("../../src/compliance/microsoft-uet.js?t=" + Math.random());
  return mod;
};

describe("microsoft-uet", () => {
  it("installDefaults initializes window.uetq array", async () => {
    const { installDefaults } = await importFresh();
    installDefaults();
    expect(Array.isArray(window.uetq)).toBe(true);
  });

  it("installDefaults pushes default consent with ad_storage: 'denied'", async () => {
    const { installDefaults } = await importFresh();
    installDefaults();
    expect(window.uetq.length).toBeGreaterThanOrEqual(3);
    expect(window.uetq[0]).toBe("consent");
    expect(window.uetq[1]).toBe("default");
    expect(window.uetq[2].ad_storage).toBe("denied");
  });

  it("pushUET({ marketing: true }) pushes consent update with ad_storage: 'granted'", async () => {
    const { installDefaults, pushUET } = await importFresh();
    installDefaults();
    const before = window.uetq.length;
    pushUET({ marketing: true });
    expect(window.uetq.length).toBe(before + 3);
    expect(window.uetq[before]).toBe("consent");
    expect(window.uetq[before + 1]).toBe("update");
    expect(window.uetq[before + 2]).toEqual({ ad_storage: "granted" });
  });

  it("pushUET({ marketing: false }) pushes ad_storage: 'denied'", async () => {
    const { pushUET } = await importFresh();
    window.uetq = [];
    pushUET({ marketing: false });
    expect(window.uetq[2]).toEqual({ ad_storage: "denied" });
  });
});
