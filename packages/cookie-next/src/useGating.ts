"use client";
// blakfy-cookie/packages/cookie-next/src/useGating.ts — boolean gate hook for conditionally rendering categorized content

import type { ConsentCategory } from "./types";
import { useBlakfyConsent } from "./useBlakfyConsent";

export function useGating(category: ConsentCategory): boolean {
  const { getConsent } = useBlakfyConsent();
  return getConsent(category);
}
