import { FlyerFrame } from "@/components/FlyerFrame";

export function HomeTopBanner() {
  return (
    <section aria-label="Bandeau EPS - Haroun Tazieff" className="mb-4">
      {/* IMPORTANT: ce composant doit etre rendu dans le meme wrapper/padding que le reste de la home */}
      <div className="w-full">
        <FlyerFrame>
          {/* Ratio exact 3:1 = aucun crop si l'image est bien 3:1 */}
          <div className="relative aspect-[3/1] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/branding/flyer-eps-ht-1.png"
              alt="EPS - Haroun Tazieff"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "50% 55%" }}
              loading="eager"
              decoding="async"
            />
          </div>
        </FlyerFrame>
      </div>
    </section>
  );
}
