"use client";

import { useState } from "react";
import { UrlInput } from "@/components/url-input";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { RiskGauge } from "@/components/risk-gauge";
import { ReportCard } from "@/components/report-card";
import { ChecklistCard } from "@/components/checklist-card";
import { ActionGuide } from "@/components/action-guide";
import { Disclaimer } from "@/components/disclaimer";
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
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-xl font-bold">사이트 안전 검사</span>
            <p className="text-blue-200 text-xs mt-0.5">
              AI + 정부 데이터 기반 무료 위험도 분석
            </p>
          </div>
          <nav>
            <a
              href="/admin"
              className="text-blue-200 hover:text-white text-sm transition-colors"
              aria-label="관리자 페이지"
            >
              관리자
            </a>
          </nav>
        </div>
      </header>

      {!result && !loading && (
        <section className="flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-xl text-center space-y-8">
            <div className="space-y-3">
              <div className="text-5xl" aria-hidden="true">🔍</div>
              <h1 className="text-3xl font-bold text-slate-800">
                웹사이트 안전성을 확인하세요
              </h1>
              <p className="text-slate-600 text-base leading-relaxed">
                금융 투자 및 쇼핑몰 사이트의 위험도를 AI와 정부 공공데이터로 분석합니다.
                <br />
                <span className="text-blue-700 font-medium">무료</span>로 이용하실 수 있습니다.
              </p>
            </div>

            <UrlInput onResult={setResult} onLoading={setLoading} />

            <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl" aria-hidden="true">🏛️</span>
                <span>국세청·금융위<br />정부 DB 검증</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl" aria-hidden="true">🤖</span>
                <span>Gemini AI<br />종합 분석</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl" aria-hidden="true">🆓</span>
                <span>로그인 없이<br />무료 이용</span>
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
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors min-h-[44px]"
            aria-label="새 URL 검색하기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            새 사이트 검사하기
          </button>

          {result.siteType === "NORMAL" ? (
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3" aria-hidden="true">ℹ️</div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                진단 대상이 아닙니다
              </h2>
              <p className="text-slate-600 text-sm">
                {result.summary}
              </p>
            </div>
          ) : (
            <>
              {result.cached && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
                  캐시된 분석 결과입니다. 최신 결과는 24시간 후에 업데이트됩니다.
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
            </>
          )}

          <Disclaimer />
        </section>
      )}
    </main>
  );
}
