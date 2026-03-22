import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/db/supabase";
import { AnalyzeResponse } from "@/lib/schemas";

/** Read cached result directly from DB — no analysis, no AI cost. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url 파라미터가 필요합니다." }, { status: 400 });
  }

  // Normalize to hostname only (same key used when saving)
  let hostname: string;
  try {
    const parsed = new URL(
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`
    );
    hostname = parsed.hostname;
  } catch {
    return NextResponse.json({ error: "올바른 URL 형식이 아닙니다." }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("search_logs")
      .select("result_json")
      .eq("url", hostname)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "저장된 결과가 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ...(data.result_json as AnalyzeResponse), cached: true });
  } catch {
    return NextResponse.json({ error: "DB 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
