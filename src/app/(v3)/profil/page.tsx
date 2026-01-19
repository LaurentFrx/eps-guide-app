"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { V3Header } from "@/components/v3/V3Header";
import { V3Badge } from "@/components/v3/ui/V3Badge";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3EmptyState } from "@/components/v3/ui/V3EmptyState";
import { V3ProgressBar } from "@/components/v3/ui/V3ProgressBar";
import { useV3Store } from "@/lib/v3/store";
import { APP_VERSION, COMMIT_SHA } from "@/lib/version";

const PREF_DARK = "epsmuscu:v3:pref:dark";
const PREF_NOTIF = "epsmuscu:v3:pref:notif";

const readPref = (key: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;
  return value === "true";
};

export default function ProfilPage() {
  const { profile, resetV3, aflProgress } = useV3Store();
  const [darkMode, setDarkMode] = useState(() => readPref(PREF_DARK, false));
  const [notifications, setNotifications] = useState(() => readPref(PREF_NOTIF, false));

  const togglePref = (key: string, value: boolean, setter: (next: boolean) => void) => {
    setter(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, String(value));
    }
  };

  const shortSha = COMMIT_SHA ? COMMIT_SHA.slice(0, 7) : "";

  return (
    <div className="space-y-6">
      <V3Header title="Profil" />

      <V3Card className="space-y-2">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">
          {profile?.pseudo ?? "Profil élève"}
        </p>
        <div className="flex flex-wrap gap-2">
          {profile?.theme ? (
            <V3Badge tone="neutral">
              {profile.theme === "ENDURANCE_FORCE" ? "Endurance de force" : profile.theme}
            </V3Badge>
          ) : null}
          {profile?.level ? (
            <V3Badge tone="neutral">
              {profile.level === "INTERMEDIAIRE"
                ? "Intermédiaire"
                : profile.level === "DEBUTANT"
                  ? "Débutant"
                  : "Avancé"}
            </V3Badge>
          ) : null}
        </div>
      </V3Card>

      <V3Card className="space-y-3">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">Progression AFL</p>
        <V3ProgressBar
          value={aflProgress.afl1.score}
          max={aflProgress.afl1.max}
          tone="endurance"
          label="AFL1 /12"
        />
        <V3ProgressBar
          value={aflProgress.afl2.score}
          max={aflProgress.afl2.max}
          tone="volume"
          label="AFL2 /4"
        />
        <V3ProgressBar
          value={aflProgress.afl3.score}
          max={aflProgress.afl3.max}
          tone="power"
          label="AFL3 /4"
        />
      </V3Card>

      <V3Card className="space-y-3">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">Préférences</p>
        <label className="flex items-center justify-between text-sm text-[color:var(--v3-text-muted)]">
          Mode sombre
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(event) => togglePref(PREF_DARK, event.target.checked, setDarkMode)}
            className="h-4 w-4 accent-[color:var(--v3-accent-endurance)]"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-[color:var(--v3-text-muted)]">
          Notifications
          <input
            type="checkbox"
            checked={notifications}
            onChange={(event) =>
              togglePref(PREF_NOTIF, event.target.checked, setNotifications)
            }
            className="h-4 w-4 accent-[color:var(--v3-accent-endurance)]"
          />
        </label>
      </V3Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--v3-text-muted)]">
          Succès
        </h2>
        {profile?.badges?.length ? (
          <V3Card className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <V3Badge key={badge} tone="volume">
                {badge}
              </V3Badge>
            ))}
          </V3Card>
        ) : (
          <V3EmptyState
            title="Aucun badge"
            description="Réalise des quiz et séances pour gagner des succès."
          />
        )}
      </section>

      <div className="flex flex-col gap-2">
        <V3Button asChild>
          <Link href="/profil/export">Exporter mon carnet (PDF)</Link>
        </V3Button>
        <V3Button
          variant="secondary"
          onClick={() => {
            if (typeof window !== "undefined" && window.confirm("Réinitialiser la V3 ?")) {
              resetV3();
              window.location.href = "/onboarding";
            }
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser V3
        </V3Button>
      </div>

      <p className="text-xs text-[color:var(--v3-text-muted)]">
        Version v3 · {APP_VERSION}
        {shortSha ? ` · ${shortSha}` : ""}
      </p>
    </div>
  );
}
