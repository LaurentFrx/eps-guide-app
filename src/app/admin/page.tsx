import { isAdminConfigured } from "@/lib/admin/config";
import { getMergedExerciseRecords } from "@/lib/exercises/merged";
import AdminDashboard from "./AdminDashboard";
import { GlassCard } from "@/components/GlassCard";

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

  const exercises = await getMergedExerciseRecords();
  return <AdminDashboard exercises={exercises} />;
}
