import { describe, it, expect, vi } from "vitest";

const importFresh = async () => {
  const mod = await import("../../src/compliance/yandex-metrica.js?t=" + Math.random());
  return mod;
};

describe("yandex-metrica installDefaults", () => {
  it("creates a window.ym stub if undefined", async () => {
    const { installDefaults } = await importFresh();
    expect(typeof window.ym).toBe("undefined");
    installDefaults();
    expect(typeof window.ym).toBe("function");
    expect(window.ym.__blakfyStub).toBe(true);
  });

  it("does NOT replace existing window.ym", async () => {
    const { installDefaults } = await importFresh();
    const existing = vi.fn();
    window.ym = existing;
    installDefaults();
    expect(window.ym).toBe(existing);
    expect(window.ym.__blakfyStub).toBeUndefined();
  });
});

describe("yandex-metrica applyYandex", () => {
  it("calls unblock('analytics') when analytics:true", async () => {
    const { applyYandex } = await importFresh();
    const unblock = vi.fn();
    applyYandex({ analytics: true }, { unblock });
    expect(unblock).toHaveBeenCalledWith("analytics");
  });

  it("calls unblock('recording') when recording:true", async () => {
    const { applyYandex } = await importFresh();
    const unblock = vi.fn();
    applyYandex({ recording: true }, { unblock });
    expect(unblock).toHaveBeenCalledWith("recording");
  });

  it("does not call unblock when analytics/recording are false", async () => {
    const { applyYandex } = await importFresh();
    const unblock = vi.fn();
    applyYandex({ analytics: false, recording: false }, { unblock });
    expect(unblock).not.toHaveBeenCalled();
  });

  it("does nothing when unblock is missing", async () => {
    const { applyYandex } = await importFresh();
    expect(() => applyYandex({ analytics: true }, {})).not.toThrow();
  });
});

describe("yandex-metrica revokeYandex", () => {
  it("calls runCleanup for analytics + recording", async () => {
    const { revokeYandex } = await importFresh();
    const runCleanup = vi.fn();
    revokeYandex({ runCleanup });
    expect(runCleanup).toHaveBeenCalledWith("analytics");
    expect(runCleanup).toHaveBeenCalledWith("recording");
    expect(runCleanup).toHaveBeenCalledTimes(2);
  });
});
