import Image from "next/image";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import ExercisesGrid from "@/components/ExercisesGrid";
import { MarkdownText } from "@/components/MarkdownText";
import { sessions } from "@/lib/exercises";
import { getSeriesCards } from "@/lib/exercisesCatalog";

function normalizeSessionId(raw: string | undefined | null) {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (/^\d+$/.test(s)) return `S${Number(s)}`;
  if (/^S\d+$/i.test(s)) return `S${Number(s.slice(1))}`;
  return s.toUpperCase();
}

const SUMMARY_CODE_RE = /\bS[1-5]-\d{2}\b/;

const splitSummaryItems = (value: string) => {
  if (!value.trim()) return [];
  const normalized = value
    .replace(/\r/g, "")
    .replace(/\s+-\s+(?=S[1-5]-\d{2}\b)/g, "\n- ");
  return normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-"))
    .map((line) => line.replace(/^-+\s*/, "").trim())
    .filter((line) => SUMMARY_CODE_RE.test(line));
};

export default async function SessionPage(props: unknown) {
  const { params, searchParams } = props as {
    params: { sessionId: string } | Promise<{ sessionId: string }>;
    searchParams?: { from?: string } | Promise<{ from?: string }>;
  };
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const rawFrom = resolvedSearchParams?.from;
  const safeFrom =
    typeof rawFrom === "string" && rawFrom.startsWith("/") ? rawFrom : "";
  const sessionIdNorm = normalizeSessionId(resolvedParams?.sessionId);
  const session = sessions.find((s) => normalizeSessionId(s.id) === sessionIdNorm);
  if (!session) return notFound();

  const sessionExercises = getSeriesCards(sessionIdNorm);
  const summaryItems = splitSummaryItems(session.extraMd ?? "");
  const backHref = safeFrom || "/exercises";
  const detailFrom = safeFrom || `/exercises/${session.id}`;

  return (
    <div className="p-6 space-y-6">
      <BackLink
        href={backHref}
        label="← Retour aux sessions"
        fallbackHref="/exercises"
      />
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

      {session.extraMd ? (
        <div className="ui-card p-4">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Résumé des exercices (audit)
          </p>
          {summaryItems.length ? (
            <ul className="mt-3 max-w-prose text-sm leading-relaxed text-white/75 list-disc pl-5 space-y-2">
              {summaryItems.map((item, index) => (
                <li key={`${session.id}-${index}`} className="whitespace-pre-wrap">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <MarkdownText
              text={session.extraMd}
              className="mt-3 max-w-prose text-sm leading-relaxed text-white/75"
            />
          )}
        </div>
      ) : null}


      <ExercisesGrid exercises={sessionExercises} from={detailFrom} />
    </div>
  );
}
