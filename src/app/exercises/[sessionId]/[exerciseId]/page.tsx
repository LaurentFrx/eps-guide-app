import Image from "next/image";
import Link from "next/link";
import { exercises, sessions } from "@/lib/exercises";
import { notFound } from "next/navigation";

export default function ExercisePage(props: unknown) {
  const { params } = props as { params: { sessionId: string; exerciseId: string } };
  const ex = exercises.find((e) => e.id === params.exerciseId && e.sessionId === params.sessionId);
  if (!ex) return notFound();

  // session is available if needed for breadcrumbs or metadata
  // keep retrieval for future usage
  const session = sessions.find((s) => s.id === ex.sessionId);
  void session;
  const sessionExercises = exercises.filter((e) => e.sessionId === ex.sessionId);
  const idx = sessionExercises.findIndex((e) => e.id === ex.id);
  const prev = sessionExercises[idx - 1];
  const next = sessionExercises[idx + 1];

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl bg-white shadow-md overflow-hidden">
        <div className="relative h-72 w-full">
          <Image src={ex.image} alt={ex.title} fill className="object-cover rounded-t-2xl" unoptimized />
        </div>
        <div className="p-4 space-y-3">
          <h1 className="text-2xl font-semibold">{ex.title}</h1>
          <p className="text-sm text-slate-500">{ex.level} • {ex.sessionId}</p>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-medium">Objectif</h3>
              <p className="text-sm text-slate-700">{ex.objectif}</p>
            </div>
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-medium">Matériel</h3>
              <p className="text-sm text-slate-700">{ex.materiel}</p>
            </div>
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-medium">Anatomie</h3>
              <p className="text-sm text-slate-700">{ex.anatomie.muscles} — {ex.anatomie.fonction}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Technique</h3>
              </div>
              <ul className="list-disc pl-5 text-sm text-slate-700">
                {ex.techniquePoints.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Sécurité</h3>
                <details className="text-xs">
                  <summary className="cursor-pointer">Info</summary>
                  <p className="mt-2 text-sm">Attention: {ex.securitePoints.slice(0,2).join(' • ')}</p>
                </details>
              </div>
              <ul className="list-disc pl-5 text-sm text-slate-700">
                {ex.securitePoints.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-medium">Progression</h3>
              <p className="text-sm">Regression: {ex.progression.regression}</p>
              <p className="text-sm">Progression: {ex.progression.progression}</p>
            </div>
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-medium">Dosage</h3>
              <p className="text-sm text-slate-700">{ex.dosage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/exercises/${ex.sessionId}`} className="rounded-md px-3 py-2 border">Retour session</Link>
            {prev ? <Link href={`/exercises/${prev.sessionId}/${prev.id}`} className="rounded-md px-3 py-2 border">Précédent</Link> : null}
            {next ? <Link href={`/exercises/${next.sessionId}/${next.id}`} className="rounded-md px-3 py-2 border">Suivant</Link> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
