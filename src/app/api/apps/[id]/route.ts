import { serializePublicApp } from "@/lib/serialize-app";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type RouteCtx = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const app = await prisma.app.findUnique({ where: { id } });
  if (!app) return NextResponse.json({ message: "見つかりません" }, { status: 404 });
  return NextResponse.json({ app: serializePublicApp(app) });
}
