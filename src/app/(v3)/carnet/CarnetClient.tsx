"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { V3Header } from "@/components/v3/V3Header";
import { V3Badge } from "@/components/v3/ui/V3Badge";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3EmptyState } from "@/components/v3/ui/V3EmptyState";
import { V3MetricTile } from "@/components/v3/ui/V3MetricTile";
import { V3SegmentedControl } from "@/components/v3/ui/V3SegmentedControl";
import { useV3Store } from "@/lib/v3/store";

const tabs = [
  { value: "objectifs", label: "Objectifs" },
  { value: "historique", label: "Historique" },
  { value: "stats", label: "Statistiques" },
];

const formatDate = (value?: string) => {
  if (!value) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(
    new Date(value)
  );
};

const getWeekKey = (date: Date) => {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${date.getFullYear()}-S${week}`;
};

export default function CarnetClient() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "objectifs";
  const [tab, setTab] = useState(initialTab);
  const [notesSessionId, setNotesSessionId] = useState<string | null>(null);
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const {
    objectives,
    updateObjectives,
    sessions,
    profile,
    updateSessionNotes,
    exercises,
  } = useV3Store();
  const [draftObjectives, setDraftObjectives] = useState(objectives);

  useEffect(() => {
    setDraftObjectives(objectives);
  }, [objectives]);

  const doneSessions = useMemo(
    () => sessions.filter((session) => session.status === "TERMINEE"),
    [sessions]
  );

  const weeklyVolumes = useMemo(() => {
    const map = new Map<string, number>();
    doneSessions.forEach((session) => {
      if (!session.endedAt) return;
      const key = getWeekKey(new Date(session.endedAt));
      const volume = session.items.reduce((sum, item) => {
        const load = item.performed?.loadKg ?? item.planned.loadKg ?? 0;
        return sum + item.planned.sets * item.planned.reps * load;
      }, 0);
      map.set(key, (map.get(key) ?? 0) + volume);
    });
    return Array.from(map.entries()).slice(-4);
  }, [doneSessions]);

  const keyExercise = useMemo(() => {
    const counts = new Map<string, number>();
    doneSessions.forEach((session) => {
      session.items.forEach((item) => {
        counts.set(item.exerciseId, (counts.get(item.exerciseId) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [doneSessions]);

  const loadProgress = useMemo(() => {
    if (!keyExercise) return [];
    return doneSessions
      .filter((session) => session.items.some((item) => item.exerciseId === keyExercise))
      .slice(-4)
      .map((session) => {
        const item = session.items.find((entry) => entry.exerciseId === keyExercise);
        const load = item?.performed?.loadKg ?? item?.planned.loadKg ?? 0;
        return { label: formatDate(session.endedAt), value: load };
      });
  }, [doneSessions, keyExercise]);

  const handleNotesSave = (sessionId: string) => {
    updateSessionNotes(sessionId, notesDraft.trim());
    setNotesSessionId(null);
    setNotesDraft("");
  };

  return (
    <div className="space-y-6">
      <V3Header title="Carnet" />
      <V3SegmentedControl value={tab} options={tabs} onChange={setTab} />

      {tab === "objectifs" ? (
        <div className="space-y-4">
          <V3Card className="space-y-3">
            <label className="space-y-1">
              <span className="text-xs text-[color:var(--v3-text-muted)]">Mon objectif</span>
              <input
                value={draftObjectives.main}
                onChange={(event) =>
                  setDraftObjectives({ ...draftObjectives, main: event.target.value })
                }
                className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-[color:var(--v3-text-muted)]">Court terme</span>
              <input
                value={draftObjectives.shortTerm}
                onChange={(event) =>
                  setDraftObjectives({ ...draftObjectives, shortTerm: event.target.value })
                }
                className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-[color:var(--v3-text-muted)]">Moyen terme</span>
              <input
                value={draftObjectives.midTerm}
                onChange={(event) =>
                  setDraftObjectives({ ...draftObjectives, midTerm: event.target.value })
                }
                className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-[color:var(--v3-text-muted)]">Long terme</span>
              <input
                value={draftObjectives.longTerm}
                onChange={(event) =>
                  setDraftObjectives({ ...draftObjectives, longTerm: event.target.value })
                }
                className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              />
            </label>
            <V3Button onClick={() => updateObjectives({ ...draftObjectives })}>
              Mettre à jour
            </V3Button>
          </V3Card>
        </div>
      ) : null}

      {tab === "historique" ? (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <V3EmptyState
              title="Aucune séance enregistrée"
              description="Crée une séance pour commencer ton historique."
            />
          ) : (
            sessions.map((session) => (
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
                  {formatDate(session.endedAt ?? session.plannedAt)} · RPE {session.rpeGlobal ?? "—"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <V3Button
                    variant="secondary"
                    onClick={() =>
                      setDetailSessionId((prev) => (prev === session.id ? null : session.id))
                    }
                  >
                    Voir le détail
                  </V3Button>
                  <V3Button
                    variant="secondary"
                    onClick={() => {
                      setNotesSessionId(session.id);
                      setNotesDraft(session.notes ?? "");
                    }}
                  >
                    Ajouter un commentaire réflexif
                  </V3Button>
                </div>
                {detailSessionId === session.id ? (
                  <div className="space-y-2 text-xs text-[color:var(--v3-text-muted)]">
                    <p>RPE global: {session.rpeGlobal ?? "—"}</p>
                    {session.items.map((item) => {
                      const exercise = exercises.find((ex) => ex.id === item.exerciseId);
                      return (
                        <div key={item.exerciseId} className="flex items-center justify-between">
                          <span>{exercise?.name ?? item.exerciseId}</span>
                          <span>
                            {item.performed?.setsDone ?? item.planned.sets}x
                            {item.performed?.repsDone?.[0] ?? item.planned.reps} ·{" "}
                            {item.performed?.loadKg ?? item.planned.loadKg ?? 0} kg
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {notesSessionId === session.id ? (
                  <div className="space-y-2">
                    <input
                      value={notesDraft}
                      onChange={(event) => setNotesDraft(event.target.value)}
                      className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
                    />
                    <div className="flex gap-2">
                      <V3Button variant="ghost" onClick={() => setNotesSessionId(null)}>
                        Annuler
                      </V3Button>
                      <V3Button onClick={() => handleNotesSave(session.id)}>
                        Enregistrer
                      </V3Button>
                    </div>
                  </div>
                ) : null}
              </V3Card>
            ))
          )}
        </div>
      ) : null}

      {tab === "stats" ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <V3MetricTile label="Séances réalisées" value={doneSessions.length} />
            <V3MetricTile label="XP" value={profile?.xp ?? 0} />
            <V3MetricTile label="Streak" value={profile?.streak.current ?? 0} />
          </div>

          <V3Card className="space-y-3">
            <p className="text-sm font-semibold text-[color:var(--v3-text)]">
              Volume total hebdo
            </p>
            {weeklyVolumes.length ? (
              <div className="flex items-end gap-2">
                {weeklyVolumes.map(([key, value]) => (
                  <div key={key} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md bg-[color:var(--v3-accent-endurance)]"
                      style={{ height: `${Math.max(8, value / 20)}px` }}
                    />
                    <span className="text-[10px] text-[color:var(--v3-text-muted)]">
                      {key}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[color:var(--v3-text-muted)]">
                Pas encore de données.
              </p>
            )}
          </V3Card>

          <V3Card className="space-y-3">
            <p className="text-sm font-semibold text-[color:var(--v3-text)]">
              Évolution charge exercice clé
            </p>
            {loadProgress.length ? (
              <div className="flex items-end gap-2">
                {loadProgress.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md bg-[color:var(--v3-accent-volume)]"
                      style={{ height: `${Math.max(8, item.value * 2)}px` }}
                    />
                    <span className="text-[10px] text-[color:var(--v3-text-muted)]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[color:var(--v3-text-muted)]">
                Ajoute des charges pour suivre la progression.
              </p>
            )}
          </V3Card>
        </div>
      ) : null}
    </div>
  );
}
