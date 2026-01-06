import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdminConfigured } from "@/lib/admin/env";
import { getAdminCookieName, verifyToken } from "@/lib/admin/auth";

export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin non configuré" },
      { status: 503 }
    );
  }

  const cookieName = getAdminCookieName();
  const token = request.cookies.get(cookieName)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const valid = await verifyToken(token);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

