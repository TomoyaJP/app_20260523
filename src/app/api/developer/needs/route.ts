import { prisma } from "@/lib/db";
import { unauthorizedIfNotDeveloper } from "@/lib/developer-api-auth";
import type { Prisma } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

function parseSort(sort: string | null): "interested_count" | "last_seen" | "newest" {
  if (sort === "interested_count") return "interested_count";
  if (sort === "last_seen") return "last_seen";
  return "newest";
}

export async function GET(req: NextRequest) {
  const gate = await unauthorizedIfNotDeveloper(req);
  if (gate) return gate;

  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const sortMode = parseSort(searchParams.get("sort"));
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(10, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20),
  );

  const clauses: Prisma.UnmetNeedWhereInput[] = [];
  if (keyword.trim()) {
    clauses.push({
      OR: [
        { representative_query: { contains: keyword, mode: "insensitive" } },
        { summary: { contains: keyword, mode: "insensitive" } },
      ],
    });
  }
  if (tag.trim()) {
    clauses.push({ category_tags: { has: tag.trim() } });
  }

  const whereClause: Prisma.UnmetNeedWhereInput | undefined =
    clauses.length > 0 ? { AND: clauses } : undefined;

  const orderByClause: Prisma.UnmetNeedOrderByWithRelationInput =
    sortMode === "interested_count"
      ? { interested_count: "desc" }
      : sortMode === "last_seen"
        ? { last_seen_at: "desc" }
        : { created_at: "desc" };

  const [needs, total] = await Promise.all([
    prisma.unmetNeed.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderByClause,
    }),
    prisma.unmetNeed.count({ where: whereClause }),
  ]);

  const items = [];
  for (const need of needs) {
    type RelatedPreview = {
      id: string;
      name: string;
      platform: string;
      description: string | null;
    };
    let relatedApps: RelatedPreview[] = [];
    if (need.related_app_ids.length > 0) {
      relatedApps = await prisma.app.findMany({
        where: {
          id: { in: need.related_app_ids.slice(0, 6) },
        },
        select: {
          id: true,
          name: true,
          platform: true,
          description: true,
        },
      });
    }

    items.push({
      id: need.id.toString(),
      representative_query: need.representative_query,
      summary: need.summary,
      category_tags: need.category_tags,
      interested_count: need.interested_count,
      first_seen_at: need.first_seen_at.toISOString(),
      last_seen_at: need.last_seen_at.toISOString(),
      related_app_ids: need.related_app_ids,
      related_apps_preview: relatedApps.map((app) => ({
        id: app.id.toString(),
        name: app.name,
        platform: app.platform,
        description_preview: shorten(app.description, 160),
      })),
      detailHref: `/developer/needs/${need.id}`,
    });
  }

  return NextResponse.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

function shorten(text: string | null | undefined, max: number): string | null {
  if (!text) return null;
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
