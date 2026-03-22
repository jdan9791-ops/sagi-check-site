import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schemas";
import { runAnalysisPipeline } from "@/lib/analyzer/pipeline";
import { checkRateLimit, getIpMinuteCount, shouldSendAbuseAlert } from "@/lib/rate-limit";
import { verifyHCaptcha } from "@/lib/fingerprint";
import { sendAbuseAlert } from "@/lib/telegram";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    // Parse and validate request
    const body = await req.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const { url, fingerprintId, captchaToken } = parsed.data;

    // Rate limit check
    const rateResult = await checkRateLimit(ip, fingerprintId);

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: rateResult.reason ?? "요청 한도를 초과했습니다." },
        { status: 429 }
      );
    }

    // CAPTCHA required check (21+ requests)
    if (rateResult.requiresCaptcha) {
      if (!captchaToken) {
        return NextResponse.json(
          {
            error: "보안 문자 인증이 필요합니다.",
            requiresCaptcha: true,
          },
          { status: 403 }
        );
      }

      const captchaValid = await verifyHCaptcha(captchaToken);
      if (!captchaValid) {
        return NextResponse.json(
          { error: "보안 문자 인증에 실패했습니다. 다시 시도해 주세요." },
          { status: 403 }
        );
      }
    }

    // Check for abuse (5+ requests per minute from same IP → alert, 5분 쿨다운)
    const minuteCount = await getIpMinuteCount(ip);
    if (minuteCount >= 5) {
      const canAlert = await shouldSendAbuseAlert(ip);
      if (canAlert) {
        await sendAbuseAlert(ip, minuteCount);
      }
    }

    // Run analysis pipeline
    const result = await runAnalysisPipeline(url);

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error && err.message.length < 100
        ? err.message
        : "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
