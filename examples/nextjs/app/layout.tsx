// examples/nextjs/app/layout.tsx — root layout wires up Blakfy Cookie Provider + ConsentModeDefault
import type { Metadata } from "next";
import { BlakfyCookieProvider, ConsentModeDefault } from "@blakfy/cookie-next";

export const metadata: Metadata = {
  title: "Blakfy Cookie — Next.js example",
  description:
    "Minimal Next.js 15 demo of @blakfy/cookie-next: SSR-safe consent widget with GCM v2, UET, Yandex, TCF v2.2, CCPA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/*
          ConsentModeDefault MUST come before any third-party tag.
          It sets gtag/uetq/ym defaults to 'denied' synchronously
          via next/script strategy="beforeInteractive".
        */}
        <ConsentModeDefault />
      </head>
      <body
        suppressHydrationWarning
        style={{
          font: '16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          maxWidth: 960,
          margin: "0 auto",
          padding: 24,
          color: "#111",
        }}
      >
        <BlakfyCookieProvider
          locale="auto"
          policyUrl="/cerez-politikasi"
          policyVersion="1.0"
          presets="ga4,gtm,facebook,clarity,youtube"
          ccpa="auto"
          tcf={false}
          gpc="respect"
          dnt="respect"
          theme="auto"
          accent="#3E5C3A"
        >
          {children}
        </BlakfyCookieProvider>
      </body>
    </html>
  );
}
