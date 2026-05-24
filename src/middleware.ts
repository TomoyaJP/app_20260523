import { developerCookieName, isDeveloperSessionValid } from "@/lib/developer-token";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isDeveloperArea =
    pathname.startsWith("/developer") || pathname.startsWith("/api/developer");
  if (!isDeveloperArea) return NextResponse.next();

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

export const config = {
  matcher: ["/developer/:path*", "/api/developer/:path*"],
};
