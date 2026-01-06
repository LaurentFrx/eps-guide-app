"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogOut, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type AdminExerciseItem = {
  code: string;
  title: string;
  level: string;
  source: "Master" | "Report" | "Fallback";
  hasOverride: boolean;
  updatedAt: string | null;
  series: string;
};

type AdminDashboardProps = {
  exercises: AdminExerciseItem[];
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

export default function AdminDashboard({ exercises }: AdminDashboardProps) {
  const [query, setQuery] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [overrideFilter, setOverrideFilter] = useState("all");
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [statusError, setStatusError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((exercise) => {
      if (seriesFilter !== "all" && exercise.series !== seriesFilter) {
        return false;
      }
      if (sourceFilter !== "all" && exercise.source !== sourceFilter) {
        return false;
      }
      if (overrideFilter === "yes" && !exercise.hasOverride) {
        return false;
      }
      if (overrideFilter === "no" && exercise.hasOverride) {
        return false;
      }
      if (!q) return true;
      return `${exercise.code} ${exercise.title}`.toLowerCase().includes(q);
    });
  }, [exercises, query, seriesFilter, sourceFilter, overrideFilter]);

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

  const overridesCount =
    status?.overridesCount ?? exercises.filter((item) => item.hasOverride).length;

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
              Déconnexion
            </Button>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.2fr,1fr,1fr,1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <Input
              placeholder="Rechercher un exercice..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={seriesFilter}
            onChange={(event) => setSeriesFilter(event.target.value)}
            className="ui-input px-3 py-2 text-sm"
          >
            <option value="all">Toutes les sessions</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
            <option value="S3">S3</option>
            <option value="S4">S4</option>
            <option value="S5">S5</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="ui-input px-3 py-2 text-sm"
          >
            <option value="all">Toutes les sources</option>
            <option value="Master">Master</option>
            <option value="Report">Report</option>
            <option value="Fallback">Fallback</option>
          </select>
          <select
            value={overrideFilter}
            onChange={(event) => setOverrideFilter(event.target.value)}
            className="ui-input px-3 py-2 text-sm"
          >
            <option value="all">Tous les overrides</option>
            <option value="yes">Override oui</option>
            <option value="no">Override non</option>
          </select>
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
          {filtered.map((exercise) => (
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
                  <Badge className="ui-chip border-0">{exercise.source}</Badge>
                  {exercise.hasOverride ? (
                    <Badge className="ui-chip border-0">Override KV</Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/70">
                <span>{exercise.level || "Niveau non défini"}</span>
                <span>
                  Dernière modif : {formatDate(exercise.updatedAt)}
                </span>
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
                {exercise.hasOverride ? (
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
          ))}
        </div>
      </div>
    </div>
  );
}
