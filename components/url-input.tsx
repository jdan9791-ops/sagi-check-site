"use client";

import { useState, useCallback } from "react";
import { CaptchaGate } from "./captcha-gate";
import { AnalyzeResponse } from "@/lib/schemas";

interface UrlInputProps {
  onResult: (result: AnalyzeResponse) => void;
  onLoading: (loading: boolean) => void;
}

export function UrlInput({ onResult, onLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const getFingerprintId = useCallback(async (): Promise<string> => {
    try {
      // Use a simple combination of browser properties as fingerprint
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillText("fingerprint", 2, 2);
      }
      const canvasHash = canvas.toDataURL().slice(-20);
      const ua = navigator.userAgent;
      const lang = navigator.language;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const screen = `${window.screen.width}x${window.screen.height}`;
      const raw = `${canvasHash}${ua}${lang}${tz}${screen}`;

      // Simple hash
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
      }
      return Math.abs(hash).toString(36);
    } catch {
      return "unknown";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("URL을 입력해 주세요.");
      return;
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError("올바른 URL 형식이 아닙니다. (예: https://example.com)");
      return;
    }

    if (requiresCaptcha && !captchaToken) {
      setError("보안 문자 인증을 완료해 주세요.");
      return;
    }

    onLoading(true);
    setError(null);

    try {
      const fingerprintId = await getFingerprintId();

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalizedUrl,
          fingerprintId,
          captchaToken: captchaToken ?? undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresCaptcha) {
          setRequiresCaptcha(true);
          setError("보안 문자 인증이 필요합니다. 아래 인증을 완료해 주세요.");
        } else {
          setError(data.error ?? "분석 중 오류가 발생했습니다.");
        }
        return;
      }

      onResult(data as AnalyzeResponse);
    } catch {
      setError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3" noValidate>
      <div className="relative">
        <label htmlFor="url-input" className="sr-only">
          검사할 사이트 주소
        </label>
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none" aria-hidden="true">
          <svg
            className="w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="검사할 사이트 주소를 입력하세요 (예: https://example.com)"
          className="w-full h-14 pl-12 pr-4 border-2 border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors text-base"
          aria-describedby={error ? "url-error" : undefined}
          aria-invalid={error ? "true" : "false"}
          autoComplete="url"
        />
      </div>

      {error && (
        <p id="url-error" className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {requiresCaptcha && (
        <CaptchaGate
          onVerify={(token) => {
            setCaptchaToken(token);
            setError(null);
          }}
          onExpire={() => setCaptchaToken(null)}
        />
      )}

      <button
        type="submit"
        className="w-full h-12 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="사이트 안전성 분석 시작"
      >
        사이트 검사하기
      </button>
    </form>
  );
}
