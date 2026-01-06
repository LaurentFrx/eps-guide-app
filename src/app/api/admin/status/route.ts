import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kv } from "@vercel/kv";
import { requireAdmin } from "@/lib/admin/guards";
import { isAdminConfigured } from "@/lib/admin/env";
import { getOverrideSummariesForCodes } from "@/lib/admin/store";
import { PDF_INDEX } from "@/data/pdfIndex";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  let kvOk = false;
  try {
    await kv.ping();
    kvOk = true;
  } catch {
    kvOk = false;
  }

  const codes = PDF_INDEX.map((item) => item.code);
  const overrides = await getOverrideSummariesForCodes(codes);
  const overridesCount = overrides.length;
  const lastModified = overrides
    .map((item) => item.updatedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;

  return NextResponse.json({
    ok: true,
    kvOk,
    adminConfigured: isAdminConfigured(),
    overridesCount,
    lastModified,
  });
}
