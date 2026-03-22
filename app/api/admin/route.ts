import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSupabase } from "@/lib/db/supabase";
import { getAllConfigs, setConfig } from "@/lib/db/config";
import { RISK_HIGH } from "@/lib/constants";

/** Constant-time comparison to prevent timing attacks. */
function verifyAdminPassword(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.slice(7);

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(adminPassword);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!verifyAdminPassword(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    const [totalResult, highRiskResult, recentResult, configsResult] = await Promise.allSettled([
      supabase
        .from("search_logs")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("search_logs")
        .select("url, risk_score, last_date, hit_count")
        .gte("risk_score", RISK_HIGH)
        .order("risk_score", { ascending: false })
        .limit(20),

      supabase
        .from("search_logs")
        .select("url, risk_score, site_type, last_date, hit_count")
        .order("last_date", { ascending: false })
        .limit(50),

      getAllConfigs(),
    ]);

    const totalCount =
      totalResult.status === "fulfilled"
        ? (totalResult.value.count ?? 0)
        : 0;

    const highRiskSites =
      highRiskResult.status === "fulfilled"
        ? (highRiskResult.value.data ?? [])
        : [];

    const recentLogs =
      recentResult.status === "fulfilled"
        ? (recentResult.value.data ?? [])
        : [];

    const configs =
      configsResult.status === "fulfilled"
        ? configsResult.value
        : [];

    return NextResponse.json({
      totalAnalyses: totalCount,
      highRiskSites,
      recentLogs,
      configs,
    });
  } catch {
    return NextResponse.json(
      { error: "통계 데이터를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminPassword(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, key, value } = body;

    if (action !== "save_config") {
      return NextResponse.json({ error: "알 수 없는 action입니다." }, { status: 400 });
    }

    if (typeof key !== "string" || typeof value !== "string") {
      return NextResponse.json({ error: "key와 value는 문자열이어야 합니다." }, { status: 400 });
    }

    const allowedKeys = ["system_prompt", "risk_high", "risk_low", "cache_ttl_hours"];
    if (!allowedKeys.includes(key)) {
      return NextResponse.json({ error: "허용되지 않는 설정 키입니다." }, { status: 400 });
    }

    await setConfig(key, value);

    return NextResponse.json({ success: true, key, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { error: "설정 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
