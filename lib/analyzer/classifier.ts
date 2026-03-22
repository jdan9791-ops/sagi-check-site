import { FINANCE_KEYWORDS, SHOPPING_KEYWORDS } from "../constants";
import { classifyWithGemini } from "./gemini";

export type SiteType = "FINANCE" | "SHOPPING" | "NORMAL";

/**
 * Classify site type:
 * 1st pass: keyword counting (fast)
 * 2nd pass: Gemini AI (if 1st pass is inconclusive)
 */
export async function classifySite(
  siteText: string,
  url: string
): Promise<SiteType> {
  const lowerText = siteText.toLowerCase();
  const isContentSparse = lowerText.trim().length < 200;

  // 1st pass: count finance keywords
  // If content is sparse (JS-rendered site), lower threshold to 1 keyword
  const financeCount = FINANCE_KEYWORDS.filter((kw) =>
    lowerText.includes(kw.toLowerCase())
  ).length;

  const financeThreshold = isContentSparse ? 1 : 2;
  if (financeCount >= financeThreshold) return "FINANCE";

  // Count shopping keywords
  const shoppingCount = SHOPPING_KEYWORDS.filter((kw) =>
    lowerText.includes(kw.toLowerCase())
  ).length;

  if (shoppingCount >= 3) return "SHOPPING";

  // 2nd pass: Gemini for ambiguous cases
  return classifyWithGemini(url, siteText);
}
