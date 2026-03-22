interface ActionGuideProps {
  riskScore: number;
}

export function ActionGuide({ riskScore }: ActionGuideProps) {
  const isHighRisk = riskScore >= 70;

  return (
    <div
      className={`rounded-2xl border-2 p-6 ${
        isHighRisk
          ? "bg-red-50 border-red-300"
          : "bg-slate-50 border-slate-200"
      }`}
      role="region"
      aria-label="신고 및 피해 구제 안내"
    >
      <h2 className={`text-xl font-semibold mb-5 ${isHighRisk ? "text-red-800" : "text-slate-800"}`}>
        {isHighRisk ? "⚠️ 피해 발생 시 즉시 신고하세요" : "피해 발생 시 신고 안내"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="tel:1332"
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-400 transition-colors min-h-[56px]"
          aria-label="금융감독원 상담 전화 1332"
        >
          <span className="text-2xl" aria-hidden="true">📞</span>
          <div>
            <div className="font-semibold text-slate-800 text-base">금융감독원 상담</div>
            <div className="text-blue-700 font-bold text-lg">1332</div>
          </div>
        </a>

        <a
          href="tel:182"
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-400 transition-colors min-h-[56px]"
          aria-label="경찰청 사이버범죄 신고 182"
        >
          <span className="text-2xl" aria-hidden="true">🚔</span>
          <div>
            <div className="font-semibold text-slate-800 text-base">경찰청 사이버범죄</div>
            <div className="text-blue-700 font-bold text-lg">182</div>
          </div>
        </a>

        <a
          href="https://ecrm.cyber.go.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-400 transition-colors min-h-[56px]"
          aria-label="경찰 사이버범죄 신고시스템 ECRM 바로가기"
        >
          <span className="text-2xl" aria-hidden="true">💻</span>
          <div>
            <div className="font-semibold text-slate-800 text-base">사이버범죄 신고</div>
            <div className="text-blue-600 text-base">ECRM 시스템</div>
          </div>
        </a>

        <a
          href="https://www.fss.or.kr/fss/main/contents.do?menuNo=200218"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-400 transition-colors min-h-[56px]"
          aria-label="금융감독원 불법금융신고 바로가기"
        >
          <span className="text-2xl" aria-hidden="true">🏛️</span>
          <div>
            <div className="font-semibold text-slate-800 text-base">불법금융 신고</div>
            <div className="text-blue-600 text-base">금융감독원</div>
          </div>
        </a>
      </div>

    </div>
  );
}
