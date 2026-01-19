"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { V3Card } from "@/components/v3/ui/V3Card";
import { useV3Store } from "@/lib/v3/store";

export function V3Gate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, profile } = useV3Store();

  useEffect(() => {
    if (!ready) return;
    if (!profile?.onboardingDone && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }
    if (profile?.onboardingDone && pathname === "/onboarding") {
      router.replace("/accueil");
    }
  }, [pathname, profile, ready, router]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <V3Card className="text-center">
          <p className="text-sm text-[color:var(--v3-text-muted)]">
            Chargement du profil...
          </p>
        </V3Card>
      </div>
    );
  }

  return <>{children}</>;
}
