import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";

export default function OfflinePage() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Mode hors ligne
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Vous etes hors connexion
        </h1>
        <p className="text-sm text-slate-600">
          Les fiches deja consultees restent disponibles.
        </p>
      </div>
      <GlassCard className="flex flex-col items-center gap-3 text-center">
        <WifiOff className="h-6 w-6 text-slate-400" />
        <p className="text-sm text-slate-600">
          Hors ligne actif. Reconnectez-vous pour mettre a jour les donnees.
        </p>
        <Button asChild>
          <Link href="/">Retour a l&apos;accueil</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
