import { getSupabase, SearchLog } from "./supabase";
import { CACHE_TTL_HOURS } from "../constants";
import { AnalyzeResponse } from "../schemas";

/**
 * Check for cached analysis result (24h TTL).
 * Increments hit_count on cache hit.
 */
export async function getCachedResult(
  url: string
): Promise<AnalyzeResponse | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("search_logs")
      .select("*")
      .eq("url", url)
      .single();

    if (error || !data) return null;

    const lastDate = new Date(data.last_date);
    const now = new Date();
    const hoursDiff =
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > CACHE_TTL_HOURS) return null;

    // Increment hit count
    await supabase
      .from("search_logs")
      .update({ hit_count: (data.hit_count ?? 1) + 1, last_date: now.toISOString() })
      .eq("url", url);

    return { ...(data.result_json as AnalyzeResponse), cached: true };
  } catch {
    return null;
  }
}

/** Save or update analysis result in DB. */
export async function saveResult(
  url: string,
  riskScore: number,
  siteType: string,
  result: AnalyzeResponse
): Promise<void> {
  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const record: SearchLog = {
      url,
      risk_score: riskScore,
      site_type: siteType,
      result_json: result as unknown as Record<string, unknown>,
      last_date: now,
    };

    const { data: existing } = await supabase
      .from("search_logs")
      .select("id, hit_count, first_date")
      .eq("url", url)
      .single();

    if (existing) {
      await supabase
        .from("search_logs")
        .update({
          risk_score: riskScore,
          site_type: siteType,
          result_json: record.result_json,
          last_date: now,
          hit_count: (existing.hit_count ?? 1) + 1,
        })
        .eq("url", url);
    } else {
      await supabase.from("search_logs").insert({
        ...record,
        first_date: now,
        hit_count: 1,
      });
    }
  } catch {
    // Non-critical: swallow DB errors
  }
}
