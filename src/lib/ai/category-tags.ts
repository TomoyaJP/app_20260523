import { routingModel } from "@/lib/config";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const schema = z.object({
  category_tags: z.array(z.string().min(1).max(32)).max(8),
});

export async function generateCategoryTagsJa(userNeedSummary: string) {
  const { object } = await generateObject({
    model: openai(routingModel),
    schema,
    prompt:
      `ユーザーのニッチなニーズ説明から、開発者ダッシュボード向けに短い日本語カテゴリタグを付けます。
ルール：
- アプリ開発の観点で有用な抽象的カテゴリ（例：「イベント運営」「学習管理」「サイドプロジェクト運用」）
- 過去形や敬語より名詞／短語
- 重複しない
入力:\n"""${escapePrompt(userNeedSummary)}"""`,
  });
  const tags = [...new Set(object.category_tags.map((t) => t.trim()))].filter(
    Boolean,
  );
  return tags.slice(0, 8);
}

function escapePrompt(raw: string) {
  return raw.replace(/\r/g, "").replace(/"""/g, "'''").slice(0, 4500);
}
