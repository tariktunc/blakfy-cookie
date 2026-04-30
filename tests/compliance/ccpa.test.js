import { describe, it, expect, vi } from "vitest";

const importFresh = async () => {
  const mod = await import("../../src/compliance/ccpa.js?t=" + Math.random());
  return mod;
};

describe("ccpa installUSP", () => {
  it("installs window.__uspapi", async () => {
    const { installUSP } = await importFresh();
    installUSP({ optedOut: false });
    expect(typeof window.__uspapi).toBe("function");
  });

  it("getUSPData returns { version: 1, uspString: '1YNN' } when not opted out", async () => {
    const { installUSP } = await importFresh();
    installUSP({ optedOut: false });
    const cb = vi.fn();
    window.__uspapi("getUSPData", 1, cb);
    expect(cb).toHaveBeenCalled();
    const arg = cb.mock.calls[0][0];
    expect(arg.version).toBe(1);
    expect(arg.uspString).toBe("1YNN");
  });

  it("after optOut(), USP string becomes '1YYN'", async () => {
    const { installUSP, optOut } = await importFresh();
    installUSP({ optedOut: false });
    optOut();
    const cb = vi.fn();
    window.__uspapi("getUSPData", 1, cb);
    expect(cb.mock.calls[0][0].uspString).toBe("1YYN");
  });

  it("isOptedOut reflects optOut() call", async () => {
    const { installUSP, optOut, isOptedOut } = await importFresh();
    installUSP({ optedOut: false });
    expect(isOptedOut()).toBe(false);
    optOut();
    expect(isOptedOut()).toBe(true);
  });
});

describe("ccpa installDoNotSellLink", () => {
  it("appends an <a> with text 'Do Not Sell or Share My Personal Information'", async () => {
    const { installDoNotSellLink } = await importFresh();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const link = installDoNotSellLink({ container });
    expect(link).not.toBeNull();
    expect(link.tagName).toBe("A");
    expect(link.textContent).toBe("Do Not Sell or Share My Personal Information");
    expect(container.querySelector(".blakfy-ccpa-link")).toBe(link);
  });

  it("click on link triggers optOut()", async () => {
    const { installUSP, installDoNotSellLink, isOptedOut } = await importFresh();
    installUSP({ optedOut: false });
    const container = document.createElement("div");
    document.body.appendChild(container);
    const link = installDoNotSellLink({ container });
    expect(isOptedOut()).toBe(false);
    link.click();
    expect(isOptedOut()).toBe(true);
  });

  it("does not duplicate when called twice on same container", async () => {
    const { installDoNotSellLink } = await importFresh();
    const container = document.createElement("div");
    document.body.appendChild(container);
    installDoNotSellLink({ container });
    installDoNotSellLink({ container });
    expect(container.querySelectorAll(".blakfy-ccpa-link").length).toBe(1);
  });
});
