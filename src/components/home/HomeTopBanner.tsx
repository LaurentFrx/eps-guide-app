import Image from "next/image";

export function HomeTopBanner() {
  return (
    <section aria-label="Bandeau EPS — Haroun Tazieff" className="mb-4">
      {/* IMPORTANT: ce composant doit être rendu dans le même wrapper/padding que le reste de la home */}
      <div className="w-full">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
          {/* Ratio exact 3:1 = aucun crop si l’image est bien 3:1 */}
          <div className="relative aspect-[3/1] w-full">
            <Image
              src="/branding/flyer-eps-ht-1.png"
              alt="EPS — Haroun Tazieff"
              fill
              priority
              unoptimized
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "50% 55%" }}
            />
          </div>

          {/* Pas de voile: uniquement un léger liseré interne */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>
      </div>
    </section>
  );
}
