"use client";

import Link from "next/link";
import { CalendarDays, Play } from "lucide-react";
import { V3Header } from "@/components/v3/V3Header";
import { V3Badge } from "@/components/v3/ui/V3Badge";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3EmptyState } from "@/components/v3/ui/V3EmptyState";
import { V3ProgressBar } from "@/components/v3/ui/V3ProgressBar";
import { useV3Store } from "@/lib/v3/store";
import type { TrainingTheme } from "@/lib/v3/types";

const themeTone: Record<TrainingTheme, "power" | "endurance" | "volume"> = {
  PUISSANCE: "power",
  ENDURANCE_FORCE: "endurance",
  VOLUME: "volume",
};

const formatDate = (value?: string) => {
  if (!value) return "Date à planifier";
  const date = new Date(value);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
};

export default function AccueilPage() {
  const {
    profile,
    nextPlannedSession,
    lastSessions,
    aflProgress,
    adviceOfDay,
  } = useV3Store();

  const recent = lastSessions(3);

  return (
    <div className="space-y-6">
      <V3Header title="Accueil" />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--v3-text-muted)]">
          Mon profil
        </h2>
        <V3Card className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[color:var(--v3-text)]">
              {profile?.pseudo ?? "Profil"}
            </p>
            <div className="flex flex-wrap gap-2">
              {profile?.theme ? (
                <V3Badge tone={themeTone[profile.theme]}>
                  {profile.theme === "ENDURANCE_FORCE" ? "Endurance de force" : profile.theme}
                </V3Badge>
              ) : null}
              {profile?.level ? (
                <V3Badge tone="neutral">
                  {profile.level === "INTERMEDIAIRE"
                    ? "Intermédiaire"
                    : profile.level === "DEBUTANT"
                      ? "Débutant"
                      : "Avancé"}
                </V3Badge>
              ) : null}
            </div>
          </div>
        </V3Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--v3-text-muted)]">
          Prochaine séance
        </h2>
        {nextPlannedSession ? (
          <V3Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                  {nextPlannedSession.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-[color:var(--v3-text-muted)]">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDate(nextPlannedSession.plannedAt)}</span>
                </div>
              </div>
              <V3Button asChild>
                <Link href={`/seances/en-cours/${nextPlannedSession.id}`}>
                  <Play className="h-4 w-4" />
                  Démarrer
                </Link>
              </V3Button>
            </div>
          </V3Card>
        ) : (
          <V3Card className="space-y-3">
            <p className="text-sm text-[color:var(--v3-text-muted)]">
              Aucune séance planifiée pour l’instant.
            </p>
            <V3Button asChild>
              <Link href="/seances?tab=creer">Créer une séance</Link>
            </V3Button>
          </V3Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--v3-text-muted)]">
          Progression AFL
        </h2>
        <V3Card className="space-y-3">
          <V3ProgressBar
            value={aflProgress.afl1.score}
            max={aflProgress.afl1.max}
            tone="endurance"
            label="AFL1 /12"
          />
          <V3ProgressBar
            value={aflProgress.afl2.score}
            max={aflProgress.afl2.max}
            tone="volume"
            label="AFL2 /4"
          />
          <V3ProgressBar
            value={aflProgress.afl3.score}
            max={aflProgress.afl3.max}
            tone="power"
            label="AFL3 /4"
          />
        </V3Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--v3-text-muted)]">
          Dernières séances
        </h2>
        {recent.length ? (
          <div className="space-y-3">
            {recent.map((session) => (
              <V3Card key={session.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                    {session.title}
                  </p>
                  <V3Badge tone="neutral">
                    {session.status === "TERMINEE" ? "Terminée" : "Planifiée"}
                  </V3Badge>
                </div>
                <p className="text-xs text-[color:var(--v3-text-muted)]">
                  {formatDate(session.endedAt)} · RPE {session.rpeGlobal ?? "—"}
                </p>
              </V3Card>
            ))}
          </div>
        ) : (
          <V3EmptyState
            title="Aucune séance terminée"
            description="Commence une séance pour suivre ta progression."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--v3-text-muted)]">
          Conseil du jour
        </h2>
        <V3Card>
          <p className="text-sm text-[color:var(--v3-text)]">{adviceOfDay}</p>
        </V3Card>
      </section>
    </div>
  );
}
