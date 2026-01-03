"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/GlassCard";
import { GlossaryText } from "@/components/GlossaryText";
import type { GuideData } from "@/lib/editorial/schema";

type GuideViewProps = {
  guide: GuideData;
  counts: Record<string, number>;
};

const SESSION_IDS = ["S1", "S2", "S3", "S4", "S5"] as const;

const isFallbackSessions = (guide: GuideData) =>
  guide.sessions.every((session, index) => {
    const expectedTitle = `Session ${index + 1}`;
    return (
      session.id === SESSION_IDS[index] &&
      session.title === expectedTitle &&
      !session.theme &&
      !session.body
    );
  });

export default function GuideView({ guide, counts }: GuideViewProps) {
  const hasSections =
    Boolean(guide.presentation) ||
    Boolean(guide.conclusion) ||
    guide.sources.length > 0;
  const showEmpty = !hasSections && isFallbackSessions(guide);

  if (showEmpty) {
    return (
      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-500">Guide</p>
        <p className="text-base text-slate-700">
          Aucune donnée éditoriale importée — lancez <code>npm run import:editorial</code>.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-500">Guide</p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Guide EPS
        </h1>
      </div>

      {guide.presentation ? (
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Présentation
          </p>
          <GlossaryText text={guide.presentation} />
        </GlassCard>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
        <div className="grid gap-4">
          {guide.sessions.map((session) => (
            <GlassCard key={session.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-slate-100 text-slate-700">
                  {session.id}
                </Badge>
                <Badge className="border-0 bg-white/70 text-slate-700">
                  {counts[session.id] ?? 0} exercices
                </Badge>
                {session.title ? (
                  <p className="text-base font-semibold text-slate-900">
                    {session.title}
                  </p>
                ) : null}
              </div>
              {session.theme ? (
                <p className="text-sm text-slate-600">{session.theme}</p>
              ) : null}
              {session.body ? <GlossaryText text={session.body} /> : null}
            </GlassCard>
          ))}
        </div>
      </div>

      {guide.conclusion ? (
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Conclusion
          </p>
          <GlossaryText text={guide.conclusion} />
        </GlassCard>
      ) : null}

      {guide.sources.length ? (
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Sources
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            {guide.sources.map((source) => (
              <li key={source} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-slate-400" />
                <GlossaryText text={source} className="space-y-1" />
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
