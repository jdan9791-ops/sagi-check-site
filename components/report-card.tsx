interface ReportCardProps {
  positives: string[];
  negatives: string[];
  summary: string;
}

export function ReportCard({ positives, negatives, summary }: ReportCardProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">종합 요약</h2>
        <p className="text-slate-700 text-lg leading-loose">{summary}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Positives */}
        {positives.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-green-800 flex items-center gap-2 mb-4">
              <span
                className="inline-flex items-center justify-center w-6 h-6 bg-green-200 rounded-full text-green-700 text-sm font-bold"
                aria-hidden="true"
              >
                ✓
              </span>
              신뢰 근거
            </h3>
            <ul className="space-y-2.5" role="list">
              {positives.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-green-900 leading-snug">
                  <span className="text-green-500 mt-1 flex-shrink-0" aria-hidden="true">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Negatives */}
        {negatives.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-red-800 flex items-center gap-2 mb-4">
              <span
                className="inline-flex items-center justify-center w-6 h-6 bg-red-200 rounded-full text-red-700 text-sm font-bold"
                aria-hidden="true"
              >
                !
              </span>
              위험 정황 (근거 체인)
            </h3>
            <ul className="space-y-2.5" role="list">
              {negatives.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-red-900 leading-snug">
                  <span className="text-red-500 mt-1 flex-shrink-0" aria-hidden="true">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
