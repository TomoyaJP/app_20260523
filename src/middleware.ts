import { developerCookieName, isDeveloperSessionValid } from "@/lib/developer-token";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Developer-only zone. Everything else (including `/`) must pass through untouched.
  const isDeveloperZone =
    pathname.startsWith("/developer") || pathname.startsWith("/api/developer");
  if (!isDeveloperZone) {
    return NextResponse.next();
  }

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
 * Exclude Next internals / static assets, then bail out in-handler for `/` and non-developer routes.
 * This avoids platforms where narrowly-scoped matchers still misbehave around `/`.
 */
export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
