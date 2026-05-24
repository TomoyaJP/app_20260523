import { routingModel } from "@/lib/config";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const schema = z.object({
  tags: z.array(z.string().min(1).max(32)).max(10),
});

export async function inferTagsJa(params: AppBodyForTags) {
  const { object } = await generateObject({
    model: openai(routingModel),
    schema,
    prompt: `開発者ポータルのタグ自動付与。日本語の短い連想タグのみ（ハッシュ無し）。
重複しない。抽象的すぎる語は避ける。

アプリ情報:
名前: ${params.name}
説明: ${params.description.slice(0, 800)}
プラットフォーム: ${params.platform}
想定ユーザー: ${params.target_user ?? "不明"}
シーン: ${params.use_case ?? "不明"}
解決課題: ${params.solved_problem ?? "不明"}
`,
  });
  const tags = [...new Set(object.tags.map((t) => t.trim()))].filter(Boolean);
  return tags.slice(0, 8);
}

export type AppBodyForTags = {
  name: string;
  description: string;
  platform: string;
  target_user?: string | null;
  use_case?: string | null;
  solved_problem?: string | null;
};
