import Image from "next/image";

export function HomeTopBanner() {
  return (
    <section aria-label="Bandeau EPS — Haroun Tazieff" className="mb-4">
      {/* Full-bleed mais intégré proprement */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-3 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_14px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {/* Hauteur contenue + responsive */}
          <div className="relative h-[clamp(84px,12vw,200px)]">
            <Image
              src="/branding/flyer-eps-ht-1.png"
              alt="EPS — Haroun Tazieff"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "50% 50%" }}
            />
          </div>

          {/* Highlight iOS-like */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/14 via-transparent to-black/18" />
          {/* Edge highlight */}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>
      </div>
    </section>
  );
}
