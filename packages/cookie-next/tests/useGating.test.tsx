import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGating } from "../src/useGating";
import type { BlakfyConsentState } from "../src/types";

const sampleState = (overrides: Partial<BlakfyConsentState> = {}): BlakfyConsentState => ({
  id: "uuid",
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

const mockApi = (state: BlakfyConsentState | null) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).BlakfyCookie = {
    getState: vi.fn(() => state),
    onChange: vi.fn(),
    open: vi.fn(),
    acceptAll: vi.fn(),
    rejectAll: vi.fn(),
  };
};

describe("useGating", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).BlakfyCookie;
  });

  it("returns true for essential always (even without state)", () => {
    const { result } = renderHook(() => useGating("essential"));
    expect(result.current).toBe(true);
  });

  it("returns false for non-essential when no state yet", () => {
    const { result } = renderHook(() => useGating("analytics"));
    expect(result.current).toBe(false);
  });

  it("returns true when category is granted in state", () => {
    mockApi(sampleState({ marketing: true }));
    const { result } = renderHook(() => useGating("marketing"));
    expect(result.current).toBe(true);
  });

  it("returns false when category is denied in state", () => {
    mockApi(sampleState({ marketing: false }));
    const { result } = renderHook(() => useGating("marketing"));
    expect(result.current).toBe(false);
  });

  it("differentiates between categories", () => {
    mockApi(sampleState({ analytics: true, marketing: false, functional: true }));
    expect(renderHook(() => useGating("analytics")).result.current).toBe(true);
    expect(renderHook(() => useGating("marketing")).result.current).toBe(false);
    expect(renderHook(() => useGating("functional")).result.current).toBe(true);
    expect(renderHook(() => useGating("recording")).result.current).toBe(false);
  });
});
