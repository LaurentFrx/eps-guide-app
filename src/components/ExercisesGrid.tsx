"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Exercise } from "@/lib/exercises";

export default function ExercisesGrid({ exercises }: { exercises: Exercise[] }) {
  const [q, setQ] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const levels = useMemo(() => Array.from(new Set(exercises.map((e) => e.level))), [exercises]);

  const filtered = exercises.filter((e) => {
    if (levelFilter && e.level !== levelFilter) return false;
    if (!q) return true;
    return e.title.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Rechercher un exercice" className="flex-1 rounded-md border px-3 py-2" />
        <select value={levelFilter ?? ""} onChange={(ev) => setLevelFilter(ev.target.value || null)} className="rounded-md border px-3 py-2">
          <option value="">Tous niveaux</option>
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => (
          <Link key={ex.id} href={`/exercices/${ex.sessionId}/${ex.id}`} className="block rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="relative h-36 w-full">
              <Image src={ex.image} alt={ex.title} fill className="object-cover" unoptimized />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium">{ex.title}</h3>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">{ex.level}</span>
                <span className="text-xs text-slate-400">{ex.sessionId}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
