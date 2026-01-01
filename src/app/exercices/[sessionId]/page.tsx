import { sessions, exercises } from "@/lib/exercises";
import ExercisesGrid from "@/components/ExercisesGrid";
import Image from "next/image";
import { notFound } from "next/navigation";

function normalizeSessionId(raw: string | undefined | null) {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (/^\d+$/.test(s)) return `S${Number(s)}`;
  if (/^S\d+$/i.test(s)) return `S${Number(s.slice(1))}`;
  return s.toUpperCase();
}

export default async function SessionPage(props: unknown) {
  const { params } = props as {
    params: { sessionId: string } | Promise<{ sessionId: string }>;
  };
  const resolvedParams = await Promise.resolve(params);
  const sessionIdNorm = normalizeSessionId(resolvedParams?.sessionId);
  const session = sessions.find((s) => normalizeSessionId(s.id) === sessionIdNorm);
  if (!session) return notFound();

  const sessionExercises = exercises.filter(
    (e) => normalizeSessionId(e.sessionId) === sessionIdNorm
  );

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl overflow-hidden">
        <div className="relative h-56 w-full">
          <Image src={session.heroImage} alt={session.title} fill className="object-cover" unoptimized />
        </div>
        <div className="p-4">
          <h1 className="text-2xl font-semibold">{session.title}</h1>
          <p className="text-sm text-slate-600">{session.subtitle}</p>
          <div className="mt-3 flex gap-2 flex-wrap">
            {session.reperePedagogiques.map((r) => (
              <span key={r} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <ExercisesGrid exercises={sessionExercises} />
    </div>
  );
}
