"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEGACY_STORAGE_KEY = "muscuQuickLog";
const STORAGE_KEY = "eps:muscu:quicklog:v1";
const SAVE_RESET_MS = 1800;
const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

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

const safeGet = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
};

const safeRemove = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseQuickLog = (
  raw: string | null,
  key: string
): MuscuQuickLogState | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) {
      safeRemove(key);
      return null;
    }
    const title = typeof parsed.title === "string" ? parsed.title : "";
    const notes = typeof parsed.notes === "string" ? parsed.notes : "";
    const updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : "";
    return { title, notes, updatedAt };
  } catch {
    safeRemove(key);
    return null;
  }
};

const readQuickLog = (): MuscuQuickLogState => {
  const current = parseQuickLog(safeGet(STORAGE_KEY), STORAGE_KEY);
  if (current) return current;
  const legacy = parseQuickLog(safeGet(LEGACY_STORAGE_KEY), LEGACY_STORAGE_KEY);
  if (legacy) {
    safeSet(STORAGE_KEY, JSON.stringify(legacy));
    safeRemove(LEGACY_STORAGE_KEY);
    return legacy;
  }
  return DEFAULT_STATE;
};

export function MuscuQuickLog() {
  const [state, setState] = useState<MuscuQuickLogState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate after mount to avoid SSR mismatch
    setState(readQuickLog());
  }, []);

  const formatTimestamp = (value: string) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return DATE_FORMATTER.format(parsed);
  };

  const handleSave = () => {
    const payload = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    setState(payload);
    safeSet(STORAGE_KEY, JSON.stringify(payload));
    setSaved(true);
    window.setTimeout(() => setSaved(false), SAVE_RESET_MS);
  };

  const handleClear = () => {
    safeRemove(STORAGE_KEY);
    safeRemove(LEGACY_STORAGE_KEY);
    setState(DEFAULT_STATE);
    setSaved(false);
  };

  const hasContent = Boolean(state.title || state.notes || state.updatedAt);

  return (
    <GlassCard className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-white/60">
        Carnet rapide
      </p>
      <div className="space-y-2">
        <label className="space-y-1 text-xs uppercase tracking-widest text-white/60">
          Séance
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
            placeholder="Ex : Haut du corps + gainage"
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
            placeholder="Ressenti, charges, points à corriger..."
            value={state.notes}
            onChange={(event) =>
              setState((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" className="ui-btn-primary" onClick={handleSave}>
          {saved ? "Enregistré" : "Enregistrer"}
        </Button>
        {hasContent ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="ui-chip"
            onClick={handleClear}
          >
            Effacer
          </Button>
        ) : null}
        <span className={cn("text-xs text-white/60", saved && "text-emerald-200")}>
          {state.updatedAt
            ? `Dernière mise à jour: ${formatTimestamp(state.updatedAt)}`
            : "Aucune note enregistrée"}
        </span>
      </div>
    </GlassCard>
  );
}
