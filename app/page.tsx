"use client";

import { useState } from "react";
import { UrlInput } from "@/components/url-input";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { RiskGauge } from "@/components/risk-gauge";
import { ReportCard } from "@/components/report-card";
import { ChecklistCard } from "@/components/checklist-card";
import { ActionGuide } from "@/components/action-guide";
import { ResponseGuide } from "@/components/response-guide";
import { Disclaimer } from "@/components/disclaimer";
import { VersionBadge } from "@/components/version-badge";
import { AnalyzeResponse } from "@/lib/schemas";

export default function HomePage() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  function handleNewSearch() {
    setResult(null);
  }

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="bg-blue-700 text-white py-4 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <span className="text-xl font-bold inline-flex items-center flex-wrap gap-1">
            사기 사이트 진단기
            <VersionBadge />
          </span>
          <p className="text-blue-200 text-sm mt-0.5">
            AI + 정부 데이터 기반 무료 위험도 분석
          </p>
        </div>
      </header>

      {!result && !loading && (
        <section className="flex flex-col items-center justify-center px-4 py-12 sm:py-16">
          <div className="w-full max-w-xl text-center space-y-8">
            <div className="space-y-4">
              <div className="text-5xl" aria-hidden="true">🔍</div>
              <h1 className="text-3xl font-bold text-slate-800">
                위험한 사이트인지 확인하세요
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                금융 투자 중이신가요? 사이트의 위험도를 AI와 정부 공공데이터 분석 바탕으로 무료 분석해드립니다.
              </p>
            </div>

            <UrlInput onResult={setResult} onLoading={setLoading} />

            <div className="grid grid-cols-3 gap-4 text-base text-slate-600">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl" aria-hidden="true">🏛️</span>
                <span className="leading-snug">국세청·금융위<br />정부 DB 검증</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl" aria-hidden="true">🤖</span>
                <span className="leading-snug">AI<br />종합분석</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl" aria-hidden="true">🆓</span>
                <span className="leading-snug">로그인 없이<br />무료 이용</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {loading && <LoadingSkeleton />}

      {result && !loading && (
        <section className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Back button */}
          <button
            onClick={handleNewSearch}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium text-base transition-colors min-h-[52px]"
            aria-label="새 URL 검색하기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            새 사이트 검사하기
          </button>

          {result.siteType === "NORMAL" ? (
            <div className="bg-slate-100 border border-slate-300 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3" aria-hidden="true">ℹ️</div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                진단 대상이 아닙니다
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                {result.summary}
              </p>
            </div>
          ) : (
            <>
              {result.cached && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-base text-blue-700">
                  이전에 분석한 결과입니다. 최신 결과는 7일 후에 업데이트됩니다.
                </div>
              )}

              <RiskGauge score={result.riskScore} isWhitelisted={result.isWhitelisted} />

              {!result.isWhitelisted && (
                <>
                  <ReportCard
                    positives={result.positives}
                    negatives={result.negatives}
                    summary={result.summary}
                  />
                  <ChecklistCard items={result.checklistItems} />
                </>
              )}

              <ActionGuide riskScore={result.riskScore} />

              {/* Response guide for high-risk finance sites */}
              {result.riskScore >= 70 && (
                <div>
                  <div className="w-full flex items-center gap-2 bg-red-700 text-white font-semibold text-lg py-4 px-6 rounded-2xl">
                    <span>대응 방법 알려드릴까요?</span>
                  </div>
                  <div className="mt-3">
                    <ResponseGuide riskScore={result.riskScore} />
                  </div>
                </div>
              )}
            </>
          )}

          <Disclaimer />
        </section>
      )}
      <footer className="text-center text-xs text-slate-400 py-6 px-4">
        Contact : <a href="mailto:jdan9791@gmail.com" className="underline hover:text-slate-600">jdan9791@gmail.com</a>
      </footer>
    </main>
  );
}
