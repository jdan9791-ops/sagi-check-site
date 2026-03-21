import { GOVT_API_TIMEOUT_MS } from "../constants";

export interface WhoisResult {
  creationDate: string | null;
  registrar: string | null;
  ageInDays: number | null;
  expirationDate: string | null;
}

/**
 * Look up domain WHOIS info via whoisjsonapi.com (free tier).
 * Returns null values on failure (graceful degradation).
 */
export async function lookupDomain(domain: string): Promise<WhoisResult> {
  const cleanDomain = domain.replace(/^www\./i, "");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GOVT_API_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://whoisjsonapi.com/v1/${encodeURIComponent(cleanDomain)}`,
        { signal: controller.signal }
      );

      if (!response.ok) return emptyResult();

      const data = (await response.json()) as {
        domain?: {
          created_date?: string;
          expiration_date?: string;
          registrar?: { name?: string };
        };
      };

      const creationDate = data.domain?.created_date ?? null;
      const expirationDate = data.domain?.expiration_date ?? null;
      const registrar = data.domain?.registrar?.name ?? null;

      let ageInDays: number | null = null;
      if (creationDate) {
        const created = new Date(creationDate);
        const now = new Date();
        ageInDays = Math.floor(
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return { creationDate, expirationDate, registrar, ageInDays };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return emptyResult();
  }
}

function emptyResult(): WhoisResult {
  return { creationDate: null, expirationDate: null, registrar: null, ageInDays: null };
}
