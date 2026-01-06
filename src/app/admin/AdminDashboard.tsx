"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LogOut, Plus, Search } from "lucide-react";
import type { MergedExerciseRecord } from "@/lib/exercises/merged";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type AdminDashboardProps = {
  exercises: MergedExerciseRecord[];
};

export default function AdminDashboard({ exercises }: AdminDashboardProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((exercise) =>
      `${exercise.code} ${exercise.title}`.toLowerCase().includes(q)
    );
  }, [exercises, query]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
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
            <Button asChild className="ui-btn-primary">
              <Link href="/admin/exercises/new">
                <Plus className="h-4 w-4" />
                Nouvelle fiche
              </Link>
            </Button>
            <Button variant="ghost" className="ui-chip" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Déconnexion
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
                  <Badge className="ui-chip border-0">
                    {exercise.source === "custom" ? "Custom" : "Base"}
                  </Badge>
                  {exercise.hasOverride ? (
                    <Badge className="ui-chip border-0">Override</Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>{exercise.level || "Niveau non défini"}</span>
                <Link className="ui-link font-medium" href={`/admin/exercises/${exercise.code}`}>
                  Modifier
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
