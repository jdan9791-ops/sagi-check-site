"use client";

import { useEffect, useRef } from "react";

export function AdBanner() {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.dataset.adLoaded === "true") return;
    ref.current.dataset.adLoaded = "true";
    try {
      // @ts-ignore - kakao adfit
      (window.adfit = window.adfit || []).push({});
    } catch {}
  }, []);

  const unitId = process.env.NEXT_PUBLIC_ADFIT_UNIT_ID;
  if (!unitId) return null;

  return (
    <div className="flex flex-col items-center gap-1 my-2">
      <p className="text-xs text-slate-400">광고</p>
      <ins
        ref={ref}
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={unitId}
        data-ad-width="320"
        data-ad-height="480"
      />
    </div>
  );
}
