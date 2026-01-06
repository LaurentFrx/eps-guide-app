import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { isAdminConfigured } from "@/lib/admin/env";

export default function SettingsPage() {
  const adminEnabled = isAdminConfigured();
  const adminHref = adminEnabled ? "/admin" : "/admin/login";

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Paramètres
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Paramètres de l’app
        </h1>
        <p className="text-sm text-white/70">
          Gérez vos accès et les options avancées.
        </p>
      </GlassCard>

      <GlassCard className="flex flex-wrap items-center justify-between gap-2">
        <Link href={adminHref} className="space-y-1">
          <p className="text-sm font-medium text-white">Admin</p>
          <p className="text-xs text-white/60">
            {adminEnabled
              ? "Mode admin activé."
              : "Admin non configuré (KV + secrets requis)."}
          </p>
        </Link>
        {adminEnabled ? (
          <Button asChild className="ui-btn-primary">
            <Link href={adminHref}>Ouvrir</Link>
          </Button>
        ) : (
          <Button asChild className="ui-chip">
            <Link href={adminHref}>Admin non configuré</Link>
          </Button>
        )}
      </GlassCard>
    </div>
  );
}






