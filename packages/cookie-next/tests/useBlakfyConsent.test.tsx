import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBlakfyConsent } from "../src/useBlakfyConsent";
import type { BlakfyConsentState } from "../src/types";

// Helper: BlakfyCookie API mock'ı kurma
const mockApi = (initialState: BlakfyConsentState | null = null) => {
  const listeners: Array<(s: BlakfyConsentState) => void> = [];
  const api = {
    version: "2.1.2",
    getState: vi.fn(() => initialState),
    onChange: vi.fn((fn: (s: BlakfyConsentState) => void) => {
      listeners.push(fn);
    }),
    open: vi.fn(),
    acceptAll: vi.fn(),
    rejectAll: vi.fn(),
    getConsent: vi.fn(),
    getMainLang: vi.fn(),
    onConsent: vi.fn(),
    setLocale: vi.fn(),
    registerCleanup: vi.fn(),
    unblock: vi.fn(),
    scan: vi.fn(),
    usePreset: vi.fn(),
    tcf: { getTCString: vi.fn() },
    ccpa: { optOut: vi.fn(), isOptedOut: vi.fn() },
    getJurisdiction: vi.fn(),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).BlakfyCookie = api;
  return { api, fireChange: (s: BlakfyConsentState) => listeners.forEach((fn) => fn(s)) };
};

const sampleState = (overrides: Partial<BlakfyConsentState> = {}): BlakfyConsentState => ({
  id: "uuid-test",
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
  recording: false,
  timestamp: "2026-05-07T00:00:00Z",
  version: "1.0",
  locale: "tr",
  mainLang: "tr",
  jurisdiction: "GDPR",
  tcString: null,
  uspString: null,
  ...overrides,
});

describe("useBlakfyConsent", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).BlakfyCookie;
  });

  it("returns null state when BlakfyCookie API not yet ready", () => {
    const { result } = renderHook(() => useBlakfyConsent());
    expect(result.current.state).toBe(null);
    expect(result.current.jurisdiction).toBe(null);
  });

  it("essential category always true even when no state", () => {
    const { result } = renderHook(() => useBlakfyConsent());
    expect(result.current.getConsent("essential")).toBe(true);
    expect(result.current.getConsent("analytics")).toBe(false);
  });

  it("syncs initial state from BlakfyCookie.getState()", () => {
    mockApi(sampleState({ analytics: true }));
    const { result } = renderHook(() => useBlakfyConsent());
    expect(result.current.state?.analytics).toBe(true);
    expect(result.current.jurisdiction).toBe("GDPR");
  });

  it("re-renders when onChange listener fires", () => {
    const { fireChange } = mockApi(sampleState());
    const { result } = renderHook(() => useBlakfyConsent());
    expect(result.current.state?.analytics).toBe(false);

    act(() => {
      fireChange(sampleState({ analytics: true, marketing: true }));
    });
    expect(result.current.state?.analytics).toBe(true);
    expect(result.current.state?.marketing).toBe(true);
  });

  it("subscribes via blakfy:ready event when API not initially available", () => {
    const { result } = renderHook(() => useBlakfyConsent());
    expect(result.current.state).toBe(null);

    mockApi(sampleState({ analytics: true }));
    act(() => {
      window.dispatchEvent(new Event("blakfy:ready"));
    });
    expect(result.current.state?.analytics).toBe(true);
  });

  it("exposes open/acceptAll/rejectAll callbacks", () => {
    const { api } = mockApi(sampleState());
    const { result } = renderHook(() => useBlakfyConsent());

    act(() => result.current.open());
    expect(api.open).toHaveBeenCalledTimes(1);

    act(() => result.current.acceptAll());
    expect(api.acceptAll).toHaveBeenCalledTimes(1);

    act(() => result.current.rejectAll());
    expect(api.rejectAll).toHaveBeenCalledTimes(1);
  });

  it("getConsent reads from current state", () => {
    mockApi(sampleState({ analytics: true, marketing: false, functional: true }));
    const { result } = renderHook(() => useBlakfyConsent());
    expect(result.current.getConsent("analytics")).toBe(true);
    expect(result.current.getConsent("marketing")).toBe(false);
    expect(result.current.getConsent("functional")).toBe(true);
    expect(result.current.getConsent("essential")).toBe(true);
  });
});
