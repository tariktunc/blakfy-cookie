# @blakfy/cookie-next

Next.js 14+ wrapper for [Blakfy Cookie Widget](https://github.com/tariktunc/blakfy-cookie). SSR-safe, no FOUC, App Router native, full TypeScript types.

KVKK + GDPR + CCPA + Google Consent Mode v2 + Microsoft UET + Yandex Metrica + IAB TCF v2.2 in one component. 23 languages. 18 vendor presets.

## Install

```bash
npm install @blakfy/cookie-next@2
# or
pnpm add @blakfy/cookie-next@2
# or
yarn add @blakfy/cookie-next@2
```

## Quick Start (App Router)

`app/layout.tsx`:

```tsx
import { BlakfyCookieProvider, ConsentModeDefault } from "@blakfy/cookie-next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {/* Sets gtag/uetq/yandex defaults to "denied" before any third-party script loads */}
        <ConsentModeDefault />
      </head>
      <body>
        <BlakfyCookieProvider
          locale="auto"
          policyUrl="/cerez-politikasi"
          policyVersion="1.0"
          presets="ga4,gtm,facebook,clarity"
          ccpa="auto"
        >
          {children}
        </BlakfyCookieProvider>
      </body>
    </html>
  );
}
```

That's it. The widget loads, banner renders, and your GTM/GA4/Pixel tags are gated by user consent automatically.

## Hooks

### `useBlakfyConsent`

Reactive consent state. Re-renders when the user accepts/rejects.

```tsx
"use client";
import { useBlakfyConsent } from "@blakfy/cookie-next";

export function PreferencesButton() {
  const { state, open, acceptAll, rejectAll, getConsent, jurisdiction } = useBlakfyConsent();

  return (
    <div>
      <button onClick={open}>Çerez Tercihleri</button>
      <p>Jurisdiction: {jurisdiction ?? "loading"}</p>
      <p>Analytics: {getConsent("analytics") ? "granted" : "denied"}</p>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

### `useGating` (kategori-bazlı koşullu render)

```tsx
"use client";
import { useGating } from "@blakfy/cookie-next";

export function YouTubeEmbed({ id }: { id: string }) {
  const allowed = useGating("marketing");
  if (!allowed) {
    return (
      <div className="aspect-video grid place-items-center bg-zinc-100">
        Marketing çerezleri reddedildi — video yüklenemiyor.
      </div>
    );
  }
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      className="w-full aspect-video"
      title="YouTube"
      allow="accelerometer; encrypted-media; clipboard-write; gyroscope"
      allowFullScreen
    />
  );
}
```

### `useTcf` (IAB TCF v2.2)

```tsx
"use client";
import { useTcf } from "@blakfy/cookie-next";

export function TcfDebug() {
  const { tcString, gdprApplies } = useTcf();
  return (
    <pre>
      gdprApplies: {String(gdprApplies)}
      {"\n"}tcString: {tcString ?? "—"}
    </pre>
  );
}
```

## Provider Props

All `BlakfyCookieConfig` fields are optional except behaviour you want to override.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `locale` | `BlakfyLocale \| "auto"` | `"auto"` | 23 BCP47 locales. `auto` detects from browser. |
| `mainLang` | `BlakfyLocale` | — | Site's primary language for audit log. |
| `policyUrl` | `string` | `"/cerez-politikasi"` | Cookie policy page. |
| `policyVersion` | `string` | `"1.0"` | Bumping triggers re-consent for all users. |
| `auditEndpoint` | `string` | — | POST endpoint for KVKK/GDPR consent log. |
| `position` | `"bottom-right" \| "bottom-left" \| "bottom" \| "top" \| "center"` | `"bottom-right"` | Banner placement. |
| `theme` | `"light" \| "dark" \| "auto"` | `"auto"` | UI theme. |
| `accent` | `string` (hex) | `"#3E5C3A"` | Button colour. |
| `presets` | `string` | — | Comma list, e.g. `"ga4,gtm,facebook"`. 18 presets total. |
| `tcf` | `boolean` | `false` | Enable IAB TCF v2.2 (`__tcfapi`). |
| `cmpId` | `number \| string` | `0` | TCF CMP ID. `0` = preview/test mode. |
| `ccpa` | `"auto" \| "true" \| "false"` | `"auto"` | Auto-detect California or force on/off. |
| `gpc` | `"respect" \| "ignore"` | `"respect"` | Auto-deny on `navigator.globalPrivacyControl`. |
| `dnt` | `"respect" \| "auto-deny"` | `"respect"` | Do Not Track behaviour. |
| `cdnVersion` | `string` | `"2"` | jsDelivr major-pin (do not change unless pinning). |

`BlakfyLocale` union: `"tr" | "en" | "ar" | "fa" | "ur" | "fr" | "ru" | "de" | "he" | "uk" | "es" | "it" | "pt" | "nl" | "pl" | "sv" | "cs" | "zh" | "zh-TW" | "ja" | "ko" | "id" | "hi"`.

## Imperative API (anywhere in client code)

```tsx
"use client";
import { useEffect } from "react";

export function ScanOnRouteChange({ pathname }: { pathname: string }) {
  useEffect(() => {
    // Re-scan DOM for tag-gated <script>/<iframe> after SPA navigation
    window.BlakfyCookie?.scan();
  }, [pathname]);
  return null;
}
```

Available imperative methods on `window.BlakfyCookie`: `open`, `acceptAll`, `rejectAll`, `getConsent`, `getState`, `onChange`, `onConsent`, `setLocale`, `getMainLang`, `registerCleanup`, `unblock`, `scan`, `usePreset`, `tcf.getTCString`, `ccpa.optOut`, `ccpa.isOptedOut`, `getJurisdiction`. Full reference: [root README](https://github.com/tariktunc/blakfy-cookie#api-reference).

## Migration v1 → v2

- **npm public package** (was GitHub-only import in v1).
- TypeScript `BlakfyLocale` expanded from 9 → **23** locales.
- New hooks: `useGating`, `useTcf`.
- **FOUC fix:** Provider now uses `next/script` `strategy="beforeInteractive"`.
- `useBlakfyConsent` is now event-driven (no polling).
- v1 API contracts preserved — `acceptAll`, `rejectAll`, `open`, `getConsent`, `getState`, `onChange`, `setLocale` work unchanged.

Detail: [MIGRATION.md](https://github.com/tariktunc/blakfy-cookie/blob/main/MIGRATION.md).

## License

MIT © Blakfy Studio. "Powered by Blakfy Studio" badge is non-removable (anti-tampering protected).

Issues: https://github.com/tariktunc/blakfy-cookie/issues
