"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3Header } from "@/components/v3/V3Header";

export default function OfflinePage() {
  return (
    <div className="space-y-6">
      <V3Header title="Mode hors ligne" />
      <V3Card className="space-y-3 text-center">
        <WifiOff className="mx-auto h-6 w-6 text-[color:var(--v3-text-muted)]" />
        <p className="text-sm text-[color:var(--v3-text)]">
          Vous êtes hors connexion.
        </p>
        <p className="text-xs text-[color:var(--v3-text-muted)]">
          Les données locales restent disponibles.
        </p>
        <V3Button asChild>
          <Link href="/accueil">Retour à l’accueil</Link>
        </V3Button>
      </V3Card>
    </div>
  );
}
