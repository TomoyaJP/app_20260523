import type { App } from "@/generated/prisma/client";

export function serializePublicApp(
  app: Pick<
    App,
    | "id"
    | "name"
    | "description"
    | "url"
    | "platform"
    | "tags"
    | "target_user"
    | "use_case"
    | "solved_problem"
    | "suitable_for"
    | "not_suitable_for"
    | "developer_contact"
    | "updated_at"
  >,
) {
  return {
    id: app.id,
    name: app.name,
    description: app.description,
    url: app.url,
    platform: app.platform,
    tags: app.tags,
    target_user: app.target_user ?? null,
    use_case: app.use_case ?? null,
    solved_problem: app.solved_problem ?? null,
    suitable_for: app.suitable_for ?? null,
    not_suitable_for: app.not_suitable_for ?? null,
    developer_contact: app.developer_contact ?? null,
    updated_at: app.updated_at ? app.updated_at.toISOString() : null,
  };
}
