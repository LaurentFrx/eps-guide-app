import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_PASSWORD_HASH,
  isAdminConfigured,
} from "@/lib/admin/env";
import { getAdminCookieName, signToken, verifyPassword } from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin non configuré" },
      { status: 503 }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    password = typeof body.password === "string" ? body.password : "";
  } else {
    const form = await request.formData();
    const value = form.get("password");
    password = typeof value === "string" ? value : "";
  }

  if (!password) {
    return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
  }

  const ok = await verifyPassword(password, ADMIN_PASSWORD_HASH);
  if (!ok) {
    return NextResponse.json({ error: "Mot de passe invalide" }, { status: 401 });
  }

  const token = await signToken({ role: "admin" });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}

