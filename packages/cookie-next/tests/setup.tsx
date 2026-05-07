import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// next/script mock — testlerde gerçek Next.js runtime olmadığı için
// `<Script>` bir noop component olarak mockluyoruz; src + dangerouslySetInnerHTML
// prop'larını DOM'a yansıtırız ki test'ler içeriği inceleyebilsin.
import { vi } from "vitest";

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
    // Inline script (ConsentModeDefault için) — dangerouslySetInnerHTML üzerinden HTML render
    if (dangerouslySetInnerHTML) {
      return (
        <script
          id={id}
          data-strategy={strategy}
          data-testid={id ? `script-${id}` : "script-inline"}
          dangerouslySetInnerHTML={dangerouslySetInnerHTML}
          {...rest}
        />
      );
    }
    // External script (BlakfyCookieProvider için)
    return (
      <script
        id={id}
        src={src}
        data-strategy={strategy}
        data-testid={id ? `script-${id}` : "script-external"}
        {...rest}
      >
        {children}
      </script>
    );
  },
}));

afterEach(() => {
  // RTL cleanup ve window state reset SADECE jsdom env'de
  // (Node env'de SSR testleri için window yok, document yok)
  if (typeof window !== "undefined") {
    cleanup();
    delete (window as unknown as Record<string, unknown>).BlakfyCookie;
    delete (window as unknown as Record<string, unknown>).__blakfyConsentDefaultsLoaded;
    delete (window as unknown as Record<string, unknown>).__tcfapi;
    delete (window as unknown as Record<string, unknown>).gtag;
    delete (window as unknown as Record<string, unknown>).uetq;
    delete (window as unknown as Record<string, unknown>).ym;
    delete (window as unknown as Record<string, unknown>).dataLayer;
  }
});
