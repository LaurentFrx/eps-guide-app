import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { isAdminConfigured } from "@/lib/admin/config";

export default function SettingsPage() {
  const adminEnabled = isAdminConfigured();

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Param&apos;tres
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Param&apos;tres de l&apos;app
        </h1>
        <p className="text-sm text-white/70">
          Gerez vos acces et les options avanc&apos;es.
        </p>
      </GlassCard>

      <GlassCard className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-white">Admin</p>
          <p className="text-xs text-white/60">
            {adminEnabled
              ? "Mode admin activ&apos;."
              : "Admin non configur&apos; (KV + secrets requis)."}
          </p>
        </div>
        {adminEnabled ? (
          <Button asChild className="ui-btn-primary">
            <Link href="/admin">Ouvrir</Link>
          </Button>
        ) : (
          <Button className="ui-chip" disabled>
            Admin non configur&apos;
          </Button>
        )}
      </GlassCard>
    </div>
  );
}





