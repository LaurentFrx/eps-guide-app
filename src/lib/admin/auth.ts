import { SignJWT, jwtVerify } from "jose";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_JWT_SECRET,
  ADMIN_TOKEN_TTL,
} from "@/lib/admin/env";

const encoder = new TextEncoder();

const getJwtSecret = () => {
  if (!ADMIN_JWT_SECRET) {
    throw new Error("ADMIN_JWT_SECRET is not configured.");
  }
  return encoder.encode(ADMIN_JWT_SECRET);
};

export const getAdminCookieName = () => ADMIN_COOKIE_NAME;

export async function verifyPassword(plain: string, hash: string) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(plain, hash);
}

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_TOKEN_TTL)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

