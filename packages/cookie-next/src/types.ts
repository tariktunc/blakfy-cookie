// blakfy-cookie/packages/cookie-next/src/types.ts — public types and Window augmentation for the wrapper

export type BlakfyLocale =
  | "tr"
  | "en"
  | "ar"
  | "fa"
  | "ur"
  | "fr"
  | "ru"
  | "de"
  | "he"
  | "uk"
  | "es"
  | "it"
  | "pt"
  | "nl"
  | "pl"
  | "sv"
  | "cs"
  | "zh"
  | "zh-TW"
  | "ja"
  | "ko"
  | "id"
  | "hi";

export type Jurisdiction = "GDPR" | "CCPA" | "LGPD" | "default";

export type ConsentCategory = "essential" | "analytics" | "marketing" | "functional" | "recording";

export interface BlakfyConsentState {
  id: string;
  essential: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  recording: boolean;
  timestamp: string;
  version: string;
  locale: string;
  mainLang: string;
  jurisdiction: Jurisdiction;
  tcString: string | null;
  uspString: string | null;
}

export interface BlakfyCookieConfig {
  locale?: BlakfyLocale | "auto";
  mainLang?: BlakfyLocale;
  policyUrl?: string;
  policyVersion?: string;
  auditEndpoint?: string;
  position?: "bottom-right" | "bottom-left" | "bottom" | "top" | "center";
  theme?: "light" | "dark" | "auto";
  accent?: string;
  presets?: string;
  tcf?: boolean;
  cmpId?: number | string;
  ccpa?: "auto" | "true" | "false";
  gpc?: "respect" | "ignore";
  dnt?: "respect" | "auto-deny";
  statusUrl?: string;
  statusEnabled?: boolean;
  cdnVersion?: string;
}

declare global {
  interface Window {
    BlakfyCookie?: {
      version: string;
      open(): void;
      acceptAll(): void;
      rejectAll(): void;
      getConsent(c: ConsentCategory): boolean;
      getState(): BlakfyConsentState | null;
      onChange(fn: (s: BlakfyConsentState) => void): void;
      onConsent(c: ConsentCategory, fn: (granted: boolean) => void): void;
      setLocale(l: BlakfyLocale): void;
      getMainLang(): BlakfyLocale;
      registerCleanup(opts: {
        category: ConsentCategory;
        cookies?: (string | RegExp)[];
        storage?: string[];
      }): void;
      unblock(c: ConsentCategory): void;
      scan(): void;
      usePreset(name: string): void;
      tcf: { getTCString(): string | null };
      ccpa: { optOut(): void; isOptedOut(): boolean };
      getJurisdiction(): Jurisdiction;
    };
    gtag?: (...args: unknown[]) => void;
    uetq?: unknown[];
    ym?: unknown;
    dataLayer?: unknown[];
    __tcfapi?: (cmd: string, version: number, callback: Function, parameter?: unknown) => void;
    __uspapi?: (cmd: string, version: number, callback: Function) => void;
  }
}

export {};
