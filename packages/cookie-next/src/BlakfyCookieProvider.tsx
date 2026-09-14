"use client";
// blakfy-cookie/packages/cookie-next/src/BlakfyCookieProvider.tsx — SSR-safe provider via next/script beforeInteractive

import Script from "next/script";
import { useEffect } from "react";

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
  operator,
  operatorContact,
  operatorAddress,
  position = "bottom-center",
  theme = "auto",
  accent,
  presets,
  tcf,
  cmpId,
  ccpa,
  gpc,
  dnt,
  statusUrl,
  statusEnabled,
  // Owner decision 2026-09-14: default is "latest", not a pinned/floating-major
  // version -- every site auto-updates to the newest publish, no manual redeploy.
  // Mirrors the accessibility-widget policy (CLAUDE.md 6 CORE DECISIONS #4). A site
  // that needs SRI (which requires a fixed, hashable file) or deliberate change
  // control should still pass an explicit cdnVersion override.
  cdnVersion = "latest",
  fabSide,
  fabOffset,
  fabSize,
  fabWidth,
  fabHeight,
  fabColor,
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

  const src =
    srcOverride || `https://cdn.jsdelivr.net/npm/@blakfy/cookie@${cdnVersion}/dist/cookie.min.js`;

  const dataAttrs: Record<string, string> = {};
  dataAttrs["data-blakfy-locale"] = locale;
  if (mainLang) dataAttrs["data-blakfy-main-lang"] = mainLang;
  if (policyUrl) dataAttrs["data-blakfy-policy-url"] = policyUrl;
  if (policyVersion) dataAttrs["data-blakfy-version"] = policyVersion;
  if (auditEndpoint) dataAttrs["data-blakfy-audit-endpoint"] = auditEndpoint;
  // #49: required for a complete in-widget notice when policyUrl is unset/"auto" —
  // see src/compliance/policy-text.js in the vanilla package for what happens
  // without these (the notice renders but is marked incomplete, loudly, in console).
  if (operator) dataAttrs["data-blakfy-operator"] = operator;
  if (operatorContact) dataAttrs["data-blakfy-operator-contact"] = operatorContact;
  if (operatorAddress) dataAttrs["data-blakfy-operator-address"] = operatorAddress;
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
  // #45: the vanilla bundle reads `data-blakfy-status` (src/core/config.js), NOT
  // `data-blakfy-status-enabled` — this wrapper was writing an attribute name the
  // vanilla reader never looks at, so `statusEnabled={false}` silently had no effect.
  if (typeof statusEnabled === "boolean")
    dataAttrs["data-blakfy-status"] = statusEnabled ? "true" : "false";
  // #63: vanilla reads the FAB side from `data-blakfy-fab` (not `data-blakfy-fab-side`).
  if (fabSide) dataAttrs["data-blakfy-fab"] = fabSide;
  if (fabOffset != null) dataAttrs["data-blakfy-fab-offset"] = String(fabOffset);
  if (fabSize != null) dataAttrs["data-blakfy-fab-size"] = String(fabSize);
  if (fabWidth != null) dataAttrs["data-blakfy-fab-width"] = String(fabWidth);
  if (fabHeight != null) dataAttrs["data-blakfy-fab-height"] = String(fabHeight);
  if (fabColor) dataAttrs["data-blakfy-fab-color"] = fabColor;

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
