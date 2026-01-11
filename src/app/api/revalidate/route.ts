import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import pdfIndex from "@/data/pdfIndex.json";
import { normalizeExerciseCode } from "@/lib/exerciseCode";

export const dynamic = "force-dynamic";

const SESSION_IDS = ["S1", "S2", "S3", "S4", "S5"] as const;

const collectExerciseCodes = () => {
  const entries = pdfIndex as Array<{ code: string }>;
  const codes = entries
    .map((entry) => normalizeExerciseCode(entry.code))
    .filter(Boolean);
  return Array.from(new Set(codes));
};

export const GET = async (request: NextRequest) => {
  const secret = request.nextUrl.searchParams.get("secret") ?? "";
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid secret." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const codes = collectExerciseCodes();
  const paths = [
    "/",
    "/guide",
    "/exercises",
    ...SESSION_IDS.map((session) => `/exercises/${session}`),
    ...codes.map((code) => `/exercises/detail/${code}`),
  ];

  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json(
    { revalidated: true, paths: paths.length, codes: codes.length },
    { headers: { "Cache-Control": "no-store" } }
  );
};
