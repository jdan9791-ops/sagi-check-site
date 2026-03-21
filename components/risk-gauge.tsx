"use client";

import { useEffect, useState } from "react";

interface RiskGaugeProps {
  score: number;
  isWhitelisted?: boolean;
}

function getRiskLevel(score: number): { label: string; color: string; bg: string } {
  if (score <= 30) return { label: "안전", color: "#16A34A", bg: "bg-green-50" };
  if (score <= 69) return { label: "주의", color: "#D97706", bg: "bg-amber-50" };
  return { label: "위험", color: "#DC2626", bg: "bg-red-50" };
}

/** Semi-circular SVG risk gauge with count-up animation. */
export function RiskGauge({ score, isWhitelisted }: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * score);
      setDisplayScore(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  const { label, color, bg } = getRiskLevel(score);

  // Semi-circle gauge math
  const radius = 70;
  const cx = 100;
  const cy = 90;
  const startAngle = 180; // degrees
  const endAngle = 0;
  const totalAngle = 180;
  const sweepAngle = (displayScore / 100) * totalAngle;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  const start2 = polarToCartesian(startAngle);
  const end2 = polarToCartesian(startAngle - sweepAngle);
  const largeArc = sweepAngle > 180 ? 1 : 0;

  const trackStart = polarToCartesian(startAngle);
  const trackEnd = polarToCartesian(endAngle);

  return (
    <div className={`rounded-xl shadow-sm p-6 flex flex-col items-center gap-3 ${bg}`}>
      {isWhitelisted && (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <span aria-hidden="true">✓</span>
          공식 인증 금융기관
        </div>
      )}

      <svg
        width="200"
        height="110"
        viewBox="0 0 200 110"
        role="img"
        aria-label={`위험 지수 ${score}점 - ${label}`}
      >
        {/* Track */}
        <path
          d={`M ${trackStart.x} ${trackStart.y} A ${radius} ${radius} 0 0 1 ${trackEnd.x} ${trackEnd.y}`}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Score arc */}
        {displayScore > 0 && (
          <path
            d={`M ${start2.x} ${start2.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end2.x} ${end2.y}`}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
          />
        )}
        {/* Score text */}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fontSize="32"
          fontWeight="700"
          fill={color}
          fontFamily="Inter, sans-serif"
        >
          {displayScore}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontSize="13"
          fill="#64748B"
          fontFamily="Pretendard, sans-serif"
        >
          / 100점
        </text>
      </svg>

      <div
        className="text-lg font-bold"
        style={{ color }}
        aria-live="polite"
      >
        {label} 수준
      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" aria-hidden="true" />
          안전 (0~30)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500" aria-hidden="true" />
          주의 (31~69)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" aria-hidden="true" />
          위험 (70~100)
        </span>
      </div>
    </div>
  );
}
