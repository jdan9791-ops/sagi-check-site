-- Supabase에 이 SQL을 복사해서 실행하세요
-- (SQL Editor 탭에 붙여넣고 Run 버튼 클릭)

CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  risk_score INTEGER,
  site_type TEXT CHECK (site_type IN ('FINANCE', 'SHOPPING', 'NORMAL')),
  result_json JSONB,
  first_date TIMESTAMPTZ DEFAULT now(),
  last_date TIMESTAMPTZ DEFAULT now(),
  hit_count INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_search_logs_url ON search_logs(url);
CREATE INDEX IF NOT EXISTS idx_search_logs_risk_score ON search_logs(risk_score);
CREATE INDEX IF NOT EXISTS idx_search_logs_last_date ON search_logs(last_date DESC);
