import { inferTagsJa } from "@/lib/ai/tag-inference";
import { buildSearchText } from "@/lib/app-search-text";
import { createEmbedding } from "@/lib/embedding";
import { updateAppEmbedding } from "@/lib/embedding-updates";
import { prisma } from "@/lib/db";
import { unauthorizedIfNotDeveloper } from "@/lib/developer-api-auth";
import { serializePublicApp } from "@/lib/serialize-app";
import type { Prisma } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(140),
  url: z
    .string()
    .url()
    .refine((v) => /^https?:\/\//i.test(v), "URLはhttpまたはhttpsのみ指定できます"),
  platform: z.string().min(1).max(80),
  description: z.string().min(10).max(8000),
  target_user: z.string().max(4000).optional().nullable(),
  use_case: z.string().max(4000).optional().nullable(),
  solved_problem: z.string().max(4000).optional().nullable(),
  suitable_for: z.string().max(4000).optional().nullable(),
  not_suitable_for: z.string().max(4000).optional().nullable(),
  tags: z.array(z.string()).max(32).optional(),
  developer_contact: z.string().max(512).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const platform = searchParams.get("platform") ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    48,
    Math.max(6, Number.parseInt(searchParams.get("limit") ?? "12", 10) || 12),
  );

  const clauses: Prisma.AppWhereInput[] = [];
  if (keyword.trim()) {
    clauses.push({
      OR: [
        { name: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ],
    });
  }
  if (tag.trim()) {
    clauses.push({ tags: { has: tag.trim() } });
  }
  if (platform.trim()) {
    clauses.push({
      platform: { equals: platform.trim(), mode: "insensitive" },
    });
  }

  const whereClause: Prisma.AppWhereInput | undefined =
    clauses.length > 0 ? { AND: clauses } : undefined;

  const [items, total] = await Promise.all([
    prisma.app.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ updated_at: "desc" }],
    }),
    prisma.app.count({ where: whereClause }),
  ]);

  return NextResponse.json({
    items: items.map(serializePublicApp),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

export async function POST(req: NextRequest) {
  const gate = await unauthorizedIfNotDeveloper(req);
  if (gate) return gate;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "JSONが無効です" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first =
      Object.values(msg).flat().at(0) ?? "入力項目を確認してください";
    return NextResponse.json({ message: first }, { status: 422 });
  }

  const incoming = parsed.data;
  let tags = incoming.tags ?? [];
  if (!tags.length) {
    tags = await inferTagsJa(incoming);
  }

  const searchText = buildSearchText({
    name: incoming.name,
    description: incoming.description,
    use_case: incoming.use_case ?? null,
    solved_problem: incoming.solved_problem ?? null,
    target_user: incoming.target_user ?? null,
    suitable_for: incoming.suitable_for ?? null,
    not_suitable_for: incoming.not_suitable_for ?? null,
    tags,
  });

  const embedding = await createEmbedding(searchText);

  const app = await prisma.app.create({
    data: {
      name: incoming.name,
      description: incoming.description,
      url: incoming.url,
      platform: incoming.platform,
      target_user: incoming.target_user ?? null,
      use_case: incoming.use_case ?? null,
      solved_problem: incoming.solved_problem ?? null,
      suitable_for: incoming.suitable_for ?? null,
      not_suitable_for: incoming.not_suitable_for ?? null,
      tags,
      developer_contact: incoming.developer_contact ?? null,
      search_text: searchText,
    },
  });

  await updateAppEmbedding(app.id.toString(), embedding);

  return NextResponse.json(
    {
      id: app.id.toString(),
      message: "登録しました。",
    },
    { status: 201 },
  );
}

