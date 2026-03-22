"use client";

import { useEffect, useState } from "react";

interface RiskGaugeProps {
  score: number;
  isWhitelisted?: boolean;
}

function getRiskLevel(score: number): { label: string; color: string; bg: string; border: string } {
  if (score <= 30) return { label: "안전", color: "#16A34A", bg: "bg-green-50", border: "border-green-200" };
  if (score <= 69) return { label: "주의 요망", color: "#D97706", bg: "bg-amber-50", border: "border-amber-200" };
  if (score <= 89) return { label: "고위험 관찰", color: "#DC2626", bg: "bg-red-50", border: "border-red-200" };
  return { label: "이용 재검토 권고", color: "#991B1B", bg: "bg-red-100", border: "border-red-400" };
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
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * score);
      setDisplayScore(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [score]);

  const { label, color, bg, border } = getRiskLevel(score);

  // Semi-circle arc: center at (cx, cy), opens upward
  // Angles follow standard math (0°=right, 180°=left, 270°=top in SVG y-down)
  // sweep=1 (SVG clockwise) from 180° goes through 270° (top) to 360°
  const radius = 72;
  const cx = 100;
  const cy = 98;

  function polarToCartesian(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  const trackLeft = polarToCartesian(180);   // left endpoint
  const trackRight = polarToCartesian(0);    // right endpoint

  // Score arc sweeps clockwise from 180° (left) toward 360° (right) via 270° (top)
  const sweepAngle = (displayScore / 100) * 180;
  const scoreEnd = polarToCartesian(180 + sweepAngle);

  return (
    <div className={`rounded-2xl border-2 ${border} ${bg} shadow-sm p-6 flex flex-col items-center gap-4`}>
      {isWhitelisted && (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-base font-semibold">
          <span aria-hidden="true">✓</span>
          공식 인증 금융기관
        </div>
      )}

      <svg
        width="220"
        height="122"
        viewBox="0 0 200 118"
        role="img"
        aria-label={`위험 지수 ${score}점 - ${label}`}
      >
        {/* Track arc: full semicircle from left to right via top */}
        <path
          d={`M ${trackLeft.x} ${trackLeft.y} A ${radius} ${radius} 0 0 1 ${trackRight.x} ${trackRight.y}`}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Score arc: from left, clockwise to scoreEnd */}
        {displayScore > 0 && (
          <path
            d={`M ${trackLeft.x} ${trackLeft.y} A ${radius} ${radius} 0 0 1 ${scoreEnd.x} ${scoreEnd.y}`}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
          />
        )}
        {/* Score number */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="36"
          fontWeight="800"
          fill={color}
          fontFamily="Pretendard, Inter, sans-serif"
        >
          {displayScore}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fontSize="14"
          fill="#64748B"
          fontFamily="Pretendard, sans-serif"
        >
          / 99점
        </text>
      </svg>

      <div
        className="text-xl font-bold"
        style={{ color }}
        aria-live="polite"
      >
        {label} 수준
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 flex-shrink-0" aria-hidden="true" />
          안전 (0~30)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" aria-hidden="true" />
          주의 요망 (31~69)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 flex-shrink-0" aria-hidden="true" />
          고위험 관찰 (70~89)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-900 flex-shrink-0" aria-hidden="true" />
          이용 재검토 권고 (90~100)
        </span>
      </div>
    </div>
  );
}
