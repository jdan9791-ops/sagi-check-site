import { GOVT_API_TIMEOUT_MS } from "../constants";

export interface WhoisResult {
  creationDate: string | null;
  registrar: string | null;
  ageInDays: number | null;
  expirationDate: string | null;
  registrationYears: number | null;
  privacyProtected: boolean;
  registrantCountry: string | null;
  updatedDate: string | null;
}

const PRIVACY_KEYWORDS = [
  "privacy",
  "proxy",
  "whoisguard",
  "domains by proxy",
  "redacted",
  "withheld",
  "protected",
  "private",
  "data protected",
];

function isPrivacyProtected(name?: string, org?: string): boolean {
  const combined = `${name ?? ""} ${org ?? ""}`.toLowerCase();
  return PRIVACY_KEYWORDS.some((kw) => combined.includes(kw));
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
          updated_date?: string;
          registrar?: { name?: string };
          registrant?: {
            name?: string;
            organization?: string;
            country?: string;
            country_code?: string;
          };
        };
      };

      const creationDate = data.domain?.created_date ?? null;
      const expirationDate = data.domain?.expiration_date ?? null;
      const updatedDate = data.domain?.updated_date ?? null;
      const registrar = data.domain?.registrar?.name ?? null;
      const registrantCountry =
        data.domain?.registrant?.country ??
        data.domain?.registrant?.country_code ??
        null;
      const privacyProtected = isPrivacyProtected(
        data.domain?.registrant?.name,
        data.domain?.registrant?.organization
      );

      let ageInDays: number | null = null;
      if (creationDate) {
        const created = new Date(creationDate);
        const now = new Date();
        ageInDays = Math.floor(
          (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      let registrationYears: number | null = null;
      if (creationDate && expirationDate) {
        const created = new Date(creationDate);
        const expires = new Date(expirationDate);
        registrationYears = Math.round(
          (expires.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365)
        );
      }

      return {
        creationDate,
        expirationDate,
        registrar,
        ageInDays,
        registrationYears,
        privacyProtected,
        registrantCountry,
        updatedDate,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return emptyResult();
  }
}

function emptyResult(): WhoisResult {
  return {
    creationDate: null,
    expirationDate: null,
    registrar: null,
    ageInDays: null,
    registrationYears: null,
    privacyProtected: false,
    registrantCountry: null,
    updatedDate: null,
  };
}
