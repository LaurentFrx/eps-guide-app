import { NextResponse } from "next/server";
import { APP_VERSION, APP_COMMIT } from "@/lib/appVersion";
import { BUILD_TIME, COMMIT_REF, COMMIT_SHA } from "@/lib/version";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const payload = {
    version: APP_VERSION,
    commitSha: COMMIT_SHA ?? APP_COMMIT,
    commitRef: COMMIT_REF ?? "",
    buildTime: BUILD_TIME ?? null,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
