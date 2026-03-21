interface ReportCardProps {
  positives: string[];
  negatives: string[];
  summary: string;
}

export function ReportCard({ positives, negatives, summary }: ReportCardProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">종합 요약</h2>
        <p className="text-slate-700 leading-relaxed">{summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Positives */}
        {positives.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center justify-center w-5 h-5 bg-green-200 rounded-full text-green-700 text-xs"
                aria-hidden="true"
              >
                ✓
              </span>
              긍정적인 사항
            </h3>
            <ul className="space-y-2" role="list">
              {positives.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                  <span className="text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Negatives */}
        {negatives.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center justify-center w-5 h-5 bg-red-200 rounded-full text-red-700 text-xs"
                aria-hidden="true"
              >
                !
              </span>
              부정적인 사항
            </h3>
            <ul className="space-y-2" role="list">
              {negatives.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                  <span className="text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true">•</span>
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
