"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronRight, Plus, Star } from "lucide-react";
import { V3Header } from "@/components/v3/V3Header";
import { V3Badge } from "@/components/v3/ui/V3Badge";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3EmptyState } from "@/components/v3/ui/V3EmptyState";
import { V3SegmentedControl } from "@/components/v3/ui/V3SegmentedControl";
import { useV3Store } from "@/lib/v3/store";
import type { Exercise, TrainingTheme } from "@/lib/v3/types";

type CreateStep = 1 | 2 | 3;

const tabOptions = [
  { value: "programme", label: "Programme" },
  { value: "creer", label: "Créer" },
  { value: "bibliotheque", label: "Bibliothèque" },
];

const equipmentFilters = ["TOUS", "AUCUN", "HALTERES", "BARRE", "MACHINES"] as const;

const themeTone: Record<TrainingTheme, "power" | "endurance" | "volume"> = {
  PUISSANCE: "power",
  ENDURANCE_FORCE: "endurance",
  VOLUME: "volume",
};

const formatDate = (value?: string) => {
  if (!value) return "À planifier";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
};

const buildPlannedParams = (exercise: Exercise, theme: TrainingTheme) => {
  const params = exercise.paramsByTheme[theme];
  return {
    sets: Math.round((params.setsRange[0] + params.setsRange[1]) / 2),
    reps: Math.round((params.repsRange[0] + params.repsRange[1]) / 2),
    restSec: Math.round((params.restSecRange[0] + params.restSecRange[1]) / 2),
  };
};

export default function SeancesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addExerciseId = searchParams.get("add");
  const initialTab = addExerciseId ? "creer" : searchParams.get("tab") ?? "programme";

  const {
    profile,
    sessions,
    exercises,
    createSessionFromTemplate,
    createCustomSession,
    getItemStatus,
  } = useV3Store();

  const profileTheme = profile?.theme ?? "VOLUME";
  const profileLevel = profile?.level ?? "DEBUTANT";

  const [tab, setTab] = useState(initialTab);
  const [planDate, setPlanDate] = useState("");

  const initialSelected = addExerciseId ? [addExerciseId] : [];
  const initialPlanned = useMemo(() => {
    const next: Record<string, { sets: number; reps: number; restSec: number }> = {};
    if (addExerciseId) {
      const exercise = exercises.find((item) => item.id === addExerciseId);
      if (exercise) {
        next[exercise.id] = buildPlannedParams(exercise, profileTheme);
      }
    }
    return next;
  }, [addExerciseId, exercises, profileTheme]);

  const [createStep, setCreateStep] = useState<CreateStep>(1);
  const [createMode, setCreateMode] = useState("planifiee");
  const [selectedExercises, setSelectedExercises] = useState<string[]>(initialSelected);
  const [createEquipmentFilter, setCreateEquipmentFilter] =
    useState<(typeof equipmentFilters)[number]>("TOUS");
  const [plannedValues, setPlannedValues] = useState<
    Record<string, { sets: number; reps: number; restSec: number }>
  >(initialPlanned);
  const [confirmWarning, setConfirmWarning] = useState(false);
  const [planDateCustom, setPlanDateCustom] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryEquipmentFilter, setLibraryEquipmentFilter] =
    useState<(typeof equipmentFilters)[number]>("TOUS");
  const [libraryDifficulty, setLibraryDifficulty] = useState<"TOUS" | number>("TOUS");
  const [libraryMuscle, setLibraryMuscle] = useState("");

  const programSlots = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) => {
        const title = `Programme S${index + 1}`;
        const session = sessions.find((item) => item.title === title);
        return { title, session };
      }),
    [sessions]
  );

  const handlePlanNext = () => {
    const dateValue = planDate ? new Date(planDate).toISOString() : new Date().toISOString();
    createSessionFromTemplate(profileTheme, profileLevel, dateValue);
    setPlanDate("");
  };

  const filteredExercises = useMemo(() => {
    if (createEquipmentFilter === "TOUS") return exercises;
    return exercises.filter((exercise) => exercise.equipment.includes(createEquipmentFilter));
  }, [createEquipmentFilter, exercises]);

  const libraryExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      if (
        libraryEquipmentFilter !== "TOUS" &&
        !exercise.equipment.includes(libraryEquipmentFilter)
      ) {
        return false;
      }
      if (libraryDifficulty !== "TOUS" && exercise.difficulty !== libraryDifficulty) {
        return false;
      }
      if (libraryMuscle.trim()) {
        const target = libraryMuscle.toLowerCase();
        if (!exercise.muscles.some((muscle) => muscle.toLowerCase().includes(target))) {
          return false;
        }
      }
      if (librarySearch.trim()) {
        const target = librarySearch.toLowerCase();
        const haystack = `${exercise.name} ${exercise.muscles.join(" ")}`.toLowerCase();
        if (!haystack.includes(target)) return false;
      }
      return true;
    });
  }, [exercises, libraryDifficulty, libraryEquipmentFilter, libraryMuscle, librarySearch]);

  const createSelection = useMemo(() => {
    return exercises.filter((exercise) => selectedExercises.includes(exercise.id));
  }, [exercises, selectedExercises]);

  const ensurePlanned = (exercise: Exercise) => {
    setPlannedValues((prev) => {
      if (prev[exercise.id]) return prev;
      return {
        ...prev,
        [exercise.id]: buildPlannedParams(exercise, profileTheme),
      };
    });
  };

  const hasRedWarning = useMemo(() => {
    return createSelection.some((exercise, index) => {
      const planned = plannedValues[exercise.id];
      if (!planned) return false;
      const status = getItemStatus(
        { exerciseId: exercise.id, order: index + 1, planned },
        profileTheme
      );
      return status === "red";
    });
  }, [createSelection, getItemStatus, plannedValues, profileTheme]);

  const handleCreateSave = () => {
    const items = createSelection.map((exercise, index) => ({
      exerciseId: exercise.id,
      order: index + 1,
      planned: plannedValues[exercise.id],
    }));
    const session = createCustomSession({
      title: "Séance personnalisée",
      theme: profileTheme,
      status: "PLANIFIEE",
      plannedAt: createMode === "planifiee" ? planDateCustom || undefined : new Date().toISOString(),
      items,
    });
    if (createMode === "immediate") {
      router.push(`/seances/en-cours/${session.id}`);
    } else {
      router.push("/carnet?tab=historique");
    }
  };

  return (
    <div className="space-y-6">
      <V3Header
        title="Séances"
        action={
          <V3Button variant="secondary" onClick={() => setTab("creer")}>
            <Plus className="h-4 w-4" />
            Séance
          </V3Button>
        }
      />

      <V3SegmentedControl value={tab} options={tabOptions} onChange={setTab} />

      {tab === "programme" ? (
        <div className="space-y-4">
          <V3Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                  Cycle de 8 séances
                </p>
                <p className="text-xs text-[color:var(--v3-text-muted)]">
                  {profileTheme === "ENDURANCE_FORCE" ? "Endurance de force" : profileTheme} ·{" "}
                  {profileLevel === "INTERMEDIAIRE"
                    ? "Intermédiaire"
                    : profileLevel === "DEBUTANT"
                      ? "Débutant"
                      : "Avancé"}
                </p>
              </div>
              <V3Badge tone={themeTone[profileTheme]}>Thème</V3Badge>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={planDate}
                onChange={(event) => setPlanDate(event.target.value)}
                className="min-h-11 flex-1 rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              />
              <V3Button onClick={handlePlanNext}>Planifier la prochaine séance</V3Button>
            </div>
          </V3Card>

          <div className="space-y-3">
            {programSlots.map((slot, index) => {
              const status = slot.session?.status === "TERMINEE"
                ? "faite"
                : slot.session
                  ? "planifiée"
                  : "à faire";
              return (
                <V3Card key={slot.title} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                      S{index + 1}
                    </p>
                    <p className="text-xs text-[color:var(--v3-text-muted)]">
                      {slot.session?.plannedAt ? formatDate(slot.session.plannedAt) : "Pas de date"}
                    </p>
                  </div>
                  <V3Badge tone={status === "faite" ? "volume" : status === "planifiée" ? "endurance" : "neutral"}>
                    {status}
                  </V3Badge>
                </V3Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === "creer" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-[color:var(--v3-text-muted)]">
              Étape {createStep}/3
            </p>
            <V3Badge tone="neutral">{selectedExercises.length}/6 exercices</V3Badge>
          </div>

          {createStep === 1 ? (
            <div className="space-y-4">
              <V3Card className="space-y-3">
                <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                  Choisir les exercices
                </p>
                <div className="flex flex-wrap gap-2">
                  {equipmentFilters.map((filter) => (
                    <V3Button
                      key={filter}
                      type="button"
                      variant={createEquipmentFilter === filter ? "primary" : "secondary"}
                      onClick={() => setCreateEquipmentFilter(filter)}
                    >
                      {filter === "TOUS" ? "Tout" : filter}
                    </V3Button>
                  ))}
                </div>
              </V3Card>

              <div className="space-y-3">
                {filteredExercises.map((exercise) => {
                  const selected = selectedExercises.includes(exercise.id);
                  return (
                    <V3Card key={exercise.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                            {exercise.name}
                          </p>
                          <p className="text-xs text-[color:var(--v3-text-muted)]">
                            {exercise.muscles.join(" · ")}
                          </p>
                        </div>
                        <span className="text-xs text-[color:var(--v3-text-muted)]" aria-label={`Difficulté ${exercise.difficulty}`}>
                          {"★".repeat(exercise.difficulty)}
                        </span>
                      </div>
                      <V3Button
                        variant={selected ? "secondary" : "primary"}
                        onClick={() => {
                          if (selected) {
                            setSelectedExercises((prev) =>
                              prev.filter((id) => id !== exercise.id)
                            );
                            setPlannedValues((prev) => {
                              const next = { ...prev };
                              delete next[exercise.id];
                              return next;
                            });
                            return;
                          }
                          if (selectedExercises.length >= 6) return;
                          setSelectedExercises((prev) => [...prev, exercise.id]);
                          ensurePlanned(exercise);
                        }}
                      >
                        {selected ? "Retirer" : "Ajouter"}
                      </V3Button>
                    </V3Card>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <V3Button variant="ghost" onClick={() => setTab("programme")} className="w-full">
                  Retour
                </V3Button>
                <V3Button
                  onClick={() => setCreateStep(2)}
                  className="w-full"
                  disabled={selectedExercises.length === 0}
                >
                  Continuer
                </V3Button>
              </div>
            </div>
          ) : null}

          {createStep === 2 ? (
            <div className="space-y-4">
              <V3Card className="space-y-2">
                <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                  Paramètres par exercice
                </p>
                <p className="text-xs text-[color:var(--v3-text-muted)]">
                  Ajuste les séries, reps et repos selon ton thème.
                </p>
              </V3Card>

              <div className="space-y-3">
                {createSelection.map((exercise, index) => {
                  const planned = plannedValues[exercise.id];
                  if (!planned) return null;
                  const status = getItemStatus(
                    { exerciseId: exercise.id, order: index + 1, planned },
                    profileTheme
                  );
                  return (
                    <V3Card key={exercise.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                          {exercise.name}
                        </p>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            status === "green"
                              ? "bg-[color:var(--v3-accent-volume)]"
                              : status === "orange"
                                ? "bg-orange-400"
                                : "bg-[color:var(--v3-accent-power)]"
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(["sets", "reps", "restSec"] as const).map((key) => (
                          <label key={key} className="space-y-1">
                            <span className="text-xs text-[color:var(--v3-text-muted)]">
                              {key === "sets" ? "Séries" : key === "reps" ? "Reps" : "Repos (s)"}
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={planned[key]}
                              onChange={(event) =>
                                setPlannedValues((prev) => ({
                                  ...prev,
                                  [exercise.id]: {
                                    ...prev[exercise.id],
                                    [key]: Number(event.target.value),
                                  },
                                }))
                              }
                              className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
                            />
                          </label>
                        ))}
                      </div>
                    </V3Card>
                  );
                })}
              </div>

              {hasRedWarning ? (
                <V3Card className="space-y-2 border border-[color:var(--v3-accent-power)]/40">
                  <p className="text-sm text-[color:var(--v3-accent-power)]">
                    Paramètres incohérents détectés. Confirme pour continuer.
                  </p>
                  <label className="flex items-center gap-2 text-xs text-[color:var(--v3-text-muted)]">
                    <input
                      type="checkbox"
                      checked={confirmWarning}
                      onChange={() => setConfirmWarning((prev) => !prev)}
                      className="h-4 w-4 accent-[color:var(--v3-accent-power)]"
                    />
                    Je confirme malgré l’alerte.
                  </label>
                </V3Card>
              ) : null}

              <div className="flex gap-2">
                <V3Button variant="ghost" onClick={() => setCreateStep(1)} className="w-full">
                  Retour
                </V3Button>
                <V3Button
                  onClick={() => setCreateStep(3)}
                  className="w-full"
                  disabled={hasRedWarning && !confirmWarning}
                >
                  Continuer
                </V3Button>
              </div>
            </div>
          ) : null}

          {createStep === 3 ? (
            <div className="space-y-4">
              <V3Card className="space-y-2">
                <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                  Résumé de la séance
                </p>
                <div className="space-y-2">
                  {createSelection.map((exercise) => {
                    const planned = plannedValues[exercise.id];
                    if (!planned) return null;
                    return (
                      <div key={exercise.id} className="flex items-center justify-between text-xs">
                        <span className="text-[color:var(--v3-text)]">{exercise.name}</span>
                        <span className="text-[color:var(--v3-text-muted)]">
                          {planned.sets}x{planned.reps} · {planned.restSec}s
                        </span>
                      </div>
                    );
                  })}
                </div>
              </V3Card>

              <V3SegmentedControl
                value={createMode}
                options={[
                  { value: "planifiee", label: "Planifiée" },
                  { value: "immediate", label: "Immédiate" },
                ]}
                onChange={setCreateMode}
              />

              {createMode === "planifiee" ? (
                <V3Card className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[color:var(--v3-text-muted)]" />
                  <input
                    type="date"
                    value={planDateCustom}
                    onChange={(event) => setPlanDateCustom(event.target.value)}
                    className="min-h-11 flex-1 rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
                  />
                </V3Card>
              ) : null}

              <div className="flex gap-2">
                <V3Button variant="ghost" onClick={() => setCreateStep(2)} className="w-full">
                  Retour
                </V3Button>
                <V3Button onClick={handleCreateSave} className="w-full">
                  Enregistrer dans le carnet
                </V3Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "bibliotheque" ? (
        <div className="space-y-4">
          <V3Card className="space-y-2">
            <p className="text-sm font-semibold text-[color:var(--v3-text)]">
              Bibliothèque d’exercices
            </p>
            <input
              type="text"
              placeholder="Rechercher un exercice"
              className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.target.value)}
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <select
                value={libraryEquipmentFilter}
                onChange={(event) =>
                  setLibraryEquipmentFilter(event.target.value as (typeof equipmentFilters)[number])
                }
                className="min-h-11 rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              >
                {equipmentFilters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter === "TOUS" ? "Matériel: tout" : `Matériel: ${filter}`}
                  </option>
                ))}
              </select>
              <select
                value={libraryDifficulty}
                onChange={(event) =>
                  setLibraryDifficulty(
                    event.target.value === "TOUS" ? "TOUS" : Number(event.target.value)
                  )
                }
                className="min-h-11 rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
              >
                <option value="TOUS">Difficulté: toutes</option>
                {[1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={level}>
                    Difficulté: {level}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Muscle (ex: pectoraux)"
                className="min-h-11 rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
                value={libraryMuscle}
                onChange={(event) => setLibraryMuscle(event.target.value)}
              />
            </div>
          </V3Card>

          <div className="space-y-3">
            {libraryExercises.length === 0 ? (
              <V3EmptyState
                title="Aucun exercice"
                description="Ajuste tes filtres pour voir des résultats."
              />
            ) : (
              libraryExercises.map((exercise) => (
                <V3Card key={exercise.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                        {exercise.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {exercise.muscles.map((muscle) => (
                          <V3Badge key={muscle} tone="neutral">
                            {muscle}
                          </V3Badge>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-[color:var(--v3-text-muted)]">
                      {"★".repeat(exercise.difficulty)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <V3Button asChild variant="secondary">
                      <Link href={`/seances/exercice/${exercise.id}`}>
                        Voir la fiche
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </V3Button>
                    <V3Button asChild>
                      <Link href={`/seances?tab=creer&add=${exercise.id}`}>
                        <Star className="h-4 w-4" />
                        Ajouter à ma séance
                      </Link>
                    </V3Button>
                  </div>
                </V3Card>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
