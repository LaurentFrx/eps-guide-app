import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/guards";
import { parseExerciseOverride, parseExercisePayload } from "@/lib/admin/validation";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { getAllExercisesRaw } from "@/lib/exercises/index";
import {
  deleteCustomExercise,
  deleteOverride,
  getCustomExercise,
  getOverride,
  setCustomExercise,
  setOverride,
} from "@/lib/admin/store";
import { getMergedExerciseRecord } from "@/lib/exercises/merged";
import { hasCrossReference, isBlank } from "@/lib/admin/editorialRules";

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

const overrideSchema = z.object({
  consignesMd: z.string().optional().default(""),
  dosageMd: z.string().optional().default(""),
  securiteMd: z.string().optional().default(""),
});

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const { code } = await context.params;
  const normalized = normalizeExerciseCode(code);
  const body = await request.json().catch(() => ({}));

  const custom = await getCustomExercise(normalized);
  if (custom) {
    return NextResponse.json(
      { error: "Les overrides ne s'appliquent pas aux fiches personnalisées." },
      { status: 400 }
    );
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

  const parsed = overrideSchema.parse(body);
  const fields = {
    consignesMd: parsed.consignesMd,
    dosageMd: parsed.dosageMd,
    securiteMd: parsed.securiteMd,
  };

  const emptyFields = Object.entries(fields)
    .filter(([, value]) => isBlank(value))
    .map(([key]) => key);
  if (emptyFields.length) {
    return NextResponse.json(
      { error: "Les champs ne peuvent pas être vides." },
      { status: 400 }
    );
  }

  const crossRefFields = Object.entries(fields)
    .filter(([, value]) => hasCrossReference(value))
    .map(([key]) => key);
  if (crossRefFields.length) {
    return NextResponse.json(
      { error: "Les renvois “idem exercice” sont interdits." },
      { status: 400 }
    );
  }

  const override = {
    ...fields,
    updatedAt: new Date().toISOString(),
  };

  await setOverride(normalized, override);
  revalidateTag("exercises", "default");
  return NextResponse.json({ override });
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

  const hasAnyContent = Object.values(override).some((value) => {
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.some((item) => item.trim().length > 0);
    return false;
  });

  if (!hasAnyContent) {
    return NextResponse.json(
      { error: "Ajoutez au moins un contenu avant d’enregistrer." },
      { status: 400 }
    );
  }

  const crossRefFields = [
    override.consignesMd,
    override.dosageMd,
    override.securiteMd,
  ]
    .filter((value): value is string => typeof value === "string")
    .filter((value) => hasCrossReference(value));

  if (crossRefFields.length) {
    return NextResponse.json(
      { error: "Les renvois “idem exercice” sont interdits." },
      { status: 400 }
    );
  }

  await setOverride(normalized, {
    ...override,
    updatedAt: new Date().toISOString(),
  });
  revalidateTag("exercises", "default");
  return NextResponse.json({ override });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const { code } = await context.params;
  const normalized = normalizeExerciseCode(code);

  const custom = await getCustomExercise(normalized);
  if (custom) {
    await deleteCustomExercise(normalized);
    revalidateTag("exercises", "default");
    return NextResponse.json({ ok: true });
  }

  const override = await getOverride(normalized);
  if (override) {
    await deleteOverride(normalized);
    revalidateTag("exercises", "default");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Aucun override à réinitialiser." },
    { status: 400 }
  );
}
