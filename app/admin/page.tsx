"use client";

import { useState, useEffect } from "react";

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

interface SiteConfig {
  key: string;
  value: string;
  updated_at: string;
}

interface AdminStats {
  totalAnalyses: number;
  highRiskSites: HighRiskSite[];
  recentLogs: RecentLog[];
  configs: SiteConfig[];
}

type Tab = "dashboard" | "prompt" | "settings";

function getRiskColor(score: number): string {
  if (score >= 70) return "text-red-700 font-bold";
  if (score >= 31) return "text-amber-700 font-semibold";
  return "text-green-700";
}

function findConfig(configs: SiteConfig[], key: string): string {
  return configs.find((c) => c.key === key)?.value ?? "";
}

function findConfigUpdatedAt(configs: SiteConfig[], key: string): string {
  const c = configs.find((c) => c.key === key);
  if (!c) return "";
  return new Date(c.updated_at).toLocaleString("ko-KR");
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) fetchStats(saved);
  }, []);

  // 프롬프트 편집 상태
  const [promptValue, setPromptValue] = useState("");
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptSaveMsg, setPromptSaveMsg] = useState<string | null>(null);

  // 설정 편집 상태
  const [riskHigh, setRiskHigh] = useState("");
  const [riskLow, setRiskLow] = useState("");
  const [cacheTtl, setCacheTtl] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState<string | null>(null);

  async function fetchStats(pw: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${pw}` },
      });

      if (!response.ok) {
        const data = await response.json();
        sessionStorage.removeItem("admin_pw");
        setError(data.error ?? "인증에 실패했습니다.");
        return;
      }

      const data = await response.json() as AdminStats;
      sessionStorage.setItem("admin_pw", pw);
      setStats(data);
      setPromptValue(findConfig(data.configs, "system_prompt"));
      setRiskHigh(findConfig(data.configs, "risk_high") || "70");
      setRiskLow(findConfig(data.configs, "risk_low") || "30");
      setCacheTtl(findConfig(data.configs, "cache_ttl_hours") || "168");
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await fetchStats(password);
  }

  async function saveConfig(key: string, value: string) {
    const pw = sessionStorage.getItem("admin_pw") ?? password;
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pw}`,
      },
      body: JSON.stringify({ action: "save_config", key, value }),
    });
    if (!response.ok) throw new Error("저장 실패");
    return await response.json();
  }

  async function handleSavePrompt() {
    setPromptSaving(true);
    setPromptSaveMsg(null);
    try {
      const result = await saveConfig("system_prompt", promptValue);
      const time = new Date(result.updatedAt).toLocaleString("ko-KR");
      setPromptSaveMsg(`✓ 저장 완료 — ${time} (즉시 반영)`);
    } catch {
      setPromptSaveMsg("✗ 저장 실패. 다시 시도해주세요.");
    } finally {
      setPromptSaving(false);
    }
  }

  async function handleSaveSettings() {
    setSettingsSaving(true);
    setSettingsSaveMsg(null);
    try {
      await Promise.all([
        saveConfig("risk_high", riskHigh),
        saveConfig("risk_low", riskLow),
        saveConfig("cache_ttl_hours", cacheTtl),
      ]);
      const time = new Date().toLocaleString("ko-KR");
      setSettingsSaveMsg(`✓ 저장 완료 — ${time} (즉시 반영)`);
    } catch {
      setSettingsSaveMsg("✗ 저장 실패. 다시 시도해주세요.");
    } finally {
      setSettingsSaving(false);
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "대시보드" },
    { id: "prompt", label: "AI 프롬프트 편집" },
    { id: "settings", label: "위험 등급 설정" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">관리자 대시보드</h1>
          <a href="/" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
            ← 메인으로
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-200 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── 대시보드 탭 ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
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
                        <th className="text-center py-2 px-3 text-slate-600 font-medium">결과</th>
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
                          <td className="py-2 px-3 text-center">
                            <a
                              href={`/?preview=1&url=${encodeURIComponent(log.url)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:underline text-xs font-medium whitespace-nowrap"
                            >
                              결과 보기 →
                            </a>
                          </td>
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
        )}

        {/* ── AI 프롬프트 편집 탭 ── */}
        {activeTab === "prompt" && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">AI 시스템 프롬프트</h2>
              <p className="text-sm text-slate-500 mt-1">
                저장 즉시 다음 분석부터 반영됩니다. 배포 불필요.
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                마지막 수정: {findConfigUpdatedAt(stats.configs, "system_prompt") || "정보 없음"}
              </p>
            </div>

            <textarea
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              className="w-full h-96 p-4 border-2 border-slate-300 rounded-lg font-mono text-sm text-slate-800 focus:outline-none focus:border-blue-500 resize-y transition-colors"
              spellCheck={false}
              aria-label="AI 시스템 프롬프트"
            />

            <div className="flex items-center gap-4">
              <button
                onClick={handleSavePrompt}
                disabled={promptSaving}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {promptSaving ? "저장 중..." : "저장하기"}
              </button>
              {promptSaveMsg && (
                <span
                  className={`text-sm font-medium ${
                    promptSaveMsg.startsWith("✓") ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {promptSaveMsg}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── 위험 등급 설정 탭 ── */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">위험 등급 기준 설정</h2>
              <p className="text-sm text-slate-500 mt-1">
                저장 즉시 다음 분석부터 반영됩니다. 배포 불필요.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  고위험 기준 점수
                  <span className="text-slate-400 font-normal ml-1">(이 점수 이상 → 고위험)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={riskHigh}
                  onChange={(e) => setRiskHigh(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-slate-300 rounded-lg text-slate-800 font-mono text-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-slate-400">현재: {findConfig(stats.configs, "risk_high") || "70"}점</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  주의 기준 점수
                  <span className="text-slate-400 font-normal ml-1">(이 점수 이상 → 주의)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={riskLow}
                  onChange={(e) => setRiskLow(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-slate-300 rounded-lg text-slate-800 font-mono text-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-slate-400">현재: {findConfig(stats.configs, "risk_low") || "30"}점</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  캐시 유지 시간
                  <span className="text-slate-400 font-normal ml-1">(시간)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={cacheTtl}
                  onChange={(e) => setCacheTtl(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-slate-300 rounded-lg text-slate-800 font-mono text-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-slate-400">현재: {findConfig(stats.configs, "cache_ttl_hours") || "168"}시간</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-700">현재 적용 등급 구조</p>
              <p>0 ~ {Number(riskLow) - 1}점 → <span className="text-green-700 font-medium">안전</span></p>
              <p>{riskLow} ~ {Number(riskHigh) - 1}점 → <span className="text-amber-700 font-medium">주의 요망</span></p>
              <p>{riskHigh} ~ 89점 → <span className="text-red-700 font-medium">고위험 관찰</span></p>
              <p>90 ~ 100점 → <span className="text-red-900 font-bold">이용 재검토 권고</span></p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {settingsSaving ? "저장 중..." : "저장하기"}
              </button>
              {settingsSaveMsg && (
                <span
                  className={`text-sm font-medium ${
                    settingsSaveMsg.startsWith("✓") ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {settingsSaveMsg}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
