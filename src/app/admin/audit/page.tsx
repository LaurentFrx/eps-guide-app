import "server-only";

import Link from "next/link";
import path from "path";
import { readFile } from "fs/promises";
import { GlassCard } from "@/components/GlassCard";
import { isAdminConfigured } from "@/lib/admin/env";
import { getMergedExerciseRecords } from "@/lib/exercises/merged";
import { hasCrossReference } from "@/lib/admin/editorialRules";

type FallbackEntry = {
  code: string;
  fields: string[];
  reason?: string;
};

type AuditIssue = {
  code: string;
  title: string;
  details: string;
};

const MIN_LENGTH = 40;

const loadFallbacks = async (): Promise<FallbackEntry[]> => {
  const filePath = path.join(
    process.cwd(),
    "docs",
    "editorial",
    "audit-editorial.fallbacks.json"
  );
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default async function AdminAuditPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Admin
          </p>
          <h1 className="font-display text-2xl font-semibold text-white">
            Admin non configuré
          </h1>
          <p className="text-sm text-white/70">
            Configurez les variables d’environnement KV + admin pour activer le mode.
          </p>
        </GlassCard>
      </div>
    );
  }

  const [exercises, fallbacks] = await Promise.all([
    getMergedExerciseRecords(),
    loadFallbacks(),
  ]);

  const fallbackMap = new Map(
    fallbacks.map((entry) => [entry.code, entry.fields])
  );

  const fallbackIssues: AuditIssue[] = [];
  const crossRefIssues: AuditIssue[] = [];
  const shortIssues: AuditIssue[] = [];

  exercises.forEach((exercise) => {
    const fallbackFields = fallbackMap.get(exercise.code);
    if (fallbackFields?.length) {
      fallbackIssues.push({
        code: exercise.code,
        title: exercise.title,
        details: `Fallback utilisé: ${fallbackFields.join(", ")}`,
      });
    }

    const fields = {
      consignes: exercise.consignesMd ?? "",
      dosage: exercise.dosageMd ?? "",
      securite: exercise.securiteMd ?? "",
    };

    const hasCrossRef = Object.entries(fields).filter(([, value]) =>
      hasCrossReference(value)
    );
    if (hasCrossRef.length) {
      crossRefIssues.push({
        code: exercise.code,
        title: exercise.title,
        details: `Contient “idem exercice” dans ${hasCrossRef
          .map(([key]) => key)
          .join(", ")}`,
      });
    }

    const tooShort = Object.entries(fields).filter(([, value]) =>
      value.trim().length > 0 && value.trim().length < MIN_LENGTH
    );
    if (tooShort.length) {
      shortIssues.push({
        code: exercise.code,
        title: exercise.title,
        details: `Trop court: ${tooShort
          .map(([key, value]) => `${key} (${value.trim().length})`)
          .join(", ")}`,
      });
    }
  });

  const renderIssues = (title: string, issues: AuditIssue[]) => (
    <GlassCard className="space-y-3">
      <h2 className="text-sm font-semibold text-white/80">{title}</h2>
      {issues.length ? (
        <div className="grid gap-3">
          {issues.map((issue) => (
            <div
              key={`${title}-${issue.code}-${issue.details}`}
              className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/80"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60">
                  {issue.code}
                </p>
                <p className="font-medium text-white">{issue.title}</p>
                <p className="text-xs text-white/60">{issue.details}</p>
              </div>
              <Link
                href={`/admin/exercises/${issue.code}`}
                className="ui-link font-medium"
              >
                Ouvrir
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/70">Aucune anomalie.</p>
      )}
    </GlassCard>
  );

  return (
    <div className="space-y-6 pb-8">
      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Audit
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Audit éditorial
        </h1>
        <p className="text-sm text-white/70">
          Vérifie les fallback, renvois “idem exercice” et textes trop courts.
        </p>
      </GlassCard>

      {renderIssues("Fallback utilisé", fallbackIssues)}
      {renderIssues("Contient “idem exercice”", crossRefIssues)}
      {renderIssues("Champs trop courts", shortIssues)}
    </div>
  );
}
