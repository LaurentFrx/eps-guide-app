import { getSeriesCards } from "@/lib/exercisesCatalog";
import { getMergedSessions } from "@/lib/exercises/merged";
import ExercisesGrid from "@/components/ExercisesGrid";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MarkdownText } from "@/components/MarkdownText";

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
  const sessions = await getMergedSessions();
  const session = sessions.find((s) => normalizeSessionId(s.id) === sessionIdNorm);
  if (!session) return notFound();

  const sessionExercises = await getSeriesCards(sessionIdNorm);

  return (
    <div className="p-6 space-y-6">
      <div className="ui-card overflow-hidden">
        <div className="relative h-56 w-full">
          <Image
            src={session.heroImage}
            alt={session.title}
            fill
            className="object-cover"
            unoptimized={session.heroImage.toLowerCase().endsWith(".svg")}
          />
        </div>
        <div className="p-4">
          <h1 className="text-2xl font-semibold">{session.title}</h1>
          <p className="text-sm text-white/70">{session.subtitle}</p>
          <div className="mt-3 flex gap-2 flex-wrap">
            {session.chips.map((r) => (
              <span key={r} className="rounded-full ui-chip px-3 py-1 text-xs">
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {session.introMd ? (
        <div className="ui-card p-4">
          <p className="text-xs uppercase tracking-widest text-white/60">
            À propos de la session
          </p>
          <MarkdownText
            text={session.introMd}
            className="mt-3 max-w-prose text-sm leading-relaxed text-white/75"
          />
        </div>
      ) : null}

      <ExercisesGrid exercises={sessionExercises} />
    </div>
  );
}
