import { getSupabase } from "./supabase";

export interface SiteConfig {
  key: string;
  value: string;
  updated_at: string;
}

/** 30초 메모리 캐시 (DB 과부하 방지, 실질적 즉시 반영) */
const memCache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL_MS = 30_000;

/** DB에서 설정값 하나를 읽는다. 없으면 fallback 반환. */
export async function getConfig(key: string, fallback: string): Promise<string> {
  const now = Date.now();
  const cached = memCache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", key)
      .single();

    const value = data?.value ?? fallback;
    memCache.set(key, { value, expiresAt: now + CACHE_TTL_MS });
    return value;
  } catch {
    return fallback;
  }
}

/** DB에 설정값을 저장하고 메모리 캐시를 무효화한다. */
export async function setConfig(key: string, value: string): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("site_config")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  memCache.delete(key);
}

/** 어드민 페이지용: 모든 설정을 한 번에 읽는다. */
export async function getAllConfigs(): Promise<SiteConfig[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("site_config")
      .select("key, value, updated_at")
      .order("key");
    return data ?? [];
  } catch {
    return [];
  }
}
