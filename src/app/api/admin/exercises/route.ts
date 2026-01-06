import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/guards";
import { parseExercisePayload } from "@/lib/admin/validation";
import { getAllExercisesRaw } from "@/lib/exercises/index";
import {
  getCustomExercise,
  setCustomExercise,
} from "@/lib/admin/store";
import { getMergedExerciseRecords } from "@/lib/exercises/merged";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const records = await getMergedExerciseRecords();
  return NextResponse.json({ exercises: records });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const body = await request.json().catch(() => ({}));
  const record = parseExercisePayload(body);

  const baseExists = getAllExercisesRaw().some(
    (exercise) => exercise.code === record.code
  );
  if (baseExists) {
    return NextResponse.json(
      { error: "Le code existe déjà dans la base" },
      { status: 400 }
    );
  }

  const existingCustom = await getCustomExercise(record.code);
  if (existingCustom) {
    return NextResponse.json(
      { error: "Le code existe déjà dans les personnalisations" },
      { status: 409 }
    );
  }

  await setCustomExercise(record);
  revalidateTag("exercises", "default");
  return NextResponse.json({ exercise: record }, { status: 201 });
}
