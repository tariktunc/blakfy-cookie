// @blakfy/cookie — public ambient type definitions
// Bu dosya scripts/build.js tarafından dist/cookie.d.ts olarak kopyalanır.
// `import "@blakfy/cookie"` deyince TypeScript bu dosyayı pickup eder.

/** Desteklenen 23 dil (BCP47) */
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

/** Tespit edilen yasal yetki alanı */
export type Jurisdiction = "GDPR" | "CCPA" | "LGPD" | "default";

/** Consent kategorileri — `essential` her zaman `true` */
export type ConsentCategory =
  | "essential"
  | "analytics"
  | "marketing"
  | "functional"
  | "recording";

/** Banner / modal konum seçenekleri (default: bottom-center) */
export type BlakfyPosition =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

/** Renk teması (default: auto = prefers-color-scheme) */
export type BlakfyTheme = "light" | "gray" | "dark" | "auto";

/** Tam consent state — `getState()` döndürür */
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

/** Widget konfigürasyon nesnesi (data-blakfy-* attribute karşılıkları) */
export interface BlakfyCookieConfig {
  locale?: BlakfyLocale | "auto";
  mainLang?: BlakfyLocale;
  policyUrl?: string;
  policyVersion?: string;
  auditEndpoint?: string;
  position?: BlakfyPosition;
  theme?: BlakfyTheme;
  accent?: string;
  presets?: string;
  tcf?: boolean;
  cmpId?: number | string;
  ccpa?: "auto" | "true" | "false";
  gpc?: "respect" | "ignore";
  dnt?: "respect" | "auto-deny";
  statusUrl?: string;
  statusEnabled?: boolean;
}

/** registerCleanup() seçenekleri */
export interface RegisterCleanupOptions {
  category: ConsentCategory;
  cookies?: (string | RegExp)[];
  storage?: string[];
}

/** TCF v2.2 API alt-modülü */
export interface BlakfyTcfApi {
  getTCString(): string | null;
}

/** CCPA / CPRA API alt-modülü */
export interface BlakfyCcpaApi {
  optOut(): void;
  isOptedOut(): boolean;
}

/** Public window.BlakfyCookie API yüzeyi */
export interface BlakfyCookieAPI {
  /** Kütüphane sürümü (örn. "2.1.2") */
  version: string;
  /** Tercihler modalını aç */
  open(): void;
  /** Tüm kategorileri kabul et */
  acceptAll(): void;
  /** Tüm kategorileri reddet (essential dışında) */
  rejectAll(): void;
  /** Kategori onaylı mı? `essential` her zaman true */
  getConsent(category: ConsentCategory): boolean;
  /** Tam consent state objesi (henüz karar verilmediyse null) */
  getState(): BlakfyConsentState | null;
  /** State değişince çağrılır */
  onChange(fn: (state: BlakfyConsentState) => void): void;
  /** Kategori-bazlı listener; mevcut state ile anında çağrılır */
  onConsent(category: ConsentCategory, fn: (granted: boolean) => void): void;
  /** Dili değiştir (UI re-render) */
  setLocale(locale: BlakfyLocale): void;
  /** Audit log için ayarlanan birincil dil */
  getMainLang(): BlakfyLocale;
  /** Onay geri çekildiğinde silinecek cookie/localStorage anahtarları */
  registerCleanup(opts: RegisterCleanupOptions): void;
  /** Kategori için tag-gating'i manuel aç */
  unblock(category: ConsentCategory): void;
  /** DOM'u tekrar tara (SPA navigasyonu sonrası) */
  scan(): void;
  /** Hazır preset'i runtime'da uygula */
  usePreset(name: string): void;
  /** IAB TCF v2.2 alt-modülü */
  tcf: BlakfyTcfApi;
  /** CCPA / CPRA alt-modülü */
  ccpa: BlakfyCcpaApi;
  /** Tespit edilen yasal yetki alanı */
  getJurisdiction(): Jurisdiction;
}

declare global {
  interface Window {
    BlakfyCookie?: BlakfyCookieAPI;
    /** Google gtag — IAB CMP standartlarına uyumlu */
    gtag?: (...args: unknown[]) => void;
    /** Microsoft UET (Bing Ads) consent queue */
    uetq?: unknown[];
    /** Yandex Metrica */
    ym?: unknown;
    /** Google Tag Manager dataLayer */
    dataLayer?: unknown[];
    /** IAB TCF v2.2 standart API */
    __tcfapi?: (
      cmd: string,
      version: number,
      callback: (data: unknown, success: boolean) => void,
      parameter?: unknown
    ) => void;
    /** IAB CCPA / USP API */
    __uspapi?: (
      cmd: string,
      version: number,
      callback: (data: unknown, success: boolean) => void
    ) => void;
    /** Global Privacy Control sinyali */
    globalPrivacyControl?: boolean;
  }
}

export {};
