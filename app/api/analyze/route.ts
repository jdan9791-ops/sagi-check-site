import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/schemas";
import { runAnalysisPipeline } from "@/lib/analyzer/pipeline";

export const maxDuration = 60; // Vercel serverless function timeout (seconds)

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request
    const body = await req.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // Run analysis pipeline
    const result = await runAnalysisPipeline(url);

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error && err.message.length < 100
        ? err.message
        : "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
