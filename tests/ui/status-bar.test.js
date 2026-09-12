// blakfy-cookie/tests/ui/status-bar.test.js — #41: cacheable status.json requests
//
// Covers Problem 2 from #41: fetchStatus() used to send `_=Date.now()` + `cache: "no-store"`
// on every call, guaranteeing a network round trip on every page view forever. It now
// allows normal HTTP caching (no cache-buster, no no-store) and additionally caps requests
// to at most one per URL per STATUS_CACHE_TTL_MS via sessionStorage.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchStatus } from "../../src/ui/status-bar.js";

const URL = "https://cdn.jsdelivr.net/npm/@blakfy/cookie@2.3.2/status.json";

const activeStatus = () => ({
  active: true,
  type: "info",
  expires: null,
  message: { en: "Hello", tr: "Merhaba" },
});

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("fetchStatus (#41)", () => {
  it("returns null immediately when no url is given, no fetch call", async () => {
    const spy = vi.spyOn(global, "fetch");
    const result = await fetchStatus(undefined);
    expect(result).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("calls fetch with the plain URL — no cache-buster query param, no cache:no-store", async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(activeStatus()) });

    await fetchStatus(URL);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOpts] = global.fetch.mock.calls[0];
    expect(calledUrl).toBe(URL); // exact URL, no "?_=<timestamp>" appended
    expect(calledOpts).toBeUndefined(); // no { cache: "no-store" } second argument
  });

  it("returns null for an inactive status and caches that result", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ active: false, message: {} }),
    });

    const first = await fetchStatus(URL);
    expect(first).toBeNull();

    const second = await fetchStatus(URL);
    expect(second).toBeNull();
    // second call served from the session cache, not a second network request
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns the active status data and caches it for repeat calls within the TTL", async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(activeStatus()) });

    const first = await fetchStatus(URL);
    expect(first).toMatchObject({ active: true, type: "info" });

    const second = await fetchStatus(URL);
    expect(second).toMatchObject({ active: true, type: "info" });
    expect(global.fetch).toHaveBeenCalledTimes(1); // only one real request for both calls
  });

  it("expired status.json data still resolves to null (existing #expires behavior kept)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          active: true,
          type: "info",
          expires: "2000-01-01T00:00:00Z",
          message: { en: "old" },
        }),
    });

    const result = await fetchStatus(URL);
    expect(result).toBeNull();
  });

  it("re-fetches after the TTL window has passed", async () => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(activeStatus()) });

    await fetchStatus(URL);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(6 * 60 * 1000); // past the 5-minute TTL

    await fetchStatus(URL);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("a failed fetch resolves to null and is also cached (no retry storm)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const first = await fetchStatus(URL);
    expect(first).toBeNull();

    const second = await fetchStatus(URL);
    expect(second).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("two different status URLs (custom data-blakfy-status-url per site) cache independently", async () => {
    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(activeStatus()) });

    await fetchStatus(URL);
    await fetchStatus("https://example.com/custom-status.json");

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("never throws when sessionStorage is unavailable (private mode / blocked storage)", async () => {
    const original = window.sessionStorage;
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });

    global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve(activeStatus()) });

    await expect(fetchStatus(URL)).resolves.toMatchObject({ active: true });

    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: original,
    });
  });
});
