import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/db/supabase";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const checks: Record<string, string> = {};

  // Check Supabase connection
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("search_logs").select("id").limit(1);
    checks.supabase = error ? `error: ${error.message}` : "ok";
  } catch {
    checks.supabase = "unavailable";
  }

  // Check env vars presence (never expose values)
  checks.gemini = process.env.GEMINI_API_KEY ? "configured" : "missing";
  checks.redis = process.env.UPSTASH_REDIS_REST_URL ? "configured" : "missing";
  checks.hcaptcha = process.env.HCAPTCHA_SECRET_KEY ? "configured" : "missing";

  checks.adminIps = process.env.ADMIN_IPS ? "configured" : "not set";

  const allOk = Object.values(checks).every(
    (v) => v === "ok" || v === "configured"
  );

  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", checks, yourIp: ip },
    { status: allOk ? 200 : 503 }
  );
}
