import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/** Lazy-initialize Supabase client to avoid build-time env var errors. */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

export interface SearchLog {
  id?: string;
  url: string;
  risk_score: number;
  site_type: string;
  result_json: Record<string, unknown>;
  first_date?: string;
  last_date?: string;
  hit_count?: number;
}
