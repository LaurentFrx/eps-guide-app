import { NextResponse } from "next/server";
import { APP_VERSION, BUILD_TIME, COMMIT_REF, COMMIT_SHA } from "@/lib/version";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const payload = {
    version: APP_VERSION,
    commitSha: COMMIT_SHA ?? "unknown",
    commitRef: COMMIT_REF ?? "",
    buildTime: BUILD_TIME ?? null,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
