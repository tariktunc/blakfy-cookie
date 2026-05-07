/**
 * Hydration safety: SSR'dan gelen markup'a hydrateRoot ile bağlanırken
 * React'ın hydration mismatch warning'i oluşturmaması beklenir.
 * Mismatch warning hydration güvenilirliğini bozar (Next.js'te console.error throw'a çevrilir).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "@testing-library/react";
import { BlakfyCookieProvider } from "../src/BlakfyCookieProvider";
import { ConsentModeDefault } from "../src/ConsentModeDefault";

describe("Hydration safety (jsdom env)", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("BlakfyCookieProvider hydrates without mismatch", () => {
    const ssrHtml = renderToString(
      <BlakfyCookieProvider locale="tr" theme="dark">
        <div>Hello</div>
      </BlakfyCookieProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = ssrHtml;
    document.body.appendChild(container);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    act(() => {
      root = hydrateRoot(
        container,
        <BlakfyCookieProvider locale="tr" theme="dark">
          <div>Hello</div>
        </BlakfyCookieProvider>
      );
    });

    // Hydration mismatch genelde console.error ile warn edilir
    const hydrationErrors = consoleErrorSpy.mock.calls.filter((args) =>
      args.some(
        (a) =>
          typeof a === "string" &&
          (a.includes("Hydration") || a.includes("did not match") || a.includes("mismatch"))
      )
    );
    expect(hydrationErrors).toHaveLength(0);

    act(() => root?.unmount());
    container.remove();
  });

  it("ConsentModeDefault hydrates without mismatch", () => {
    const ssrHtml = renderToString(<ConsentModeDefault />);
    const container = document.createElement("div");
    container.innerHTML = ssrHtml;
    document.body.appendChild(container);

    let root: ReturnType<typeof hydrateRoot> | undefined;
    act(() => {
      root = hydrateRoot(container, <ConsentModeDefault />);
    });

    const hydrationErrors = consoleErrorSpy.mock.calls.filter((args) =>
      args.some(
        (a) =>
          typeof a === "string" &&
          (a.includes("Hydration") || a.includes("did not match") || a.includes("mismatch"))
      )
    );
    expect(hydrationErrors).toHaveLength(0);

    act(() => root?.unmount());
    container.remove();
  });

  it("hydration runs without throwing for various props", () => {
    const cases = [
      { policyUrl: "/privacy", policyVersion: "2.0" },
      { presets: "ga4,facebook", ccpa: "auto" as const },
      { tcf: true, cmpId: 123 },
      { theme: "light" as const, accent: "#3E5C3A" },
    ];
    for (const props of cases) {
      const ssr = renderToString(<BlakfyCookieProvider {...props} />);
      const container = document.createElement("div");
      container.innerHTML = ssr;
      document.body.appendChild(container);
      let root: ReturnType<typeof hydrateRoot> | undefined;
      expect(() => {
        act(() => {
          root = hydrateRoot(container, <BlakfyCookieProvider {...props} />);
        });
      }).not.toThrow();
      act(() => root?.unmount());
      container.remove();
    }
    // consoleWarnSpy reference - sadece initialize edildiğini doğrula (linter happy)
    expect(consoleWarnSpy).toBeDefined();
  });
});
