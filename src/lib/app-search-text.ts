/** Build the document that is embedded for similarity retrieval. */

export type AppSearchFields = {
  name: string;
  description: string;
  use_case: string | null;
  solved_problem: string | null;
  target_user: string | null;
  suitable_for: string | null;
  not_suitable_for: string | null;
  tags: string[];
};

export function buildSearchText(fields: AppSearchFields): string {
  const chunks = [
    `アプリ名: ${fields.name}`,
    `概要: ${fields.description}`,
    fields.solved_problem && `解決する課題: ${fields.solved_problem}`,
    fields.target_user && `想定ユーザー: ${fields.target_user}`,
    fields.use_case && `利用シーン: ${fields.use_case}`,
    fields.suitable_for && `向いている人: ${fields.suitable_for}`,
    fields.not_suitable_for && `向いていない人: ${fields.not_suitable_for}`,
    fields.tags?.length &&
      `タグ: ${fields.tags.filter(Boolean).slice(0, 24).join(", ")}`,
  ];
  return chunks.filter(Boolean).join("\n");
}
