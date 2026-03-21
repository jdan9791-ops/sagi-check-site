"use client";

import { useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

interface CaptchaGateProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function CaptchaGate({ onVerify, onExpire }: CaptchaGateProps) {
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

  return (
    <div
      className="flex flex-col items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl"
      role="region"
      aria-label="보안 문자 인증"
    >
      <p className="text-sm text-slate-700 text-center">
        보안 확인을 완료해 주세요.
      </p>
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        languageOverride="ko"
      />
    </div>
  );
}
