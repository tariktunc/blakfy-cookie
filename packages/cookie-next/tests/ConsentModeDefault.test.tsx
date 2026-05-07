import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ConsentModeDefault } from "../src/ConsentModeDefault";

describe("ConsentModeDefault", () => {
  it("renders an inline script with id 'blakfy-consent-defaults'", () => {
    render(<ConsentModeDefault />);
    const script = document.getElementById("blakfy-consent-defaults");
    expect(script).toBeTruthy();
  });

  it("uses beforeInteractive strategy", () => {
    render(<ConsentModeDefault />);
    const script = document.getElementById("blakfy-consent-defaults");
    expect(script?.getAttribute("data-strategy")).toBe("beforeInteractive");
  });

  it("inline script defines window.gtag with consent default = denied", () => {
    render(<ConsentModeDefault />);
    const script = document.getElementById("blakfy-consent-defaults");
    const html = script?.innerHTML || "";
    expect(html).toContain("gtag('consent','default'");
    expect(html).toContain("ad_storage:'denied'");
    expect(html).toContain("analytics_storage:'denied'");
    expect(html).toContain("ad_user_data:'denied'");
    expect(html).toContain("ad_personalization:'denied'");
  });

  it("inline script initializes UET (window.uetq) with denied default", () => {
    render(<ConsentModeDefault />);
    const html = document.getElementById("blakfy-consent-defaults")?.innerHTML || "";
    expect(html).toContain("window.uetq");
    expect(html).toContain("'consent','default'");
  });

  it("inline script wraps in IIFE with idempotency guard", () => {
    render(<ConsentModeDefault />);
    const html = document.getElementById("blakfy-consent-defaults")?.innerHTML || "";
    expect(html).toContain("__blakfyConsentDefaultsLoaded");
    expect(html).toMatch(/^\(function\(\)\{/); // IIFE pattern
  });

  it("inline script keeps security_storage granted (essential)", () => {
    render(<ConsentModeDefault />);
    const html = document.getElementById("blakfy-consent-defaults")?.innerHTML || "";
    expect(html).toContain("security_storage:'granted'");
  });
});
