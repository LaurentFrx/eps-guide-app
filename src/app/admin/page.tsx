import { isAdminConfigured } from "@/lib/admin/env";
import { getMergedExerciseRecord } from "@/lib/exercises/merged";
import AdminDashboard from "./AdminDashboard";
import { GlassCard } from "@/components/GlassCard";
import { getOverrideSummariesForCodes } from "@/lib/admin/store";
import { PDF_INDEX, getPdfItem } from "@/data/pdfIndex";
import { getEditorialSources } from "@/lib/editorial/sourceMap";

export default async function AdminPage() {
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
            Configurez KV et les secrets admin pour activer l’édition.
          </p>
        </GlassCard>
      </div>
    );
  }

  const codes = PDF_INDEX.map((item) => item.code);
  const [sources, overrides, records] = await Promise.all([
    getEditorialSources(),
    getOverrideSummariesForCodes(codes),
    Promise.all(codes.map((code) => getMergedExerciseRecord(code))),
  ]);

  const overrideMap = new Map(
    overrides.map((override) => [override.code, override])
  );

  const exercises = codes.map((code, index) => {
    const record = records[index];
    const pdfItem = getPdfItem(code);
    return {
      code,
      title: record?.title || pdfItem?.title || code,
      level: record?.level ?? "",
      source: sources.get(code) ?? "Fallback",
      hasOverride: overrideMap.has(code),
      updatedAt: overrideMap.get(code)?.updatedAt ?? null,
      series: pdfItem?.series ?? code.split("-")[0] ?? "",
    };
  });

  return <AdminDashboard exercises={exercises} />;
}

