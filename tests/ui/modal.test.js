// tests/ui/modal.test.js — preferences modal a11y attributes (#27)

import { describe, it, expect, vi } from "vitest";

import { createModal } from "../../src/ui/modal.js";

const t = {
  title: "Çerez Tercihleri",
  save: "Kaydet",
  acceptAll: "Tümünü Kabul",
  close: "Kapat",
  tabs: { categories: "Kategoriler", services: "Hizmetler", about: "Hakkında" },
  cat: {
    essential: { title: "Zorunlu", desc: "Site için gerekli", always: "her zaman açık" },
    analytics: { title: "Analitik", desc: "Kullanım ölçümü" },
    marketing: { title: "Pazarlama", desc: "Reklam kişiselleştirme" },
    functional: { title: "İşlevsel", desc: "Ek özellikler" },
  },
};

const baseProps = {
  t,
  isRTL: false,
  accent: "#000",
  theme: "auto",
  currentState: { analytics: false, marketing: false, functional: false },
  presets: [],
  version: "2.3.2",
};

describe("createModal", () => {
  it("role=dialog + aria-modal=true (true APG modal, unlike the banner)", () => {
    const card = createModal(baseProps);
    expect(card.getAttribute("role")).toBe("dialog");
    expect(card.getAttribute("aria-modal")).toBe("true");
    expect(card.getAttribute("aria-labelledby")).toBe("blakfy-mtitle");
  });

  it("lang set on the widget root when a locale is passed", () => {
    const card = createModal({ ...baseProps, locale: "en" });
    expect(card.getAttribute("lang")).toBe("en");
  });

  it("lang omitted when no locale is passed (no regression)", () => {
    const card = createModal(baseProps);
    expect(card.hasAttribute("lang")).toBe(false);
  });

  it("every category switch is named via aria-labelledby pointing at its title", () => {
    const card = createModal(baseProps);
    const switches = card.querySelectorAll(".blakfy-switch");
    expect(switches.length).toBe(4);
    switches.forEach((sw) => {
      const labelledby = sw.getAttribute("aria-labelledby");
      expect(labelledby).toBeTruthy();
      const titleEl = card.querySelector("#" + labelledby);
      expect(titleEl).not.toBeNull();
      expect(titleEl.tagName).toBe("STRONG");
      expect(titleEl.textContent.length).toBeGreaterThan(0);
    });
  });

  it("falls back to the raw category key when a translation is missing", () => {
    const card = createModal({ ...baseProps, t: {} });
    const sw = card.querySelector('[data-cat="essential"]');
    const labelledby = sw.getAttribute("aria-labelledby");
    expect(card.querySelector("#" + labelledby).textContent).toBe("essential");
  });
});

describe("createModal — in-widget policy tab (#49)", () => {
  it("adds a Policy tab when policyUrl is 'auto' (default)", () => {
    const card = createModal({ ...baseProps, policyUrl: "auto", locale: "en" });
    expect(card.querySelector('.blakfy-tab-btn[data-tab="policy"]')).not.toBeNull();
    expect(card.querySelector('.blakfy-tab-panel[data-panel="policy"]')).not.toBeNull();
  });

  it("adds a Policy tab when policyUrl is unset", () => {
    const card = createModal({ ...baseProps, locale: "en" });
    expect(card.querySelector('.blakfy-tab-btn[data-tab="policy"]')).not.toBeNull();
  });

  it("does NOT add a Policy tab when a real policyUrl is configured", () => {
    const card = createModal({ ...baseProps, policyUrl: "/cerez-politikasi", locale: "en" });
    expect(card.querySelector('.blakfy-tab-btn[data-tab="policy"]')).toBeNull();
    expect(card.querySelector('.blakfy-tab-panel[data-panel="policy"]')).toBeNull();
  });

  it("shows the incomplete warning when operator/operatorContact are not configured", () => {
    const card = createModal({ ...baseProps, locale: "en" });
    const panel = card.querySelector('.blakfy-tab-panel[data-panel="policy"]');
    expect(panel.querySelector(".blakfy-policy-warning")).not.toBeNull();
  });

  it("logs a console.error when the notice is incomplete", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    createModal({ ...baseProps, locale: "en" });
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain("INCOMPLETE");
    spy.mockRestore();
  });

  it("does not warn and renders controller identity when operator fields are set", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const card = createModal({
      ...baseProps,
      locale: "en",
      operator: "Acme A.S.",
      operatorContact: "privacy@acme.test",
    });
    const panel = card.querySelector('.blakfy-tab-panel[data-panel="policy"]');
    expect(panel.querySelector(".blakfy-policy-warning")).toBeNull();
    expect(panel.textContent).toContain("Acme A.S.");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("initialTab='policy' opens directly on the Policy tab", () => {
    const card = createModal({ ...baseProps, locale: "en", initialTab: "policy" });
    const policyBtn = card.querySelector('.blakfy-tab-btn[data-tab="policy"]');
    const catBtn = card.querySelector('.blakfy-tab-btn[data-tab="categories"]');
    expect(policyBtn.getAttribute("aria-selected")).toBe("true");
    expect(catBtn.getAttribute("aria-selected")).toBe("false");
    expect(
      card.querySelector('.blakfy-tab-panel[data-panel="policy"]').getAttribute("aria-hidden")
    ).toBe("false");
  });
});
