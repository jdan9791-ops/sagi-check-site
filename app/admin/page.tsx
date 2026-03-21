"use client";

import { useState } from "react";

interface HighRiskSite {
  url: string;
  risk_score: number;
  last_date: string;
  hit_count: number;
}

interface RecentLog {
  url: string;
  risk_score: number;
  site_type: string;
  last_date: string;
  hit_count: number;
}

interface AdminStats {
  totalAnalyses: number;
  highRiskSites: HighRiskSite[];
  recentLogs: RecentLog[];
}

function getRiskColor(score: number): string {
  if (score >= 70) return "text-red-700 font-bold";
  if (score >= 31) return "text-amber-700 font-semibold";
  return "text-green-700";
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "인증에 실패했습니다.");
        return;
      }

      const data = await response.json();
      setStats(data as AdminStats);
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!stats) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-sm p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">관리자 로그인</h1>
            <p className="text-sm text-slate-500 mt-1">관리자 비밀번호를 입력하세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="sr-only">비밀번호</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full h-12 px-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
                aria-label="관리자 비밀번호"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? "확인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">관리자 대시보드</h1>
          <a href="/" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
            ← 메인으로
          </a>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.totalAnalyses.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mt-1">전체 분석 수</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-red-700">{stats.highRiskSites.length}</div>
            <div className="text-sm text-slate-500 mt-1">고위험 사이트 (70점+)</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-slate-700">{stats.recentLogs.length}</div>
            <div className="text-sm text-slate-500 mt-1">최근 분석 로그</div>
          </div>
        </div>

        {/* High risk sites */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">고위험 사이트 목록</h2>
          {stats.highRiskSites.length === 0 ? (
            <p className="text-slate-500 text-sm">고위험 사이트가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="고위험 사이트 목록">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">URL</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">점수</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">검색수</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">최근 검색</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.highRiskSites.map((site, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 max-w-xs truncate">
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          {site.url}
                        </a>
                      </td>
                      <td className={`py-2 px-3 text-right ${getRiskColor(site.risk_score)}`}>
                        {site.risk_score}점
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">{site.hit_count}</td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {new Date(site.last_date).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent logs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">최근 분석 로그</h2>
          {stats.recentLogs.length === 0 ? (
            <p className="text-slate-500 text-sm">분석 기록이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="최근 분석 로그">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-600 font-medium">URL</th>
                    <th className="text-center py-2 px-3 text-slate-600 font-medium">유형</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">점수</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">검색수</th>
                    <th className="text-right py-2 px-3 text-slate-600 font-medium">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLogs.map((log, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 max-w-xs truncate text-slate-700">{log.url}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                          {log.site_type}
                        </span>
                      </td>
                      <td className={`py-2 px-3 text-right ${getRiskColor(log.risk_score)}`}>
                        {log.risk_score}점
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">{log.hit_count}</td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {new Date(log.last_date).toLocaleDateString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
