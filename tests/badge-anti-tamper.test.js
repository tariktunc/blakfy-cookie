import { describe, it, expect, vi, afterEach } from "vitest";

import { mountBadges, installAntiTamper, disposeAntiTamper, buildBadge } from "../src/ui/badge.js";

const makeRoot = () => {
  const root = document.createElement("div");
  const slot = document.createElement("span");
  slot.className = "blakfy-badge-slot";
  root.appendChild(slot);
  document.body.appendChild(root);
  return root;
};

afterEach(() => {
  disposeAntiTamper();
  vi.useRealTimers();
});

describe("badge mountBadges", () => {
  it("finds .blakfy-badge-slot and replaces with badge", () => {
    const root = makeRoot();
    const result = mountBadges(root);
    expect(result.length).toBe(1);
    expect(root.querySelector(".blakfy-badge")).not.toBeNull();
  });

  it("badge has correct href, target, rel attributes", () => {
    const a = buildBadge();
    expect(a.getAttribute("href")).toBe("https://blakfy.com");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("badge text contains 'Powered by' and 'Blakfy Studio'", () => {
    const a = buildBadge();
    expect(a.textContent).toContain("Powered by");
    expect(a.textContent).toContain("Blakfy Studio");
  });

  it("ignores data-blakfy-badge='hidden' attribute (no such config read happens)", () => {
    const root = makeRoot();
    root.setAttribute("data-blakfy-badge", "hidden");
    const result = mountBadges(root);
    expect(result.length).toBe(1);
    expect(root.querySelector(".blakfy-badge")).not.toBeNull();
  });
});

describe("installAntiTamper", () => {
  it("re-injects style tag when removed", () => {
    const root = makeRoot();
    mountBadges(root);
    installAntiTamper(root);
    expect(document.getElementById("blakfy-badge-protect")).not.toBeNull();

    const style = document.getElementById("blakfy-badge-protect");
    style.parentNode.removeChild(style);
    expect(document.getElementById("blakfy-badge-protect")).toBeNull();

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(document.getElementById("blakfy-badge-protect")).not.toBeNull();
        resolve();
      }, 50);
    });
  });

  it("re-mounts badge after removal (within 100ms)", () => {
    const root = makeRoot();
    const [badge] = mountBadges(root);
    installAntiTamper(root);

    badge.parentNode.removeChild(badge);
    expect(root.querySelector(".blakfy-badge")).toBeNull();

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(root.querySelector(".blakfy-badge")).not.toBeNull();
        resolve();
      }, 100);
    });
  });
});
