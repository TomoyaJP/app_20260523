import { developerCookieName, isDeveloperSessionValid } from "@/lib/developer-token";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function unauthorizedIfNotDeveloper(req: NextRequest) {
  const token = req.cookies.get(developerCookieName())?.value;
  if (!(await isDeveloperSessionValid(token))) {
    return NextResponse.json({ message: "開発者のみアクセスできます" }, { status: 401 });
  }
  return null;
}
