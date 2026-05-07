import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTcf } from "../src/useTcf";

type TcfCallback = (data: unknown, success: boolean) => void;

const mockTcfApi = (initial: { tcString?: string; gdprApplies?: boolean } = {}) => {
  const callbacks: TcfCallback[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__tcfapi = vi.fn((cmd: string, _version: number, cb: TcfCallback) => {
    if (cmd === "addEventListener") {
      callbacks.push(cb);
      cb({ ...initial, listenerId: callbacks.length - 1 }, true);
    } else if (cmd === "removeEventListener") {
      // noop
    }
  });
  return {
    fireUpdate: (data: { tcString?: string; gdprApplies?: boolean }) =>
      callbacks.forEach((cb) => cb({ ...data }, true)),
  };
};

describe("useTcf", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).__tcfapi;
  });

  it("returns initial empty state when __tcfapi missing", () => {
    const { result } = renderHook(() => useTcf());
    expect(result.current.tcString).toBe(null);
    expect(result.current.gdprApplies).toBe(false);
  });

  it("reads tcString and gdprApplies from initial __tcfapi callback", () => {
    mockTcfApi({ tcString: "CTEST123", gdprApplies: true });
    const { result } = renderHook(() => useTcf());
    expect(result.current.tcString).toBe("CTEST123");
    expect(result.current.gdprApplies).toBe(true);
  });

  it("updates state when __tcfapi listener fires update", () => {
    const { fireUpdate } = mockTcfApi({ tcString: "INITIAL", gdprApplies: true });
    const { result } = renderHook(() => useTcf());
    expect(result.current.tcString).toBe("INITIAL");

    act(() => {
      fireUpdate({ tcString: "UPDATED", gdprApplies: true });
    });
    expect(result.current.tcString).toBe("UPDATED");
  });

  it("sets tcString to null when api reports empty", () => {
    mockTcfApi({ tcString: "", gdprApplies: false });
    const { result } = renderHook(() => useTcf());
    expect(result.current.tcString).toBe(null);
    expect(result.current.gdprApplies).toBe(false);
  });

  it("subscribes via blakfy:ready when __tcfapi not initially available", () => {
    const { result } = renderHook(() => useTcf());
    expect(result.current.tcString).toBe(null);

    mockTcfApi({ tcString: "LATE", gdprApplies: true });
    act(() => {
      window.dispatchEvent(new Event("blakfy:ready"));
    });
    expect(result.current.tcString).toBe("LATE");
  });
});
