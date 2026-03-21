import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSupabase } from "@/lib/db/supabase";
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

    const [totalResult, highRiskResult, recentResult] = await Promise.allSettled([
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

    return NextResponse.json({
      totalAnalyses: totalCount,
      highRiskSites,
      recentLogs,
    });
  } catch {
    return NextResponse.json(
      { error: "통계 데이터를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
