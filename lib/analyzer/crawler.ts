import { CRAWLER_TIMEOUT_MS, MAX_HTML_LENGTH, BLOCKED_IP_PATTERNS } from "../constants";

export interface CrawlResult {
  text: string;
  html: string;
  resolvedHostname: string;
  businessNumbers: string[];
}

/** Check if a hostname/IP is a blocked internal address (SSRF defense). */
export function isBlockedHost(hostname: string): boolean {
  return BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(hostname));
}

/** Strip HTML tags and return plain text. */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract Korean business registration numbers (xxx-xx-xxxxx). */
function extractBusinessNumbers(text: string): string[] {
  const matches = text.match(/\d{3}-\d{2}-\d{5}/g) ?? [];
  return [...new Set(matches)];
}

/**
 * Crawl a website and return its text content (max 3000 chars).
 * Blocks internal IPs for SSRF defense.
 */
export async function crawlWebsite(url: string): Promise<CrawlResult> {
  const parsed = new URL(url);
  const hostname = parsed.hostname;

  if (isBlockedHost(hostname)) {
    throw new Error("접근이 차단된 주소입니다.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CRAWLER_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SafeCheckBot/1.0; +https://sagicheck.kr)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });

    const rawHtml = await response.text();
    const text = stripHtml(rawHtml).slice(0, MAX_HTML_LENGTH);
    const businessNumbers = extractBusinessNumbers(text);

    return {
      text,
      html: rawHtml.slice(0, MAX_HTML_LENGTH),
      resolvedHostname: hostname,
      businessNumbers,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
