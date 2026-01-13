"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "muscuQuickLog";
const SAVE_RESET_MS = 1800;

type MuscuQuickLogState = {
  title: string;
  notes: string;
  updatedAt: string;
};

const DEFAULT_STATE: MuscuQuickLogState = {
  title: "",
  notes: "",
  updatedAt: "",
};

const readQuickLog = (): MuscuQuickLogState => {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    return JSON.parse(raw) as MuscuQuickLogState;
  } catch {
    return DEFAULT_STATE;
  }
};

export function MuscuQuickLog() {
  const [state, setState] = useState<MuscuQuickLogState>(() => readQuickLog());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const payload = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    setState(payload);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSaved(true);
    window.setTimeout(() => setSaved(false), SAVE_RESET_MS);
  };

  return (
    <GlassCard className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-white/60">
        Carnet rapide
      </p>
      <div className="space-y-2">
        <label className="space-y-1 text-xs uppercase tracking-widest text-white/60">
          Seance
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
            placeholder="Ex: Haut du corps + gainage"
            value={state.title}
            onChange={(event) =>
              setState((current) => ({ ...current, title: event.target.value }))
            }
          />
        </label>
        <label className="space-y-1 text-xs uppercase tracking-widest text-white/60">
          Notes
          <textarea
            className="mt-1 min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
            placeholder="Ressenti, charges, points a corriger..."
            value={state.notes}
            onChange={(event) =>
              setState((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" className="ui-btn-primary" onClick={handleSave}>
          {saved ? "Enregistre" : "Enregistrer"}
        </Button>
        <span className={cn("text-xs text-white/60", saved && "text-emerald-200")}>
          {state.updatedAt
            ? `Derniere mise a jour: ${state.updatedAt.slice(0, 10)}`
            : "Aucune note enregistree"}
        </span>
      </div>
    </GlassCard>
  );
}
