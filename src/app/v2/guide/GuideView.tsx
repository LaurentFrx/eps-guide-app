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
    Boolean(guide.notes) ||
    guide.sources.length > 0;
  const showEmpty = !hasSections && isFallbackSessions(guide);

  if (showEmpty) {
    return (
      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Guide</p>
        <p className="text-base text-white/75">
          Aucune donnée éditoriale importée — lancez <code>npm run import:editorial</code>.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">Guide</p>
        <h1 className="font-display text-3xl font-semibold text-white">
          Guide EPS
        </h1>
      </div>

      {guide.presentation ? (
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Présentation
          </p>
          <GlossaryText text={guide.presentation} />
        </GlassCard>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Sessions</h2>
        <div className="grid gap-4">
          {guide.sessions.map((session) => (
            <GlassCard key={session.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="ui-chip border-0">
                  {session.id}
                </Badge>
                <Badge className="ui-chip border-0">
                  {counts[session.id] ?? 0} exercices
                </Badge>
                {session.title ? (
                  <p className="text-base font-semibold text-white">
                    {session.title}
                  </p>
                ) : null}
              </div>
              {session.theme ? (
                <p className="text-sm text-white/70">{session.theme}</p>
              ) : null}
              {session.body ? <GlossaryText text={session.body} /> : null}
            </GlassCard>
          ))}
        </div>
      </div>

      {guide.conclusion ? (
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Conclusion
          </p>
          <GlossaryText text={guide.conclusion} />
        </GlassCard>
      ) : null}

      {guide.notes ? (
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Structure des fiches
          </p>
          <GlossaryText text={guide.notes} />
        </GlassCard>
      ) : null}

      {guide.sources.length ? (
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Sources
          </p>
          <ul className="space-y-2 text-sm text-white/75">
            {guide.sources.map((source) => (
              <li key={source} className="flex items-start gap-2">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300/70" />
                <GlossaryText text={source} className="space-y-1" />
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
