// tests/ui/focus-trap.test.js — keyboard accessibility (Tab cycle, Escape)

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { installFocusTrap, removeFocusTrap } from "../../src/ui/focus-trap.js";

describe("installFocusTrap / removeFocusTrap", () => {
  let root;

  beforeEach(() => {
    root = document.createElement("div");
    root.innerHTML = `
      <button id="b1">First</button>
      <input id="i1" type="text" />
      <button id="b2">Last</button>
    `;
    document.body.appendChild(root);
  });

  afterEach(() => {
    removeFocusTrap();
    if (root.parentNode) root.parentNode.removeChild(root);
  });

  it("install + remove: temizlik yapar, error fırlatmaz", () => {
    expect(() => {
      installFocusTrap(root, {});
      removeFocusTrap();
    }).not.toThrow();
  });

  it("Escape tuşu onEscape callback'ini çağırır", () => {
    const onEscape = vi.fn();
    installFocusTrap(root, { onEscape });

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("Escape tuşu, onEscape verilmediğinde sessizce noop", () => {
    installFocusTrap(root, {});
    expect(() => {
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
    }).not.toThrow();
  });

  it("Tab tuşu son focusable'da iken focus ilk elemana döner (cycle)", () => {
    installFocusTrap(root, {});
    const last = root.querySelector("#b2");
    last.focus();
    expect(document.activeElement).toBe(last);

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    Object.defineProperty(event, "shiftKey", { value: false });
    document.dispatchEvent(event);

    // Tab cycle implementation manuel olarak focus'u ilk elemana taşır
    // Test ortamında activeElement değişmiş olmalı
    const first = root.querySelector("#b1");
    expect(document.activeElement).toBe(first);
  });

  it("Shift+Tab ilk focusable'da iken focus son elemana gider (reverse cycle)", () => {
    installFocusTrap(root, {});
    const first = root.querySelector("#b1");
    first.focus();
    expect(document.activeElement).toBe(first);

    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    Object.defineProperty(event, "shiftKey", { value: true });
    document.dispatchEvent(event);

    const last = root.querySelector("#b2");
    expect(document.activeElement).toBe(last);
  });

  it("Diğer tuşlar (örn. 'a') noop", () => {
    const onEscape = vi.fn();
    installFocusTrap(root, { onEscape });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("Yeni install eski'sini kaldırır (idempotent)", () => {
    const escape1 = vi.fn();
    const escape2 = vi.fn();
    installFocusTrap(root, { onEscape: escape1 });
    installFocusTrap(root, { onEscape: escape2 });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(escape1).not.toHaveBeenCalled();
    expect(escape2).toHaveBeenCalledTimes(1);
  });

  it("removeFocusTrap sonrası Escape no-op", () => {
    const onEscape = vi.fn();
    installFocusTrap(root, { onEscape });
    removeFocusTrap();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onEscape).not.toHaveBeenCalled();
  });

  it("rootEl null/undefined → silent skip", () => {
    expect(() => installFocusTrap(null, {})).not.toThrow();
    expect(() => installFocusTrap(undefined, {})).not.toThrow();
  });
});
