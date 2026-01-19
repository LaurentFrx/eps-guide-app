import { Suspense } from "react";
import { V3Card } from "@/components/v3/ui/V3Card";
import CarnetClient from "./CarnetClient";

export default function CarnetPage() {
  return (
    <Suspense
      fallback={
        <V3Card className="text-sm text-[color:var(--v3-text-muted)]">
          Chargement du carnet...
        </V3Card>
      }
    >
      <CarnetClient />
    </Suspense>
  );
}