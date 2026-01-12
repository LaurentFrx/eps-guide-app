import Image from "next/image";

export function HomeTopBanner() {
  return (
    <section aria-label="Bandeau EPS — Haroun Tazieff" className="mb-4">
      <div className="w-full px-3 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
          {/* ratio 3:1 + hauteur contenue */}
          <div className="relative aspect-[3/1] max-h-[200px] w-full">
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

          {/* iOS-like highlight (léger) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/14 via-transparent to-black/18" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>
      </div>
    </section>
  );
}
