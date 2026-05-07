/**
 * @vitest-environment node
 *
 * SSR safety: BlakfyCookieProvider, ConsentModeDefault ve hook'ların
 * Node ortamında (window yok) hata fırlatmadan renderToString üretmesi.
 * Bu test Next.js Server Components / SSR rendering ortamını taklit eder.
 */
import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";

// next/script mock — SSR ortamında da gerekli
vi.mock("next/script", () => ({
  default: ({
    src,
    id,
    strategy,
    dangerouslySetInnerHTML,
    children,
    ...rest
  }: {
    src?: string;
    id?: string;
    strategy?: string;
    dangerouslySetInnerHTML?: { __html: string };
    children?: React.ReactNode;
    [k: string]: unknown;
  }) => {
    if (dangerouslySetInnerHTML) {
      return (
        <script
          id={id}
          data-strategy={strategy}
          dangerouslySetInnerHTML={dangerouslySetInnerHTML}
          {...rest}
        />
      );
    }
    return (
      <script id={id} src={src} data-strategy={strategy} {...rest}>
        {children}
      </script>
    );
  },
}));

import { BlakfyCookieProvider } from "../src/BlakfyCookieProvider";
import { ConsentModeDefault } from "../src/ConsentModeDefault";

describe("SSR safety (Node environment, no window)", () => {
  it("BlakfyCookieProvider renderToString does not throw", () => {
    expect(() =>
      renderToString(
        <BlakfyCookieProvider>
          <div>Content</div>
        </BlakfyCookieProvider>
      )
    ).not.toThrow();
  });

  it("BlakfyCookieProvider SSR output includes children", () => {
    const html = renderToString(
      <BlakfyCookieProvider>
        <p data-testid="ssr-child">Hello SSR</p>
      </BlakfyCookieProvider>
    );
    expect(html).toContain("Hello SSR");
  });

  it("BlakfyCookieProvider SSR output includes widget script tag", () => {
    const html = renderToString(<BlakfyCookieProvider />);
    expect(html).toContain("script");
    expect(html).toContain("@blakfy/cookie@2");
    expect(html).toContain("/dist/cookie.min.js");
  });

  it("BlakfyCookieProvider SSR includes data-blakfy-* attrs", () => {
    const html = renderToString(
      <BlakfyCookieProvider locale="tr" presets="ga4,gtm" theme="dark" />
    );
    expect(html).toContain('data-blakfy-locale="tr"');
    expect(html).toContain('data-blakfy-presets="ga4,gtm"');
    expect(html).toContain('data-blakfy-theme="dark"');
  });

  it("ConsentModeDefault renderToString does not throw", () => {
    expect(() => renderToString(<ConsentModeDefault />)).not.toThrow();
  });

  it("ConsentModeDefault SSR output contains gtag consent default script", () => {
    const html = renderToString(<ConsentModeDefault />);
    expect(html).toContain("blakfy-consent-defaults");
    // dangerouslySetInnerHTML SSR'da inline render edilir
    expect(html).toContain("gtag");
  });

  it("Provider with TCF enabled SSR-safe", () => {
    expect(() =>
      renderToString(<BlakfyCookieProvider tcf={true} cmpId={42} ccpa="auto" gpc="respect" />)
    ).not.toThrow();
    const html = renderToString(<BlakfyCookieProvider tcf={true} cmpId={42} />);
    expect(html).toContain('data-blakfy-tcf="true"');
    expect(html).toContain('data-blakfy-cmp-id="42"');
  });

  it("typeof window check guards window access in SSR", () => {
    // Provider'ın setLocale useEffect'i (locale !== "auto" için) Node'da silent skip etmeli
    expect(() => renderToString(<BlakfyCookieProvider locale="tr" />)).not.toThrow();
    // 'auto' default'u da ok
    expect(() => renderToString(<BlakfyCookieProvider />)).not.toThrow();
  });
});
