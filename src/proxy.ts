import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";
import { isAdminConfigured } from "@/lib/admin/config";
import { getAdminCookieName, verifyToken } from "@/lib/admin/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (isAdminPath) {
    if (pathname === "/admin/login" || pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    if (!isAdminConfigured()) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { error: "Admin non configuré" },
          { status: 503 }
        );
      }
      return NextResponse.next();
    }

    const cookieName = getAdminCookieName();
    const token = request.cookies.get(cookieName)?.value;
    const valid = token ? await verifyToken(token) : false;

    if (!valid) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/exercises/")) {
    const rest = pathname.slice("/exercises/".length);
    if (!rest.includes("/")) {
      const normalized = normalizeExerciseCode(rest);
      if (!isValidExerciseCode(normalized)) {
        return NextResponse.next();
      }
      const url = request.nextUrl.clone();
      url.pathname = `/exercises/detail/${normalized}`;
      return NextResponse.redirect(url, 308);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/exercises/:path*", "/admin/:path*", "/api/admin/:path*"],
};
