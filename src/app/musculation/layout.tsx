import type { ReactNode } from "react";
import { FlyerFrame } from "@/components/FlyerFrame";
import { MuscuBackLink } from "@/components/muscu/MuscuBackLink";

export default function MusculationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <FlyerFrame>
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-xs uppercase tracking-widest text-white/60">Module</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-white">
            Musculation
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Reperes essentiels, seances et ressources.
          </p>
        </div>
      </FlyerFrame>

      <MuscuBackLink />

      {children}
    </div>
  );
}
