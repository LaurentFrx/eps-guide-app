import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { MUSCUTAZIEFF_GROUPS } from "@/content/muscutazieffMap";
import { cn } from "@/lib/utils";

const tileStyle = (accent: string): CSSProperties =>
  ({ "--tile-accent": accent } as CSSProperties);

export default function GuidePage() {
  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/55">Guide</p>
        <h1 className="font-display text-3xl font-semibold text-white">
          Sommaire Muscu&apos;Tazieff
        </h1>
        <p className="text-sm text-white/70">
          Parcours rapide par themes, connaissances, demarche et evaluation.
        </p>
      </header>

      <section className="ui-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/55">
              Source
            </p>
            <p className="text-base font-semibold text-white">
              PDF complet Muscu&apos;Tazieff
            </p>
          </div>
          <Link
            href="/content/muscutazieff.pdf"
            target="_blank"
            rel="noreferrer"
            className="ui-link text-sm font-medium"
          >
            Ouvrir le PDF
          </Link>
        </div>
        <p className="text-sm text-white/65">
          Le PDF est charge par section pour faciliter la lecture sur mobile.
        </p>
      </section>

      <div className="grid gap-6">
        {MUSCUTAZIEFF_GROUPS.map((group) => (
          <section key={group.id} className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">{group.title}</h2>
              {group.description ? (
                <p className="text-sm text-white/65">{group.description}</p>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <Link
                  key={item.route}
                  href={item.route}
                  className={cn(
                    "ui-tile ui-pressable relative overflow-hidden px-4 py-4",
                    item.variant === "light" && "ui-tile--light",
                    item.variant === "pill" && "rounded-full px-5"
                  )}
                  style={tileStyle(item.accent)}
                >
                  <div className="relative z-10 space-y-1">
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    {item.subtitle ? (
                      <p className="text-sm text-white/70">{item.subtitle}</p>
                    ) : null}
                  </div>
                  <span className="relative z-10 mt-3 inline-flex items-center gap-2 text-sm font-medium text-white">
                    Lire
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
