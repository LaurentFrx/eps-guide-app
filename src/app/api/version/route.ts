import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const payload = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    buildTime: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
