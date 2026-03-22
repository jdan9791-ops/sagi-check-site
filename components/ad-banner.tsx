"use client";

import { useEffect, useRef } from "react";

export function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unitId = process.env.NEXT_PUBLIC_ADFIT_UNIT_ID;
    if (!unitId || !containerRef.current) return;

    // 컴포넌트 마운트 시 <ins>와 스크립트를 함께 주입해야
    // ba.min.js가 실행 시점에 ins 요소를 발견하고 광고를 채운다
    containerRef.current.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unitId);
    ins.setAttribute("data-ad-width", "320");
    ins.setAttribute("data-ad-height", "480");
    containerRef.current.appendChild(ins);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  if (!process.env.NEXT_PUBLIC_ADFIT_UNIT_ID) return null;

  return (
    <div className="flex flex-col items-center gap-1 my-2">
      <p className="text-xs text-slate-400">광고</p>
      <div ref={containerRef} />
    </div>
  );
}
