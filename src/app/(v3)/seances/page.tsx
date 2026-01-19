import { Suspense } from "react";
import { V3Card } from "@/components/v3/ui/V3Card";
import SeancesClient from "./SeancesClient";

export default function SeancesPage() {
  return (
    <Suspense
      fallback={
        <V3Card className="text-sm text-[color:var(--v3-text-muted)]">
          Chargement des seances...
        </V3Card>
      }
    >
      <SeancesClient />
    </Suspense>
  );
}