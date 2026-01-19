"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pause, Play, RotateCcw } from "lucide-react";
import { V3Header } from "@/components/v3/V3Header";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3EmptyState } from "@/components/v3/ui/V3EmptyState";
import { useV3Store } from "@/lib/v3/store";

const formatTimer = (value: number) => {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export default function SeanceEnCoursPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { sessions, exercises, startSession, updateDuringSession, completeSession } =
    useV3Store();
  const session = sessions.find((item) => item.id === params.id);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showFinish, setShowFinish] = useState(false);
  const [finishRpe, setFinishRpe] = useState(7);
  const [finishFatigue, setFinishFatigue] = useState(6);
  const [finishNotes, setFinishNotes] = useState("");

  useEffect(() => {
    if (!session) return;
    startSession(session.id);
  }, [session, startSession]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const exerciseMap = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  if (!session) {
    return (
      <V3EmptyState
        title="Séance introuvable"
        description="Retourne à la liste des séances pour continuer."
      />
    );
  }

  const buildPerformed = (
    exerciseId: string,
    overrides: Partial<{
      setsDone: number;
      loadKg: number;
      rpe: number;
      notes: string;
    }>
  ) => {
    const planned = session.items.find((item) => item.exerciseId === exerciseId);
    const currentPerformed = planned?.performed;
    const setsDone = overrides.setsDone ?? currentPerformed?.setsDone ?? 0;
    return {
      setsDone,
      repsDone: Array.from({ length: setsDone }, () => planned?.planned.reps ?? 0),
      loadKg: overrides.loadKg ?? currentPerformed?.loadKg ?? planned?.planned.loadKg ?? 0,
      rpe: overrides.rpe ?? currentPerformed?.rpe ?? 7,
      notes: overrides.notes ?? currentPerformed?.notes ?? "",
    };
  };

  const handleToggleSet = (exerciseId: string, index: number) => {
    const item = session.items.find((entry) => entry.exerciseId === exerciseId);
    if (!item) return;
    const currentSets = Array.from(
      { length: item.planned.sets },
      (_, i) => i < (item.performed?.setsDone ?? 0)
    );
    const nextSets = currentSets.map((done, i) => (i === index ? !done : done));
    const performed = buildPerformed(exerciseId, { setsDone: nextSets.filter(Boolean).length });
    updateDuringSession(session.id, exerciseId, { performed });
  };

  const handleLoadAdjust = (exerciseId: string, delta: number) => {
    const item = session.items.find((entry) => entry.exerciseId === exerciseId);
    if (!item) return;
    const currentLoad = item.performed?.loadKg ?? item.planned.loadKg ?? 0;
    const nextLoad = Math.max(0, Math.round((currentLoad + delta) * 10) / 10);
    const performed = buildPerformed(exerciseId, { loadKg: nextLoad });
    updateDuringSession(session.id, exerciseId, { performed });
  };

  const handleRpeChange = (exerciseId: string, value: number) => {
    const performed = buildPerformed(exerciseId, { rpe: value });
    updateDuringSession(session.id, exerciseId, { performed });
  };

  const handleNotesChange = (exerciseId: string, value: string) => {
    const performed = buildPerformed(exerciseId, { notes: value });
    updateDuringSession(session.id, exerciseId, { performed });
  };

  return (
    <div className="space-y-6">
      <V3Header title="Séances" subtitle="Séance en cours" />

      <V3Card className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-[color:var(--v3-text-muted)]">Timer</p>
          <p className="text-lg font-semibold text-[color:var(--v3-text)]">
            {formatTimer(seconds)}
          </p>
        </div>
        <div className="flex gap-2">
          <V3Button variant="secondary" onClick={() => setIsRunning((prev) => !prev)}>
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Pause" : "Démarrer"}
          </V3Button>
          <V3Button variant="ghost" onClick={() => setSeconds(0)}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </V3Button>
        </div>
      </V3Card>

      <div className="space-y-4">
        {session.items.map((item) => {
          const exercise = exerciseMap.get(item.exerciseId);
          const setsDoneCount = item.performed?.setsDone ?? 0;
          const setFlags = Array.from({ length: item.planned.sets }, (_, i) => i < setsDoneCount);
          return (
            <V3Card key={item.exerciseId} className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                  {exercise?.name ?? item.exerciseId}
                </p>
                <p className="text-xs text-[color:var(--v3-text-muted)]">
                  {item.planned.sets}x{item.planned.reps} · {item.planned.restSec}s
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: item.planned.sets }).map((_, index) => (
                  <button
                    key={`${item.exerciseId}-set-${index}`}
                    type="button"
                    onClick={() => handleToggleSet(item.exerciseId, index)}
                    className={`min-h-9 rounded-full border px-3 text-xs ${
                      setFlags[index]
                        ? "bg-[color:var(--v3-accent-volume)] text-white"
                        : "border-[color:var(--v3-border)] text-[color:var(--v3-text-muted)]"
                    }`}
                  >
                    Set {index + 1}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-[color:var(--v3-text-muted)]">Charge</p>
                  <div className="flex items-center gap-2">
                    <V3Button
                      variant="secondary"
                      onClick={() => handleLoadAdjust(item.exerciseId, -2.5)}
                    >
                      -
                    </V3Button>
                    <span className="text-xs text-[color:var(--v3-text)]">
                      {item.performed?.loadKg ?? item.planned.loadKg ?? 0} kg
                    </span>
                    <V3Button
                      variant="secondary"
                      onClick={() => handleLoadAdjust(item.exerciseId, 2.5)}
                    >
                      +
                    </V3Button>
                  </div>
                </div>
                <label className="space-y-1">
                  <span className="text-xs text-[color:var(--v3-text-muted)]">RPE</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={item.performed?.rpe ?? 7}
                    onChange={(event) => handleRpeChange(item.exerciseId, Number(event.target.value))}
                    className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-[color:var(--v3-text-muted)]">Notes</span>
                  <input
                    type="text"
                    value={item.performed?.notes ?? ""}
                    onChange={(event) => handleNotesChange(item.exerciseId, event.target.value)}
                    className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
                  />
                </label>
              </div>
            </V3Card>
          );
        })}
      </div>

      {showFinish ? (
        <V3Card className="space-y-3">
          <p className="text-sm font-semibold text-[color:var(--v3-text)]">
            Terminer la séance
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-xs text-[color:var(--v3-text-muted)]">RPE global</span>
              <input
                type="number"
                min={1}
                max={10}
                value={finishRpe}
                onChange={(event) => setFinishRpe(Number(event.target.value))}
                className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-[color:var(--v3-text-muted)]">Fatigue</span>
              <input
                type="number"
                min={1}
                max={10}
                value={finishFatigue}
                onChange={(event) => setFinishFatigue(Number(event.target.value))}
                className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              />
            </label>
          </div>
          <label className="space-y-1">
            <span className="text-xs text-[color:var(--v3-text-muted)]">Notes globales</span>
            <input
              type="text"
              value={finishNotes}
              onChange={(event) => setFinishNotes(event.target.value)}
              className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
            />
          </label>
          <div className="flex gap-2">
            <V3Button variant="ghost" onClick={() => setShowFinish(false)} className="w-full">
              Annuler
            </V3Button>
            <V3Button
              onClick={() => {
                completeSession(session.id, finishRpe, finishFatigue, finishNotes);
                router.push("/accueil");
              }}
              className="w-full"
            >
              Valider la séance
            </V3Button>
          </div>
        </V3Card>
      ) : (
        <V3Button onClick={() => setShowFinish(true)} className="w-full">
          Terminer la séance
        </V3Button>
      )}
    </div>
  );
}
