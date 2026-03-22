import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiParsed } from "../schemas";
import { GeoResult } from "./geo-lookup";
import { WhoisResult } from "./whois-lookup";
import { BizCheckResult, FinancialCheckResult } from "./government-api";

interface GeminiContext {
  url: string;
  siteText: string;
  siteType: "FINANCE" | "SHOPPING" | "NORMAL";
  geoResult: GeoResult | null;
  whoisResult: WhoisResult | null;
  bizResult: BizCheckResult | null;
  finResult: FinancialCheckResult | null;
  businessNumbers: string[];
}

const SYSTEM_PROMPT = `당신은 웹사이트 안전성을 분석하는 전문가입니다.

## 분석 원칙
- 분석 결과는 참고용이며 법적 효력이 없습니다.
- "사기"라는 단어를 직접 사용하지 마세요. 대신 "우려됨", "주의 요망", "위험 징후", "주의 필요" 등의 표현을 사용하세요.
- 정확한 근거 없이 특정 기업을 단정적으로 표현하지 마세요.
- 객관적인 데이터에 근거하여 분석하세요.

## 응답 형식 (반드시 준수)
다음 형식으로만 응답하세요. 다른 내용은 포함하지 마세요:

위험 지수: [0~100 사이 숫자]점
긍정적인 사항: [항목1] | [항목2] | [항목3]
부정적인 사항: [항목1] | [항목2] | [항목3]
요약 사항: 요약하자면, [도메인]은 [이유]로 인해 [결론]입니다.

## 위험 지수 가이드라인
- 0~30점: 안전 (공식 인증, 정상 운영, 투명한 정보)
- 31~69점: 주의 (일부 불명확한 정보, 추가 확인 권장)
- 70~100점: 위험 (다수의 위험 징후, 이용 자제 권장)`;

/** Parse Gemini's structured text response. */
function parseGeminiResponse(text: string, domain: string): GeminiParsed {
  try {
    const riskMatch = text.match(/위험 지수:\s*(\d+)점?/);
    const posMatch = text.match(/긍정적인 사항:\s*(.+)/);
    const negMatch = text.match(/부정적인 사항:\s*(.+)/);
    const sumMatch = text.match(/요약 사항:\s*(.+)/);

    const riskScore = riskMatch ? Math.min(100, Math.max(0, parseInt(riskMatch[1], 10))) : 50;
    const positives = posMatch
      ? posMatch[1].split("|").map((s) => s.trim()).filter(Boolean)
      : ["분석 데이터 부족"];
    const negatives = negMatch
      ? negMatch[1].split("|").map((s) => s.trim()).filter(Boolean)
      : ["분석 데이터 부족"];
    const summary = sumMatch
      ? sumMatch[1].trim()
      : `요약하자면, ${domain}은 분석 결과가 불충분하여 추가 확인이 필요합니다.`;

    return { riskScore, positives, negatives, summary };
  } catch {
    // Fallback
    return {
      riskScore: 50,
      positives: ["분석 중 오류가 발생했습니다."],
      negatives: ["분석 중 오류가 발생했습니다."],
      summary: `요약하자면, ${domain}은 분석 중 오류가 발생하여 결과를 신뢰하기 어렵습니다.`,
    };
  }
}

/** Run Gemini AI analysis and return structured result. */
export async function analyzeWithGemini(
  ctx: GeminiContext
): Promise<GeminiParsed> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const domain = new URL(ctx.url).hostname;

  const userPrompt = `
## 분석 대상
URL: ${ctx.url}
사이트 유형: ${ctx.siteType}

## 수집된 데이터

### 서버 위치
${
  ctx.geoResult
    ? `- 국가: ${ctx.geoResult.country} (${ctx.geoResult.countryCode})
- ISP: ${ctx.geoResult.isp}
- 한국 서버 여부: ${ctx.geoResult.isKorea ? "예" : "아니오"}`
    : "- 서버 위치 정보를 가져올 수 없음"
}

### 도메인 정보
${
  ctx.whoisResult
    ? `- 도메인 생성일: ${ctx.whoisResult.creationDate ?? "알 수 없음"}
- 도메인 나이: ${ctx.whoisResult.ageInDays != null ? `${ctx.whoisResult.ageInDays}일` : "알 수 없음"}
- 등록기관: ${ctx.whoisResult.registrar ?? "알 수 없음"}`
    : "- 도메인 정보를 가져올 수 없음"
}

### 사업자등록 조회
${
  ctx.bizResult
    ? `- 사업자번호: ${ctx.businessNumbers.join(", ") || "발견되지 않음"}
- 등록 여부: ${ctx.bizResult.registered ? "정상 등록" : "등록 안됨 또는 폐업"}
- 상태: ${ctx.bizResult.status ?? "알 수 없음"}`
    : `- 사업자번호: ${ctx.businessNumbers.join(", ") || "발견되지 않음"}
- 조회 결과: 정보 없음`
}

### 금융위원회 등록 조회
${
  ctx.finResult
    ? `- 금융회사 등록 여부: ${ctx.finResult.registered ? "등록됨" : "미등록"}
- 라이선스 유형: ${ctx.finResult.licenseType ?? "해당 없음"}`
    : "- 금융위원회 등록 조회 불가"
}

### 사이트 내용 (${ctx.siteText.length}자)
${ctx.siteText}

위 정보를 종합하여 지정된 형식으로 분석 결과를 작성해주세요.`;

  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userPrompt },
    ]);

    const responseText = result.response.text();
    return parseGeminiResponse(responseText, domain);
  } catch {
    return {
      riskScore: 50,
      positives: ["AI 분석 서비스에 일시적 오류가 발생했습니다."],
      negatives: ["분석 결과를 신뢰하기 어렵습니다."],
      summary: `요약하자면, ${domain}은 AI 분석 중 오류가 발생하여 정확한 위험도를 산정할 수 없습니다.`,
    };
  }
}

/** Classify site type using Gemini (2nd pass after keyword check). */
export async function classifyWithGemini(
  url: string,
  siteText: string
): Promise<"FINANCE" | "SHOPPING" | "NORMAL"> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "NORMAL";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const isContentSparse = siteText.trim().length < 200;
    const contentNote = isContentSparse
      ? `\n참고: 사이트 내용을 크롤링하지 못했습니다 (JavaScript 렌더링 또는 봇 차단 가능성). URL과 도메인명만으로 판단하세요. 암호화폐 거래소, 투자, 코인 관련 도메인이면 FINANCE로 분류하세요.`
      : "";

    const prompt = `다음 웹사이트의 유형을 분류해주세요.${contentNote}

URL: ${url}
사이트 내용 (일부): ${siteText.slice(0, 500) || "(내용 없음)"}

반드시 다음 중 하나만 응답하세요 (다른 내용 없이):
- FINANCE (금융, 투자, 증권, 코인, 암호화폐 거래소, 대출 관련)
- SHOPPING (쇼핑몰, 상품 판매 관련)
- NORMAL (그 외 일반 사이트)`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toUpperCase();

    if (text.includes("FINANCE")) return "FINANCE";
    if (text.includes("SHOPPING")) return "SHOPPING";
    return "NORMAL";
  } catch {
    return "NORMAL";
  }
}
