"use client";

import { useEffect } from "react";
import { V3Header } from "@/components/v3/V3Header";
import { V3Card } from "@/components/v3/ui/V3Card";
import { useV3Store } from "@/lib/v3/store";

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value)
  );
};

export default function ExportPage() {
  const { profile, objectives, sessions } = useV3Store();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  }, []);

  return (
    <div className="space-y-6">
      <V3Header title="Export carnet" subtitle="Version imprimable" />

      <V3Card className="space-y-2">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">Profil</p>
        <p className="text-xs text-[color:var(--v3-text-muted)]">
          {profile?.pseudo ?? "Élève"} · {profile?.theme ?? "—"} · {profile?.level ?? "—"}
        </p>
        <p className="text-xs text-[color:var(--v3-text-muted)]">
          Créé le {formatDate(profile?.createdAt)}
        </p>
      </V3Card>

      <V3Card className="space-y-2">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">Objectifs</p>
        <p className="text-xs text-[color:var(--v3-text-muted)]">Objectif: {objectives.main || "—"}</p>
        <p className="text-xs text-[color:var(--v3-text-muted)]">Court terme: {objectives.shortTerm || "—"}</p>
        <p className="text-xs text-[color:var(--v3-text-muted)]">Moyen terme: {objectives.midTerm || "—"}</p>
        <p className="text-xs text-[color:var(--v3-text-muted)]">Long terme: {objectives.longTerm || "—"}</p>
      </V3Card>

      <V3Card className="space-y-3">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">Historique</p>
        <div className="space-y-2">
          {sessions.slice(0, 12).map((session) => (
            <div key={session.id} className="flex items-center justify-between text-xs">
              <span className="text-[color:var(--v3-text)]">{session.title}</span>
              <span className="text-[color:var(--v3-text-muted)]">
                {formatDate(session.endedAt ?? session.plannedAt)}
              </span>
            </div>
          ))}
        </div>
      </V3Card>
    </div>
  );
}
