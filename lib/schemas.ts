import { z } from "zod";

export const AnalyzeRequestSchema = z.object({
  url: z
    .string()
    .url("올바른 URL 형식이 아닙니다.")
    .refine(
      (val) => val.startsWith("http://") || val.startsWith("https://"),
      "http 또는 https URL만 허용됩니다."
    ),
  fingerprintId: z.string().min(1).max(256).optional(),
  captchaToken: z.string().optional(),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const ChecklistItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  status: z.enum(["pass", "fail", "unknown", "info"]),
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const AnalyzeResponseSchema = z.object({
  riskScore: z.number().int().min(0).max(100),
  siteType: z.enum(["FINANCE", "SHOPPING", "NORMAL"]),
  isWhitelisted: z.boolean().default(false),
  positives: z.array(z.string()),
  negatives: z.array(z.string()),
  summary: z.string(),
  checklistItems: z.array(ChecklistItemSchema),
  cached: z.boolean().default(false),
  analyzedAt: z.string().datetime().optional(),
});

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

/** Gemini raw response parsing schema */
export const GeminiParsedSchema = z.object({
  riskScore: z.number().int().min(0).max(100),
  positives: z.array(z.string()),
  negatives: z.array(z.string()),
  summary: z.string(),
});

export type GeminiParsed = z.infer<typeof GeminiParsedSchema>;

export const AdminStatsSchema = z.object({
  totalAnalyses: z.number(),
  highRiskSites: z.array(
    z.object({
      url: z.string(),
      riskScore: z.number(),
      lastDate: z.string(),
      hitCount: z.number(),
    })
  ),
  recentLogs: z.array(
    z.object({
      url: z.string(),
      riskScore: z.number(),
      siteType: z.string(),
      lastDate: z.string(),
      hitCount: z.number(),
    })
  ),
});

export type AdminStats = z.infer<typeof AdminStatsSchema>;
