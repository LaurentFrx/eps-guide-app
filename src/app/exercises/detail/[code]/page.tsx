import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { exercises } from "@/lib/exercises";
import { getExercise } from "@/lib/exercise-data";
import { normalizeExerciseCode, isValidExerciseCode } from "@/lib/exerciseCode";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized)) {
    notFound();
  }

  if (code !== normalized) {
    permanentRedirect(`/exercises/detail/${normalized}`);
  }

  const exercise = getExercise(normalized);
  const listEntry =
    exercises.find((ex) => normalizeExerciseCode(ex.id) === normalized) ?? null;
  const status = listEntry?.status ?? "draft";

  if (!exercise) {
    return <UnavailableExercise code={normalized} sessionId={listEntry?.sessionId} />;
  }

  if (status === "draft") {
    return (
      <DraftExercise
        code={normalized}
        title={exercise.title}
        image={listEntry?.image}
        sessionId={listEntry?.sessionId}
      />
    );
  }

  return <ExerciseDetail exercise={exercise} />;
}

function DraftExercise({
  code,
  title,
  image,
  sessionId,
}: {
  code: string;
  title: string;
  image?: string;
  sessionId?: string;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="relative -mx-5 overflow-hidden rounded-b-[2.5rem]">
        <div className="relative h-64 w-full">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="100vw"
              className="object-cover"
              unoptimized={image.toLowerCase().endsWith(".svg")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-500">
              Image indisponible
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 z-10 space-y-3 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">{code}</p>
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-widest">
            Bientot
          </span>
        </div>
      </div>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-500">Contenu en cours</p>
        <p className="text-sm text-slate-700">
          Cette fiche est en cours de préparation. Revenez bientôt pour la version complète.
        </p>
        <div className="flex flex-wrap gap-2 pt-2 text-sm">
          {sessionId ? (
            <Link href={`/exercises/${sessionId}`} className="rounded-md border px-3 py-2">
              Retour à la session
            </Link>
          ) : null}
          <Link href="/exercises" className="rounded-md border px-3 py-2">
            Voir toutes les sessions
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

function UnavailableExercise({
  code,
  sessionId,
}: {
  code: string;
  sessionId?: string;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3">
      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-500">Exercice indisponible</p>
        <h1 className="font-display text-2xl font-semibold text-slate-900">{code}</h1>
        <p className="text-sm text-slate-700">Cette fiche n’est pas encore intégrée.</p>
        <div className="flex flex-wrap gap-2 pt-2 text-sm">
          {sessionId ? (
            <Link href={`/exercises/${sessionId}`} className="rounded-md border px-3 py-2">
              Retour à la session
            </Link>
          ) : null}
          <Link href="/exercises" className="rounded-md border px-3 py-2">
            Voir toutes les sessions
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
