import { GOVT_API_TIMEOUT_MS } from "../constants";

export interface BizCheckResult {
  registered: boolean;
  companyName: string | null;
  status: string | null;
}

export interface FinancialCheckResult {
  registered: boolean;
  licenseType: string | null;
}

/**
 * Verify business registration number via 국세청 API.
 * Returns null on failure (graceful degradation).
 */
export async function checkBusinessNumber(
  bizNo: string
): Promise<BizCheckResult | null> {
  const serviceKey = process.env.SERVICE_KEY;
  if (!serviceKey || !bizNo) return null;

  // Normalize: remove hyphens
  const normalized = bizNo.replace(/-/g, "");
  if (normalized.length !== 10) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GOVT_API_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(serviceKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ b_no: [normalized] }),
          signal: controller.signal,
        }
      );

      if (!response.ok) return null;

      const data = (await response.json()) as {
        status_code?: string;
        data?: Array<{
          b_no: string;
          b_stt: string;
          b_stt_cd: string;
          tax_type: string;
          end_dt: string;
          utcc_yn: string;
          tax_type_change_dt: string;
          invoice_apply_dt: string;
          rbf_tax_type: string;
          rbf_tax_type_change_dt: string;
        }>;
      };

      if (data.status_code !== "OK" || !data.data?.[0]) return null;

      const item = data.data[0];
      const registered =
        item.b_stt_cd === "01" || item.b_stt === "계속사업자";

      return {
        registered,
        companyName: null, // 국세청 API는 상호명 미제공
        status: item.b_stt ?? null,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
}

/**
 * Check financial company registration via 금융위원회 API.
 * Returns null on failure (graceful degradation).
 */
export async function checkFinancialCompany(
  companyName: string
): Promise<FinancialCheckResult | null> {
  const serviceKey = process.env.SERVICE_KEY;
  if (!serviceKey || !companyName) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GOVT_API_TIMEOUT_MS);

    try {
      const url = new URL(
        "https://apis.data.go.kr/1160100/service/GetFinaStatInfoService_V2/getBs_V2"
      );
      url.searchParams.set("serviceKey", serviceKey);
      url.searchParams.set("pageNo", "1");
      url.searchParams.set("numOfRows", "5");
      url.searchParams.set("resultType", "json");
      url.searchParams.set("corp_name", companyName);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      if (!response.ok) return null;

      const data = (await response.json()) as {
        response?: {
          body?: {
            totalCount?: number;
            items?: { item?: Array<{ corp_nm: string; isu_srt_cd: string }> };
          };
        };
      };

      const totalCount = data.response?.body?.totalCount ?? 0;
      const items = data.response?.body?.items?.item ?? [];

      return {
        registered: totalCount > 0,
        licenseType: items[0]?.isu_srt_cd ?? null,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
}
