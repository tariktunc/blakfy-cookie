"use client";
// blakfy-cookie/packages/cookie-next/src/useTcf.ts — IAB TCF v2 listener hook

import { useEffect, useState } from "react";

interface TcfData {
  tcString: string | null;
  gdprApplies: boolean;
}

interface TcfEvent {
  tcString?: string;
  gdprApplies?: boolean;
  eventStatus?: string;
  cmpStatus?: string;
  listenerId?: number;
}

export function useTcf(): TcfData {
  const [data, setData] = useState<TcfData>({ tcString: null, gdprApplies: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    let listenerId: number | null = null;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return false;
      if (typeof window.__tcfapi !== "function") return false;
      window.__tcfapi("addEventListener", 2, (tcData: TcfEvent, success: boolean) => {
        if (cancelled || !success || !tcData) return;
        if (typeof tcData.listenerId === "number") listenerId = tcData.listenerId;
        setData({
          tcString: tcData.tcString || null,
          gdprApplies: !!tcData.gdprApplies,
        });
      });
      return true;
    };

    if (!attach()) {
      const onReady = () => {
        attach();
      };
      window.addEventListener("blakfy:ready", onReady);
      return () => {
        cancelled = true;
        window.removeEventListener("blakfy:ready", onReady);
        if (listenerId !== null && typeof window.__tcfapi === "function") {
          window.__tcfapi("removeEventListener", 2, () => {}, listenerId);
        }
      };
    }

    return () => {
      cancelled = true;
      if (listenerId !== null && typeof window.__tcfapi === "function") {
        window.__tcfapi("removeEventListener", 2, () => {}, listenerId);
      }
    };
  }, []);

  return data;
}
