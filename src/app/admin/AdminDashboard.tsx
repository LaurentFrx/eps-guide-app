"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogOut, Plus, Search } from "lucide-react";
import type { MergedExerciseRecord } from "@/lib/exercises/merged";
import type { OverrideSummary } from "@/lib/admin/store";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type AdminDashboardProps = {
  exercises: MergedExerciseRecord[];
  overrides: Record<string, OverrideSummary>;
};

type AdminStatus = {
  kvOk: boolean;
  adminConfigured: boolean;
  overridesCount: number;
  lastModified: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function AdminDashboard({
  exercises,
  overrides,
}: AdminDashboardProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [statusError, setStatusError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((exercise) =>
      `${exercise.code} ${exercise.title}`.toLowerCase().includes(q)
    );
  }, [exercises, query]);

  useEffect(() => {
    let active = true;
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/admin/status", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok) {
          setStatusError(payload.error ?? "Impossible de charger l’état.");
          return;
        }
        setStatus(payload);
      } catch {
        if (active) {
          setStatusError("Impossible de charger l’état.");
        }
      }
    };
    loadStatus();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/");
  };

  const handleResetOverride = async (code: string) => {
    if (!window.confirm(`Réinitialiser l’override de ${code} ?`)) return;
    const response = await fetch(`/api/admin/exercises/${code}`, {
      method: "DELETE",
    });
    if (response.ok) {
      window.location.assign("/admin");
      return;
    }
    const payload = await response.json().catch(() => ({}));
    window.alert(payload.error ?? "Impossible de réinitialiser.");
  };

  const overridesCount = status?.overridesCount ?? Object.keys(overrides).length;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <GlassCard className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/60">État</p>
          <h2 className="text-lg font-semibold text-white">Status admin</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              KV connecté
            </p>
            <p className="text-sm text-white">
              {status ? (status.kvOk ? "Oui" : "Non") : "…"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Admin configuré
            </p>
            <p className="text-sm text-white">
              {status ? (status.adminConfigured ? "Oui" : "Non") : "…"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Overrides KV
            </p>
            <p className="text-sm text-white">{overridesCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Dernière modif
            </p>
            <p className="text-sm text-white">
              {status ? formatDate(status.lastModified) : "…"}
            </p>
          </div>
        </div>
        {statusError ? (
          <p className="text-sm text-red-200">{statusError}</p>
        ) : null}
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Admin
            </p>
            <h1 className="font-display text-2xl font-semibold text-white">
              Tableau de bord
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="ui-chip" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              DＤonnexion
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          <Input
            placeholder="Rechercher un exercice..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Raccourcis
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="ui-btn-primary">
            <Link href="/admin/exercises/new">
              <Plus className="h-4 w-4" />
              Nouvelle fiche
            </Link>
          </Button>
          <Button asChild variant="ghost" className="ui-chip">
            <Link href="/admin/audit">Audit</Link>
          </Button>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <p className="text-sm text-white/70">
          {filtered.length} exercices
        </p>
        <div className="grid gap-3">
          {filtered.map((exercise) => {
            const overrideMeta = overrides[exercise.code];
            const statusLabel =
              exercise.source === "custom"
                ? "Custom"
                : exercise.hasOverride
                  ? "Override"
                  : "Master";
            const canReset =
              exercise.source === "base" && exercise.hasOverride;

            return (
              <GlassCard key={exercise.code} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">
                      {exercise.code}
                    </p>
                    <h2 className="text-lg font-semibold text-white">
                      {exercise.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="ui-chip border-0">{statusLabel}</Badge>
                    {exercise.hasOverride ? (
                      <Badge className="ui-chip border-0">Override</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/70">
                  <span>{exercise.level || "Niveau non dＧini"}</span>
                  {overrideMeta?.updatedAt ? (
                    <span>Dernière modif : {formatDate(overrideMeta.updatedAt)}</span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="ghost" className="ui-chip">
                    <Link href={`/admin/exercises/${exercise.code}`}>
                      Modifier
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="ui-chip">
                    <Link
                      href={`/exercises/detail/${exercise.code}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Aperçu
                    </Link>
                  </Button>
                  {canReset ? (
                    <Button
                      variant="ghost"
                      className="ui-chip"
                      onClick={() => handleResetOverride(exercise.code)}
                    >
                      Réinitialiser
                    </Button>
                  ) : null}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
