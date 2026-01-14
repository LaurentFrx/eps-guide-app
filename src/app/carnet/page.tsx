import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { MuscuQuickLog } from "@/components/muscu/MuscuQuickLog";

export default function CarnetPage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Carnet
        </p>
        <p className="text-sm text-white/70">
          Noter la séance, les ressentis et les ajustements.
        </p>
      </GlassCard>

      <MuscuQuickLog />
    </div>
  );
}
