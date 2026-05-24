import { developerCookieName, isDeveloperSessionValid } from "@/lib/developer-token";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const publicPrefixes = [
    "/developer/login",
    "/api/developer/auth/login",
    "/api/developer/auth/logout",
  ];
  if (publicPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(developerCookieName())?.value;
  if (!(await isDeveloperSessionValid(token))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "開発者のみアクセスできます" }, { status: 401 });
    }
    const login = req.nextUrl.clone();
    login.pathname = "/developer/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

/**
 * 開発者パスだけに適用。「/」「/apps」「/_next」などは middleware を通さず Next に任せる（Vercel での 404 回避）。
 */
export const config = {
  matcher: ["/developer/:path*", "/api/developer/:path*"],
};
