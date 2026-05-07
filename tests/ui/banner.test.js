// tests/ui/banner.test.js — DOM yapısı + click handler + a11y attribute'ları

import { describe, it, expect, vi } from "vitest";

import { createBanner } from "../../src/ui/banner.js";

const t = {
  title: "Çerez Tercihleri",
  intro: "Bu site çerez kullanır.",
  policyLink: "Çerez Politikası",
  acceptAll: "Tümünü Kabul",
  rejectAll: "Tümünü Reddet",
  preferences: "Tercihler",
};

describe("createBanner", () => {
  it("returns a div with class blakfy-card", () => {
    const card = createBanner({ t, isRTL: false, accent: "#000", theme: "auto", policyUrl: "/p" });
    expect(card.tagName).toBe("DIV");
    expect(card.className).toContain("blakfy-card");
  });

  it("has correct ARIA attributes (role, labelledby, describedby)", () => {
    const card = createBanner({ t, isRTL: false, accent: "#000", theme: "auto", policyUrl: "/p" });
    expect(card.getAttribute("role")).toBe("dialog");
    expect(card.getAttribute("aria-labelledby")).toBe("blakfy-title");
    expect(card.getAttribute("aria-describedby")).toBe("blakfy-desc");
  });

  it("dir='rtl' when isRTL=true", () => {
    const card = createBanner({ t, isRTL: true, accent: "#000", theme: "auto", policyUrl: "/p" });
    expect(card.getAttribute("dir")).toBe("rtl");
  });

  it("dir='ltr' when isRTL=false", () => {
    const card = createBanner({ t, isRTL: false, accent: "#000", theme: "auto", policyUrl: "/p" });
    expect(card.getAttribute("dir")).toBe("ltr");
  });

  it("title and intro text rendered from translation", () => {
    const card = createBanner({ t, isRTL: false, accent: "#000", theme: "auto", policyUrl: "/p" });
    expect(card.querySelector("h2").textContent).toBe("Çerez Tercihleri");
    expect(card.querySelector("p").textContent).toContain("Bu site çerez kullanır.");
  });

  it("policy link uses provided URL and link text", () => {
    const card = createBanner({
      t,
      isRTL: false,
      accent: "#000",
      theme: "auto",
      policyUrl: "/cerez-politikasi",
    });
    const link = card.querySelector("a");
    expect(link.getAttribute("href")).toBe("/cerez-politikasi");
    expect(link.textContent).toBe("Çerez Politikası");
  });

  it("3 buttons: reject, prefs, accept (in that order)", () => {
    const card = createBanner({ t, isRTL: false, accent: "#000", theme: "auto", policyUrl: "/p" });
    const buttons = card.querySelectorAll("button");
    expect(buttons.length).toBe(3);
    expect(buttons[0].getAttribute("data-act")).toBe("reject");
    expect(buttons[1].getAttribute("data-act")).toBe("prefs");
    expect(buttons[2].getAttribute("data-act")).toBe("accept");
  });

  it("accept button has primary CSS class", () => {
    const card = createBanner({ t, isRTL: false, accent: "#000", theme: "auto", policyUrl: "/p" });
    const acceptBtn = card.querySelector('button[data-act="accept"]');
    expect(acceptBtn.className).toContain("blakfy-btn-primary");
  });

  it("click on accept button triggers onAccept callback", () => {
    const onAccept = vi.fn();
    const card = createBanner({
      t,
      isRTL: false,
      accent: "#000",
      theme: "auto",
      policyUrl: "/p",
      onAccept,
    });
    card.querySelector('button[data-act="accept"]').click();
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("click on reject button triggers onReject callback", () => {
    const onReject = vi.fn();
    const card = createBanner({
      t,
      isRTL: false,
      accent: "#000",
      theme: "auto",
      policyUrl: "/p",
      onReject,
    });
    card.querySelector('button[data-act="reject"]').click();
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it("click on prefs button triggers onPrefs callback", () => {
    const onPrefs = vi.fn();
    const card = createBanner({
      t,
      isRTL: false,
      accent: "#000",
      theme: "auto",
      policyUrl: "/p",
      onPrefs,
    });
    card.querySelector('button[data-act="prefs"]').click();
    expect(onPrefs).toHaveBeenCalledTimes(1);
  });

  it("data-blakfy-theme attribute set for non-light theme", () => {
    const dark = createBanner({ t, isRTL: false, accent: "#000", theme: "dark", policyUrl: "/p" });
    expect(dark.getAttribute("data-blakfy-theme")).toBe("dark");

    const gray = createBanner({ t, isRTL: false, accent: "#000", theme: "gray", policyUrl: "/p" });
    expect(gray.getAttribute("data-blakfy-theme")).toBe("gray");

    const light = createBanner({
      t,
      isRTL: false,
      accent: "#000",
      theme: "light",
      policyUrl: "/p",
    });
    expect(light.getAttribute("data-blakfy-theme")).toBe(null);
  });

  it("accent color injected as CSS variable", () => {
    const card = createBanner({
      t,
      isRTL: false,
      accent: "#FF5733",
      theme: "auto",
      policyUrl: "/p",
    });
    expect(card.style.cssText).toContain("--blakfy-accent");
    expect(card.style.cssText).toContain("#FF5733");
  });

  it("includes badge slot for 'Powered by Blakfy Studio'", () => {
    const card = createBanner({ t, isRTL: false, accent: "#000", theme: "auto", policyUrl: "/p" });
    expect(card.querySelector(".blakfy-badge-slot")).toBeTruthy();
  });
});
