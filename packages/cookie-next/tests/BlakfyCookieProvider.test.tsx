import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlakfyCookieProvider } from "../src/BlakfyCookieProvider";

describe("BlakfyCookieProvider", () => {
  it("renders children", () => {
    render(
      <BlakfyCookieProvider>
        <div data-testid="child">Hello</div>
      </BlakfyCookieProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("injects widget script with default npm CDN URL (cdnVersion=2)", () => {
    render(<BlakfyCookieProvider />);
    const scripts = document.querySelectorAll("script[id^='blakfy']");
    const widgetScript = Array.from(scripts).find((s) =>
      s.getAttribute("src")?.includes("/dist/cookie.min.js")
    );
    expect(widgetScript).toBeTruthy();
    expect(widgetScript?.getAttribute("src")).toContain("@blakfy/cookie@2");
    expect(widgetScript?.getAttribute("src")).toContain("/npm/");
  });

  it("uses custom cdnVersion in widget URL", () => {
    render(<BlakfyCookieProvider cdnVersion="2.1.2" />);
    const scripts = document.querySelectorAll("script");
    const widgetScript = Array.from(scripts).find((s) =>
      s.getAttribute("src")?.includes("@blakfy/cookie@2.1.2")
    );
    expect(widgetScript).toBeTruthy();
  });

  it("respects srcOverride prop (custom CDN)", () => {
    render(<BlakfyCookieProvider src="https://my-cdn.test/cookie.min.js" />);
    const scripts = document.querySelectorAll("script");
    const widgetScript = Array.from(scripts).find(
      (s) => s.getAttribute("src") === "https://my-cdn.test/cookie.min.js"
    );
    expect(widgetScript).toBeTruthy();
  });

  it("maps config props to data-blakfy-* attributes", () => {
    render(
      <BlakfyCookieProvider
        locale="tr"
        policyUrl="/cerez"
        policyVersion="1.5"
        presets="ga4,gtm"
        ccpa="auto"
        tcf={true}
        cmpId={42}
        accent="#FF0000"
        theme="dark"
      />
    );
    const widgetScript = document.querySelector("script[data-blakfy-locale]");
    expect(widgetScript).toBeTruthy();
    expect(widgetScript?.getAttribute("data-blakfy-locale")).toBe("tr");
    expect(widgetScript?.getAttribute("data-blakfy-policy-url")).toBe("/cerez");
    expect(widgetScript?.getAttribute("data-blakfy-version")).toBe("1.5");
    expect(widgetScript?.getAttribute("data-blakfy-presets")).toBe("ga4,gtm");
    expect(widgetScript?.getAttribute("data-blakfy-ccpa")).toBe("auto");
    expect(widgetScript?.getAttribute("data-blakfy-tcf")).toBe("true");
    expect(widgetScript?.getAttribute("data-blakfy-cmp-id")).toBe("42");
    expect(widgetScript?.getAttribute("data-blakfy-accent")).toBe("#FF0000");
    expect(widgetScript?.getAttribute("data-blakfy-theme")).toBe("dark");
  });

  it("uses beforeInteractive strategy (FOUC koruması)", () => {
    render(<BlakfyCookieProvider />);
    const scripts = document.querySelectorAll("script");
    const widgetScript = Array.from(scripts).find((s) =>
      s.getAttribute("src")?.includes("/dist/cookie.min.js")
    );
    expect(widgetScript?.getAttribute("data-strategy")).toBe("beforeInteractive");
  });
});
