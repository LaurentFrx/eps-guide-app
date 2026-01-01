import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CODE_RE = /^\/exercises\/(S\d+-\d+)$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(CODE_RE);
  if (match) {
    const code = match[1].toUpperCase();
    const url = request.nextUrl.clone();
    url.pathname = `/exercises/detail/${code}`;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/exercises/:path*"],
};
