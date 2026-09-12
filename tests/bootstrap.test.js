import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

import { JSDOM } from "jsdom";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

let bundle;
let dom;

beforeAll(() => {
  // Build in Node, outside the jsdom realm used by the unit test suite.
  const require = createRequire(import.meta.url);
  bundle = execFileSync(
    process.execPath,
    [require.resolve("esbuild/bin/esbuild"), "src/index.js", "--bundle", "--format=iife"],
    { encoding: "utf8" }
  );
});

afterEach(() => {
  dom?.window.close();
});

describe("vanilla bootstrap script configuration", () => {
  it.each([false, true])(
    "retains loader attributes with a following script: %s",
    async (followingScript) => {
      dom = new JSDOM(
        `<!doctype html><html lang="tr" class="dark"><body>
      <script data-blakfy-locale="en" data-blakfy-policy-url="/privacy"
        data-blakfy-version="test-version" data-blakfy-theme="light"
        data-blakfy-accent="#123456" data-blakfy-position="top-left"
        data-blakfy-margin="24" data-blakfy-status="false">${bundle}</script>
      ${followingScript ? "<script>window.unrelatedScriptRan = true;</script>" : ""}
      </body></html>`,
        {
          url: "https://example.test/",
          runScripts: "dangerously",
          beforeParse(window) {
            window.fetch = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
          },
        }
      );
      const { window } = dom;
      await vi.waitFor(() => expect(window.document.querySelector(".blakfy-card")).not.toBeNull());
      const card = window.document.querySelector(".blakfy-card");
      expect(card.querySelector("a").getAttribute("href")).toBe("/privacy");
      expect(card.style.getPropertyValue("--blakfy-accent")).toBe("#123456");
      expect(card.getAttribute("data-blakfy-theme")).toBeNull();
      expect(card.querySelector('[data-act="accept"]').textContent).toBe("Accept All");
      const overlay = window.document.querySelector(".blakfy-overlay");
      expect(overlay.classList.contains("top-left")).toBe(true);
      expect(overlay.style.getPropertyValue("--blakfy-margin")).toBe("24px");
      if (followingScript) expect(window.unrelatedScriptRan).toBe(true);
      expect(window.fetch).not.toHaveBeenCalled();
      window.BlakfyCookie.rejectAll();
      expect(window.BlakfyCookie.getState().version).toBe("test-version");
    }
  );
});
