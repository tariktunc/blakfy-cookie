import { describe, it, expect, vi } from "vitest";

import { TRANSLATIONS } from "../../src/i18n/index.js";
import { createModal } from "../../src/ui/modal.js";

const mount = (t, options = {}) => {
  const card = createModal({ t, accent: "#000", ...options });
  document.body.appendChild(card);
  return card;
};

const expectCategoryNames = (card, titles) => {
  const switches = card.querySelectorAll('[role="switch"]');
  expect(switches).toHaveLength(4);
  for (const sw of switches) {
    const labelId = sw.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    const title = document.getElementById(labelId);
    expect(title).toBe(sw.closest(".blakfy-cat").querySelector("strong"));
    expect(title.textContent).toBe(titles[sw.dataset.cat]);
  }
};

describe("category switch names", () => {
  it.each(Object.entries(TRANSLATIONS))("uses the visible category titles in %s", (_, t) => {
    const card = mount(t);
    expectCategoryNames(
      card,
      Object.fromEntries(Object.entries(t.cat).map(([key, value]) => [key, value.title]))
    );
  });

  it("labels switches with the category key when no translated title is available", () => {
    expectCategoryNames(mount({}), {
      essential: "essential",
      analytics: "analytics",
      marketing: "marketing",
      functional: "functional",
    });
  });

  it("keeps switch names when preferences change and preserves the essential category", () => {
    const onSave = vi.fn();
    const t = TRANSLATIONS.en;
    const card = mount(t, { onSave });
    const essential = card.querySelector('[data-cat="essential"]');
    expect(essential.disabled).toBe(true);
    essential.click();
    expect(essential.getAttribute("aria-checked")).toBe("true");
    card.querySelector('[data-cat="analytics"]').click();
    card.querySelector('[data-act="save"]').click();
    expect(onSave).toHaveBeenCalledWith({ analytics: true, marketing: false, functional: false });
    expectCategoryNames(
      card,
      Object.fromEntries(Object.entries(t.cat).map(([key, value]) => [key, value.title]))
    );
  });
});
