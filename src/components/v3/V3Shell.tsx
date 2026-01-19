"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { V3BottomNav } from "@/components/v3/ui/V3BottomNav";
import { V3Gate } from "@/components/v3/V3Gate";
import { V3StoreProvider } from "@/lib/v3/store";

export function V3Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname?.startsWith("/onboarding");

  return (
    <div className="v3-root">
      <V3StoreProvider>
        <V3Gate>
          <div className="mx-auto w-full max-w-lg px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+96px)]">
            {children}
          </div>
        </V3Gate>
        {!hideNav ? <V3BottomNav /> : null}
      </V3StoreProvider>
    </div>
  );
}
