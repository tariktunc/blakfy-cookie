"use client";
// blakfy-cookie/packages/cookie-next/src/useBlakfyConsent.ts — event-based consent state hook (no polling)

import { useCallback, useEffect, useState } from "react";

import type { BlakfyConsentState, ConsentCategory, Jurisdiction } from "./types";

export function useBlakfyConsent() {
  const [state, setState] = useState<BlakfyConsentState | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let unsubscribed = false;

    const subscribe = () => {
      if (unsubscribed) return false;
      const api = window.BlakfyCookie;
      if (!api) return false;
      setState(api.getState());
      api.onChange((s: BlakfyConsentState) => {
        if (!unsubscribed) setState(s);
      });
      return true;
    };

    if (subscribe()) return;

    const onReady = () => {
      subscribe();
    };
    window.addEventListener("blakfy:ready", onReady);
    return () => {
      unsubscribed = true;
      window.removeEventListener("blakfy:ready", onReady);
    };
  }, []);

  const open = useCallback(() => {
    if (typeof window !== "undefined") window.BlakfyCookie?.open();
  }, []);
  const acceptAll = useCallback(() => {
    if (typeof window !== "undefined") window.BlakfyCookie?.acceptAll();
  }, []);
  const rejectAll = useCallback(() => {
    if (typeof window !== "undefined") window.BlakfyCookie?.rejectAll();
  }, []);

  const getConsent = useCallback(
    (c: ConsentCategory): boolean => {
      if (state) return !!state[c];
      return c === "essential";
    },
    [state]
  );

  const jurisdiction: Jurisdiction | null = state?.jurisdiction ?? null;

  return { state, open, acceptAll, rejectAll, getConsent, jurisdiction };
}
