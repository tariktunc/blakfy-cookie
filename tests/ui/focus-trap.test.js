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

describe("#27: trapBackground (inert / fallback)", () => {
  let overlay, root, sibling;

  beforeEach(() => {
    sibling = document.createElement("main");
    sibling.innerHTML = '<a href="#">Page link</a>';
    document.body.appendChild(sibling);

    overlay = document.createElement("div");
    root = document.createElement("div");
    root.innerHTML = '<button id="mb1">Modal button</button>';
    overlay.appendChild(root);
    document.body.appendChild(overlay);
  });

  afterEach(() => {
    removeFocusTrap();
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (sibling.parentNode) sibling.parentNode.removeChild(sibling);
  });

  it("marks background siblings inert (or the tabindex/aria-hidden fallback), never the overlay itself", () => {
    installFocusTrap(root, { trapBackground: true });
    const usesNativeInert = "inert" in document.createElement("div");
    if (usesNativeInert) {
      expect(sibling.hasAttribute("inert")).toBe(true);
    } else {
      expect(sibling.getAttribute("tabindex")).toBe("-1");
      expect(sibling.getAttribute("aria-hidden")).toBe("true");
    }
    expect(overlay.hasAttribute("inert")).toBe(false);
  });

  it("restores the background on removeFocusTrap", () => {
    installFocusTrap(root, { trapBackground: true });
    removeFocusTrap();
    expect(sibling.hasAttribute("inert")).toBe(false);
    expect(sibling.hasAttribute("tabindex")).toBe(false);
    expect(sibling.hasAttribute("aria-hidden")).toBe(false);
  });

  it("without trapBackground, siblings are left untouched (banner stays non-modal)", () => {
    installFocusTrap(root, {});
    expect(sibling.hasAttribute("inert")).toBe(false);
  });
});

describe("#27: lockScroll (body scroll lock + restore)", () => {
  let root;

  beforeEach(() => {
    root = document.createElement("div");
    root.innerHTML = '<button id="mb1">Modal button</button>';
    document.body.appendChild(root);
    document.body.style.overflow = "";
  });

  afterEach(() => {
    removeFocusTrap();
    document.body.style.overflow = "";
    if (root.parentNode) root.parentNode.removeChild(root);
  });

  it("sets body overflow:hidden while locked, restores previous value on remove", () => {
    document.body.style.overflow = "auto";
    installFocusTrap(root, { lockScroll: true });
    expect(document.body.style.overflow).toBe("hidden");
    removeFocusTrap();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("without lockScroll, body overflow is untouched (banner stays scrollable)", () => {
    installFocusTrap(root, {});
    expect(document.body.style.overflow).toBe("");
  });
});

describe("#27: opener focus return on close", () => {
  let opener, root;

  beforeEach(() => {
    opener = document.createElement("button");
    opener.id = "opener";
    document.body.appendChild(opener);
    root = document.createElement("div");
    root.innerHTML = '<button id="mb1">Modal button</button>';
    document.body.appendChild(root);
  });

  afterEach(() => {
    removeFocusTrap();
    if (opener.parentNode) opener.parentNode.removeChild(opener);
    if (root.parentNode) root.parentNode.removeChild(root);
  });

  it("returns focus to the element that had it before install, once the trap is removed", () => {
    opener.focus();
    expect(document.activeElement).toBe(opener);

    installFocusTrap(root, {});
    expect(document.activeElement).toBe(root.querySelector("#mb1"));

    removeFocusTrap();
    expect(document.activeElement).toBe(opener);
  });

  it("returnFocus:false opts out of restoring the opener", () => {
    opener.focus();
    installFocusTrap(root, { returnFocus: false });
    removeFocusTrap();
    expect(document.activeElement).not.toBe(opener);
  });

  it("banner → modal handoff keeps the ORIGINAL opener, not the intermediate trap's target", () => {
    opener.focus();
    const bannerRoot = document.createElement("div");
    bannerRoot.innerHTML = '<button id="bb1">Banner button</button>';
    document.body.appendChild(bannerRoot);

    installFocusTrap(bannerRoot, {}); // banner opens, steals focus from opener
    const modalOpener = document.activeElement; // e.g. banner's "Preferences" button
    installFocusTrap(root, {}); // user opens the preferences modal
    removeFocusTrap();
    expect(document.activeElement).toBe(modalOpener);

    if (bannerRoot.parentNode) bannerRoot.parentNode.removeChild(bannerRoot);
  });
});
