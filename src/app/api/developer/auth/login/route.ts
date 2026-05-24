import {
  createDeveloperSessionToken,
  developerCookieName,
} from "@/lib/developer-token";
import { verifyDeveloperPassword } from "@/lib/developer-password";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "JSONが無効です" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "入力を確認してください" }, { status: 422 });
  }

  if (!verifyDeveloperPassword(parsed.data.password)) {
    return NextResponse.json({ message: "パスワードが違います" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createDeveloperSessionToken();
  } catch {
    return NextResponse.json(
      { message: "認証構成が不完全です（DEVELOPER_JWT_SECRET）" },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(developerCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
