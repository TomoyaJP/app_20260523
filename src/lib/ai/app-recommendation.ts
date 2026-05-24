import { routingModel } from "@/lib/config";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export type RecommendationPick = z.infer<typeof recommendationSchema>;

const recommendationSchema = z.object({
  picks: z
    .array(
      z.object({
        appId: z.string().uuid(),
        reason: z.string().min(1).max(800),
        mismatchNote: z.string().max(700),
      }),
    )
    .max(4),
  /** True when candidates weakly overlap the user's described problem. */
  insufficientMatch: z.boolean(),
});

export async function refineRecommendationsJa(input: {
  userProblem: string;
  candidatesJson: unknown;
}) {
  const { object } = await generateObject({
    model: openai(routingModel),
    schema: recommendationSchema,
    prompt: `あなたはニッチアプリ検索サイトのコンシェルジュです。
入力にはユーザーが説明した困りごとと、embedding類似検索で得られた候補アプリ一覧（JSON）があります。

ルール：
- picksは最大4件。推薦理由と「合わない可能性」を短い日本語で書きます。
- 推薦は質の高い順に2〜4件に絞ります。
- アプリ概要に書かれていない機能・提供状況を断定しません。
- 存在しない機能を創作しません。
- 候補が薄い場合は picks を空または少なくし insufficientMatch を true にします。

候補JSON：
${escapeJson(input.candidatesJson)}

ユーザーの困りごと：
"""${escapeText(input.userProblem)}"""`,
  });
  const picks =
    !object.picks?.length || object.picks.length <= 4
      ? object.picks
      : object.picks.slice(0, 4);
  return {
    picks,
    insufficientMatch: object.insufficientMatch,
  };
}

function escapeText(s: string) {
  return s.replace(/\r/g, "").replace(/"""/g, "'''").slice(0, 6500);
}

function escapeJson(v: unknown) {
  try {
    return JSON.stringify(v).slice(0, 12000);
  } catch {
    return "[]";
  }
}
