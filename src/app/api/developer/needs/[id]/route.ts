import { prisma } from "@/lib/db";
import { unauthorizedIfNotDeveloper } from "@/lib/developer-api-auth";
import { serializePublicApp } from "@/lib/serialize-app";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const gate = await unauthorizedIfNotDeveloper(req);
  if (gate) return gate;

  const { id } = await ctx.params;
  const need = await prisma.unmetNeed.findUnique({ where: { id } });
  if (!need) return NextResponse.json({ message: "見つかりません" }, { status: 404 });

  const similarQueries = await prisma.unmetNeedQuery.findMany({
    where: { unmet_need_id: id },
    orderBy: { created_at: "desc" },
  });

  const relatedAppsRaw =
    need.related_app_ids.length > 0
      ? await prisma.app.findMany({
          where: { id: { in: need.related_app_ids.slice(0, 24) } },
        })
      : [];

  return NextResponse.json({
    id: need.id.toString(),
    representative_query: need.representative_query,
    summary: need.summary,
    category_tags: need.category_tags,
    interested_count: need.interested_count,
    first_seen_at: need.first_seen_at.toISOString(),
    last_seen_at: need.last_seen_at.toISOString(),
    similar_queries: similarQueries.map((row) => ({
      id: row.id.toString(),
      query_text: row.query_text,
      created_at: row.created_at.toISOString(),
    })),
    ai_target_user_estimate: need.ai_target_user_estimate,
    ai_suggested_features: need.ai_suggested_features,
    ai_gap_notes: need.ai_gap_notes,
    developer_idea_notes: need.developer_idea_notes,
    related_apps: relatedAppsRaw.map(serializePublicApp),
  });
}

const patchSchema = z.object({
  developer_idea_notes: z.string().max(4000),
});

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const gate = await unauthorizedIfNotDeveloper(req);
  if (gate) return gate;

  const { id } = await ctx.params;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "JSONが無効です" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "入力エラーです" }, { status: 422 });
  }

  try {
    const updated = await prisma.unmetNeed.update({
      where: { id },
      data: {
        developer_idea_notes: parsed.data.developer_idea_notes,
      },
    });
    return NextResponse.json({ ok: true, id: updated.id.toString() });
  } catch {
    return NextResponse.json({ message: "更新できませんでした" }, { status: 404 });
  }
}
