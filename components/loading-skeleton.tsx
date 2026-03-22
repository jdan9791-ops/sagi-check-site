import { AdBanner } from "./ad-banner";

export function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6" aria-label="분석 중">
      {/* Step indicator */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-blue-700 font-medium">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>AI가 사이트를 분석하고 있습니다...</span>
        </div>
        <p className="text-sm text-slate-500">정부 데이터베이스와 AI 분석을 진행 중입니다.</p>
      </div>

      <AdBanner />

      {/* Risk gauge skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center gap-4">
        <div className="w-40 h-20 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Report card skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
      </div>

      {/* Checklist skeleton */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse flex-shrink-0" />
            <div className="h-4 flex-1 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
