import Image from "next/image";

export function HomeTopBanner() {
  return (
    <section
      aria-label="Bandeau EPS — Lycée Haroun Tazieff"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden"
    >
      {/* hauteur faible, responsive */}
      <div className="relative h-[clamp(72px,10vw,140px)]">
        <Image
          src="/branding/eps-ht-flyer.png"
          alt="EPS — Lycée Haroun Tazieff"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "50% 55%" }}
        />
      </div>

      {/* optionnel: léger voile pour homogénéiser */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />

      <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-black shadow">
        BANNER OK
      </span>
    </section>
  );
}
