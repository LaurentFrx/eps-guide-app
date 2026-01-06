import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/guards";
import { parseExerciseOverride, parseExercisePayload } from "@/lib/admin/validation";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { getAllExercisesRaw } from "@/lib/exercises/index";
import {
  deleteCustomExercise,
  getCustomExercise,
  getOverride,
  setCustomExercise,
  setOverride,
} from "@/lib/admin/store";
import { getMergedExerciseRecord } from "@/lib/exercises/merged";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const { code } = await context.params;
  const normalized = normalizeExerciseCode(code);
  const exercise = await getMergedExerciseRecord(normalized);
  if (!exercise) {
    return NextResponse.json({ error: "Exercice introuvable" }, { status: 404 });
  }

  const custom = await getCustomExercise(normalized);
  const override = await getOverride(normalized);

  return NextResponse.json({
    exercise,
    source: custom ? "custom" : "base",
    override: override ?? null,
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const { code } = await context.params;
  const normalized = normalizeExerciseCode(code);
  const body = await request.json().catch(() => ({}));

  const custom = await getCustomExercise(normalized);
  if (custom) {
    const record = parseExercisePayload({ ...body, code: normalized });
    await setCustomExercise(record);
    revalidateTag("exercises", "default");
    return NextResponse.json({ exercise: record });
  }

  const baseExists = getAllExercisesRaw().some(
    (exercise) => exercise.code === normalized
  );
  if (!baseExists) {
    return NextResponse.json(
      { error: "Exercice introuvable" },
      { status: 404 }
    );
  }

  const override = parseExerciseOverride(body);
  if (!Object.keys(override).length) {
    return NextResponse.json(
      { error: "Aucune modification fournie" },
      { status: 400 }
    );
  }

  await setOverride(normalized, override);
  revalidateTag("exercises", "default");
  return NextResponse.json({ override });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const { code } = await context.params;
  const normalized = normalizeExerciseCode(code);

  const custom = await getCustomExercise(normalized);
  if (!custom) {
    return NextResponse.json(
      { error: "Suppression autorisée uniquement pour les exercices personnalisés" },
      { status: 400 }
    );
  }

  await deleteCustomExercise(normalized);
  revalidateTag("exercises", "default");
  return NextResponse.json({ ok: true });
}
