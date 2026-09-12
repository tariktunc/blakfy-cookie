// tests/audit.test.js — #28: sendBeacon-with-fetch-fallback audit transport

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postAudit } from "../src/core/audit.js";

const PAYLOAD = {
  id: "test-id",
  action: "accept_all",
  timestamp: "2026-09-13T00:00:00.000Z",
  version: "1.0",
  jurisdiction: "GDPR",
  locale: "en",
  consent: { analytics: true, marketing: false, functional: true, recording: false },
};

describe("postAudit (#28)", () => {
  let originalSendBeacon;
  let originalFetch;

  beforeEach(() => {
    originalSendBeacon = navigator.sendBeacon;
    originalFetch = global.fetch;
  });

  afterEach(() => {
    if (originalSendBeacon === undefined) delete navigator.sendBeacon;
    else navigator.sendBeacon = originalSendBeacon;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("does nothing when no endpoint is configured", () => {
    const beacon = vi.fn(() => true);
    navigator.sendBeacon = beacon;
    global.fetch = vi.fn();
    postAudit(null, PAYLOAD);
    postAudit(undefined, PAYLOAD);
    expect(beacon).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("uses navigator.sendBeacon when available and it accepts the payload", () => {
    const beacon = vi.fn(() => true);
    navigator.sendBeacon = beacon;
    global.fetch = vi.fn();

    postAudit("https://example.com/audit", PAYLOAD);

    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0][0]).toBe("https://example.com/audit");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("falls back to fetch(keepalive) when sendBeacon is unavailable", () => {
    delete navigator.sendBeacon;
    const fetchMock = vi.fn(() => Promise.resolve({}));
    global.fetch = fetchMock;

    postAudit("https://example.com/audit", PAYLOAD);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.com/audit");
    expect(opts.method).toBe("POST");
    expect(opts.keepalive).toBe(true);
    expect(JSON.parse(opts.body)).toEqual(PAYLOAD);
  });

  it("falls back to fetch(keepalive) when sendBeacon returns false (queue full/refused)", () => {
    navigator.sendBeacon = vi.fn(() => false);
    const fetchMock = vi.fn(() => Promise.resolve({}));
    global.fetch = fetchMock;

    postAudit("https://example.com/audit", PAYLOAD);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never throws when both sendBeacon and fetch are missing", () => {
    delete navigator.sendBeacon;
    delete global.fetch;
    expect(() => postAudit("https://example.com/audit", PAYLOAD)).not.toThrow();
  });

  it("never throws when the payload is unserializable (circular reference)", () => {
    navigator.sendBeacon = vi.fn(() => true);
    const circular = { a: 1 };
    circular.self = circular;
    expect(() => postAudit("https://example.com/audit", circular)).not.toThrow();
    expect(navigator.sendBeacon).not.toHaveBeenCalled();
  });
});
