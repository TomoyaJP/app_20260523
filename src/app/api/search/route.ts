import { executeProblemSearch } from "@/lib/search-pipeline";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  query: z.string().min(1, "クエリを入力してください"),
  secretMode: z.boolean(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "JSONの形式が無効です" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.flatten().formErrors.at(0) ?? "入力を確認してください" },
      { status: 422 },
    );
  }

  try {
    const result = await executeProblemSearch(parsed.data.query, parsed.data.secretMode);
    return NextResponse.json(result);
  } catch {
    // Never include original query text in logs or payloads.
    if (process.env.NODE_ENV !== "test") {
      console.error("search pipeline failure");
    }
    return NextResponse.json(
      {
        recommendedApps: [],
        saved: false,
        secretMode: parsed.data.secretMode,
        message: "検索処理に失敗しました。時間をおいて再度お試しください。",
      },
      { status: 502 },
    );
  }
}
