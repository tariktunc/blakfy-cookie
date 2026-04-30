"use client";
// blakfy-cookie/packages/cookie-next/src/BlakfyCookieProvider.tsx — SSR-safe provider via next/script beforeInteractive

import { useEffect } from "react";
import Script from "next/script";
import type { BlakfyCookieConfig, BlakfyLocale } from "./types";

interface Props extends BlakfyCookieConfig {
  children?: React.ReactNode;
  src?: string;
}

export function BlakfyCookieProvider({
  children,
  locale = "auto",
  mainLang,
  policyUrl,
  policyVersion,
  auditEndpoint,
  position,
  theme,
  accent,
  presets,
  tcf,
  cmpId,
  ccpa,
  gpc,
  dnt,
  statusUrl,
  statusEnabled,
  cdnVersion = "2",
  src: srcOverride,
}: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (locale === "auto") return;
    const apply = () => {
      if (window.BlakfyCookie) {
        window.BlakfyCookie.setLocale(locale as BlakfyLocale);
      }
    };
    apply();
    const handler = () => apply();
    window.addEventListener("blakfy:ready", handler);
    return () => {
      window.removeEventListener("blakfy:ready", handler);
    };
  }, [locale]);

  const src = srcOverride || `https://cdn.jsdelivr.net/gh/tariktunc/blakfy-cookie@v${cdnVersion}/dist/cookie.min.js`;

  const dataAttrs: Record<string, string> = {};
  dataAttrs["data-blakfy-locale"] = locale;
  if (mainLang) dataAttrs["data-blakfy-main-lang"] = mainLang;
  if (policyUrl) dataAttrs["data-blakfy-policy-url"] = policyUrl;
  if (policyVersion) dataAttrs["data-blakfy-version"] = policyVersion;
  if (auditEndpoint) dataAttrs["data-blakfy-audit-endpoint"] = auditEndpoint;
  if (position) dataAttrs["data-blakfy-position"] = position;
  if (theme) dataAttrs["data-blakfy-theme"] = theme;
  if (accent) dataAttrs["data-blakfy-accent"] = accent;
  if (presets) dataAttrs["data-blakfy-presets"] = presets;
  if (typeof tcf === "boolean") dataAttrs["data-blakfy-tcf"] = tcf ? "true" : "false";
  if (cmpId !== undefined) dataAttrs["data-blakfy-cmp-id"] = String(cmpId);
  if (ccpa) dataAttrs["data-blakfy-ccpa"] = ccpa;
  if (gpc) dataAttrs["data-blakfy-gpc"] = gpc;
  if (dnt) dataAttrs["data-blakfy-dnt"] = dnt;
  if (statusUrl) dataAttrs["data-blakfy-status-url"] = statusUrl;
  if (typeof statusEnabled === "boolean")
    dataAttrs["data-blakfy-status-enabled"] = statusEnabled ? "true" : "false";

  return (
    <>
      <Script
        id="blakfy-cookie-script"
        src={src}
        strategy="beforeInteractive"
        onLoad={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("blakfy:ready"));
          }
        }}
        {...dataAttrs}
      />
      {children}
    </>
  );
}
