import { routingModel } from "@/lib/config";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const schema = z.object({
  summary: z.string().min(1).max(700),
  category_tags: z.array(z.string().min(1).max(32)).max(8),
  target_user_estimate: z.string().max(700),
  suggested_features: z.string().max(800),
  gap_notes: z.string().max(800),
  representative_sentence: z.string().min(1).max(200),
});

export async function summarizeUnmetNeedJa(input: {
  userQueries: string[];
  relatedApps: {
    id: string;
    name: string;
    solved_problem: string | null;
    suitable_for: string | null;
  }[];
}) {
  const { object } = await generateObject({
    model: openai(routingModel),
    schema,
    prompt:
      `未解決ニーズの調査資料を日本語JSONで出力します。
- summary: 共通する課題を要約。
- representative_sentence: 代表クエリとなる短い一文。
- category_tags: 開発者向けフォルダ分けのタグ配列。
- target_user_estimate: 推定ターゲット（断定しすぎない）。
- suggested_features: 必要そうな機能リスト（創作しない、推測は「〜があると嬉しそう」）。
- gap_notes: 既存関連アプリで足りなさそうな点を短く記載。
関連アプリ一覧（参考情報のみ、断定しない）:
${escapeJson(input.relatedApps)}
類似クエリ一覧:
${input.userQueries.join("\n---\n").slice(0, 5500)}
`,
  });
  const tags = [...new Set(object.category_tags)].filter(Boolean).slice(0, 10);
  return { ...object, category_tags: tags };
}

function escapeJson(v: unknown) {
  try {
    return JSON.stringify(v).slice(0, 4000);
  } catch {
    return "[]";
  }
}
