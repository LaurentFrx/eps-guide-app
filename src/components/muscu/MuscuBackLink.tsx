"use client";

import { usePathname } from "next/navigation";
import { BackLink } from "@/components/BackLink";

export function MuscuBackLink() {
  const pathname = usePathname();
  if (!pathname || pathname === "/musculation/accueil") return null;

  return (
    <div className="px-5 sm:px-6">
      <BackLink label="← Accueil Musculation" fallbackHref="/musculation/accueil" />
    </div>
  );
}
