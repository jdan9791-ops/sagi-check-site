import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/db/supabase";

export async function GET() {
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

  const allOk = Object.values(checks).every(
    (v) => v === "ok" || v === "configured"
  );

  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", checks },
    { status: allOk ? 200 : 503 }
  );
}
