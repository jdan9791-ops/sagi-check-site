import { isWhitelisted } from "./whitelist";
import { crawlWebsite, isBlockedHost } from "./crawler";
import { lookupIp } from "./geo-lookup";
import { lookupDomain } from "./whois-lookup";
import { checkBusinessNumber, checkFinancialCompany } from "./government-api";
import { classifySite } from "./classifier";
import { analyzeWithGemini } from "./gemini";
import { getCachedResult, saveResult } from "../db/cache";
import { sendErrorAlert } from "../telegram";
import { AnalyzeResponse, ChecklistItem } from "../schemas";

/** Validate URL: http/https only, no internal IPs. */
function validateUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("올바른 URL 형식이 아닙니다.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("http 또는 https URL만 허용됩니다.");
  }

  if (isBlockedHost(parsed.hostname)) {
    throw new Error("분석할 수 없는 주소입니다.");
  }

  return parsed;
}

/** Build whitelist result (instant safe result). */
function buildWhitelistResult(url: string): AnalyzeResponse {
  return {
    riskScore: 5,
    siteType: "FINANCE",
    isWhitelisted: true,
    positives: ["공식 금융감독원 등록 금융기관", "정부 인증 공식 도메인", "신뢰할 수 있는 기관"],
    negatives: [],
    summary: `요약하자면, ${new URL(url).hostname}은 공식 인증 금융기관으로 확인되어 안전합니다.`,
    checklistItems: [
      {
        label: "공식 기관 인증",
        value: "공식 금융기관 화이트리스트 확인",
        status: "pass",
      },
    ],
    cached: false,
    analyzedAt: new Date().toISOString(),
  };
}

/** Build NORMAL site result. */
function buildNormalResult(url: string): AnalyzeResponse {
  return {
    riskScore: 0,
    siteType: "NORMAL",
    isWhitelisted: false,
    positives: [],
    negatives: [],
    summary: `${new URL(url).hostname}은(는) 금융 또는 쇼핑 사이트가 아니므로 사기 진단 대상이 아닙니다.`,
    checklistItems: [],
    cached: false,
    analyzedAt: new Date().toISOString(),
  };
}

/** Build checklist items from analysis data. */
function buildChecklistItems(data: {
  bizRegistered: boolean | null;
  finRegistered: boolean | null;
  serverCountry: string | null;
  isKoreaServer: boolean | null;
  domainAge: number | null;
  domainCreated: string | null;
  privacyProtected: boolean;
  registrantCountry: string | null;
  registrationYears: number | null;
  siteType: "FINANCE" | "SHOPPING" | "NORMAL";
}): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  if (data.bizRegistered !== null) {
    items.push({
      label: "사업자등록 확인",
      value: data.bizRegistered ? "정상 등록" : "미등록 또는 폐업",
      status: data.bizRegistered ? "pass" : "fail",
    });
  } else {
    items.push({
      label: "사업자등록 확인",
      value: "사업자번호 미확인",
      status: "unknown",
    });
  }

  if (data.finRegistered !== null) {
    items.push({
      label: "금융위원회 등록",
      value: data.finRegistered ? "등록된 금융회사" : "미등록",
      status: data.finRegistered ? "pass" : "fail",
    });
  }

  if (data.serverCountry !== null) {
    items.push({
      label: "서버 위치",
      value: `${data.serverCountry} ${data.isKoreaServer ? "(국내)" : "(해외)"}`,
      status: data.isKoreaServer ? "pass" : "info",
    });
  }

  if (data.domainAge !== null) {
    const ageLabel =
      data.domainAge < 30
        ? "신규 도메인 (30일 미만)"
        : data.domainAge < 180
        ? `${data.domainAge}일 운영`
        : `${Math.floor(data.domainAge / 365)}년 ${Math.floor((data.domainAge % 365) / 30)}개월 운영`;

    items.push({
      label: "도메인 나이",
      value: ageLabel,
      status: data.domainAge < 30 ? "fail" : data.domainAge < 180 ? "info" : "pass",
    });
  }

  if (data.registrantCountry !== null) {
    const isKorea =
      data.registrantCountry.toLowerCase() === "korea" ||
      data.registrantCountry.toLowerCase() === "kr" ||
      data.registrantCountry.includes("한국");
    items.push({
      label: "도메인 등록 국가",
      value: `${data.registrantCountry} ${isKorea ? "(국내)" : "(해외)"}`,
      status: isKorea ? "pass" : "info",
    });
  }

  if (data.privacyProtected && data.siteType === "FINANCE" && (data.domainAge ?? 999) < 180) {
    items.push({
      label: "등록자 정보",
      value: "개인정보 보호 처리됨 (신규 금융 사이트 + 비공개)",
      status: "fail",
    });
  } else if (data.privacyProtected) {
    items.push({
      label: "등록자 정보",
      value: "개인정보 보호 처리됨",
      status: "info",
    });
  }

  return items;
}

/**
 * Run the full analysis pipeline for a given URL.
 */
export async function runAnalysisPipeline(url: string): Promise<AnalyzeResponse> {
  try {
    return await _runPipeline(url);
  } catch (err) {
    void sendErrorAlert(`파이프라인 오류 (${url})`, err);
    throw err;
  }
}

async function _runPipeline(url: string): Promise<AnalyzeResponse> {
  // ① Validate URL
  const parsed = validateUrl(url);
  const domain = parsed.hostname;
  const normalizedUrl = parsed.href;

  // ② Check cache (24h TTL)
  const cached = await getCachedResult(normalizedUrl);
  if (cached) return cached;

  // ③ Whitelist check (instant)
  if (isWhitelisted(domain)) {
    const result = buildWhitelistResult(normalizedUrl);
    await saveResult(normalizedUrl, result.riskScore, result.siteType, result);
    return result;
  }

  // ④ Parallel data collection
  const [crawlSettled, geoSettled, whoisSettled] = await Promise.allSettled([
    crawlWebsite(normalizedUrl),
    lookupIp(domain),
    lookupDomain(domain),
  ]);

  const crawlResult =
    crawlSettled.status === "fulfilled" ? crawlSettled.value : null;
  const geoResult =
    geoSettled.status === "fulfilled" ? geoSettled.value : null;
  const whoisResult =
    whoisSettled.status === "fulfilled" ? whoisSettled.value : null;

  const siteText = crawlResult?.text ?? "";
  const businessNumbers = crawlResult?.businessNumbers ?? [];

  // ⑤ Classify site type
  const siteType = await classifySite(siteText, normalizedUrl);

  if (siteType === "NORMAL") {
    return buildNormalResult(normalizedUrl);
  }

  // ⑥ Government API checks (parallel)
  const firstBizNo = businessNumbers[0] ?? null;
  const [bizSettled, finSettled] = await Promise.allSettled([
    firstBizNo ? checkBusinessNumber(firstBizNo) : Promise.resolve(null),
    checkFinancialCompany(domain.replace(/\.(com|co\.kr|kr|net|org)$/i, "")),
  ]);

  const bizResult = bizSettled.status === "fulfilled" ? bizSettled.value : null;
  const finResult = finSettled.status === "fulfilled" ? finSettled.value : null;

  // ⑦ Gemini AI analysis
  const geminiResult = await analyzeWithGemini({
    url: normalizedUrl,
    siteText,
    siteType,
    geoResult,
    whoisResult,
    bizResult,
    finResult,
    businessNumbers,
  });

  // ⑧ Build checklist items
  const checklistItems = buildChecklistItems({
    bizRegistered: bizResult?.registered ?? null,
    finRegistered: finResult?.registered ?? null,
    serverCountry: geoResult?.country ?? null,
    isKoreaServer: geoResult?.isKorea ?? null,
    domainAge: whoisResult?.ageInDays ?? null,
    domainCreated: whoisResult?.creationDate ?? null,
    privacyProtected: whoisResult?.privacyProtected ?? false,
    registrantCountry: whoisResult?.registrantCountry ?? null,
    registrationYears: whoisResult?.registrationYears ?? null,
    siteType,
  });

  // Override positives to empty for high-risk sites
  const positives =
    geminiResult.riskScore >= 70 ? ["없습니다"] : geminiResult.positives;

  const result: AnalyzeResponse = {
    riskScore: geminiResult.riskScore,
    siteType,
    isWhitelisted: false,
    positives,
    negatives: geminiResult.negatives,
    summary: geminiResult.summary,
    checklistItems,
    cached: false,
    analyzedAt: new Date().toISOString(),
  };

  // ⑨ Save to DB
  await saveResult(normalizedUrl, result.riskScore, result.siteType, result);

  return result;
}
