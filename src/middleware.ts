import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
  matcher: ["/exercises/:path*"],
};
