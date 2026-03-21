import { GOVT_API_TIMEOUT_MS } from "../constants";

export interface GeoResult {
  country: string;
  countryCode: string;
  isp: string;
  city: string;
  isKorea: boolean;
}

/**
 * Look up IP geolocation using ip-api.com (free tier).
 * Returns null on failure (graceful degradation).
 */
export async function lookupIp(hostname: string): Promise<GeoResult | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GOVT_API_TIMEOUT_MS);

    try {
      const response = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(hostname)}?fields=country,countryCode,isp,city,status`,
        { signal: controller.signal }
      );
      const data = (await response.json()) as {
        status: string;
        country?: string;
        countryCode?: string;
        isp?: string;
        city?: string;
      };

      if (data.status !== "success") return null;

      return {
        country: data.country ?? "알 수 없음",
        countryCode: data.countryCode ?? "??",
        isp: data.isp ?? "알 수 없음",
        city: data.city ?? "알 수 없음",
        isKorea: data.countryCode === "KR",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
}
