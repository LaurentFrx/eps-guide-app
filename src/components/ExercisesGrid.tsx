"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { Exercise } from "@/lib/exercises";
import { normalizeExerciseCode } from "@/lib/exerciseCode";

type ExerciseItem = Exercise & { status?: "ready" | "draft" };

export default function ExercisesGrid({ exercises }: { exercises: ExerciseItem[] }) {
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
          (() => {
            const status = ex.status ?? "ready";
            const isDraft = status === "draft";
            const normalizedCode = normalizeExerciseCode(ex.id);
            const Card = (
              <>
                <div className="relative h-36 w-full">
                  {ex.image ? (
                    <Image
                      src={ex.image}
                      alt={ex.title}
                      fill
                      className="object-cover"
                      unoptimized={ex.image.toLowerCase().endsWith(".svg")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <ImageOff className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Missing image</span>
                    </div>
                  )}
                  {isDraft ? (
                    <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-white">
                      Bientot
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium">{ex.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{ex.level}</span>
                    <span className="text-xs text-slate-400">{ex.sessionId}</span>
                  </div>
                </div>
              </>
            );

            if (isDraft) {
              return (
                <div
                  key={ex.id}
                  className="block rounded-2xl border border-dashed border-slate-200 bg-white/70 shadow-sm overflow-hidden opacity-80"
                  aria-disabled="true"
                >
                  {Card}
                </div>
              );
            }

            return (
              <Link
                key={ex.id}
                href={`/exercises/detail/${normalizedCode}`}
                className="block rounded-2xl border bg-white shadow-sm overflow-hidden"
              >
                {Card}
              </Link>
            );
          })()
        ))}
      </div>
    </div>
  );
}
