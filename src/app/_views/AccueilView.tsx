import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { FlyerHeader } from "@/components/FlyerHeader";
import { Button } from "@/components/ui/button";
import { MuscuProjectPicker } from "@/components/muscu/MuscuProjectPicker";
import { MuscuQuickLog } from "@/components/muscu/MuscuQuickLog";
import { MUSCUTAZIEFF_GROUPS } from "@/content/muscutazieffMap";
import { sessions } from "@/lib/exercises";
import { cn } from "@/lib/utils";

const tileStyle = (accent: string): CSSProperties =>
  ({ "--tile-accent": accent } as CSSProperties);

export function AccueilView() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <FlyerHeader className="mb-0" />
        <div className="flex flex-wrap items-center gap-4">
          <span className="relative h-14 w-14 overflow-hidden rounded-[18px] bg-white/10">
            <Image
              src="/branding/logo-eps.png"
              alt="Guide musculation"
              fill
              sizes="56px"
              className="object-contain p-2"
            />
          </span>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">
              Guide de musculation
            </p>
            <h1 className="font-display text-3xl font-semibold text-white">
              Guide de musculation
            </h1>
            <p className="text-sm text-white/70">
              Sessions, exercices, methodes et evaluation terminale. Mode terrain.
            </p>
          </div>
        </div>
      </section>

      <section className="ui-card space-y-4 p-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-white/55">
            Acces rapide
          </p>
          <h2 className="font-display text-xl font-semibold text-white">
            Aller a l essentiel
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild className="ui-btn-primary ui-pressable min-h-11 w-full">
            <Link href="/search" className="flex items-center justify-between gap-2">
              Trouver un exercice
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="ui-chip ui-pressable min-h-11 w-full"
          >
            <Link href="#sessions" className="flex items-center justify-between gap-2">
              Parcourir les seances
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-white/55">
            Rubriques
          </p>
          <h2 className="font-display text-2xl font-semibold text-white">
            Parcours Muscu&apos;Tazieff
          </h2>
        </div>

        <div className="grid gap-6">
          {MUSCUTAZIEFF_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">{group.title}</h3>
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
                      <h4 className="text-base font-semibold">{item.title}</h4>
                      {item.subtitle ? (
                        <p className="text-sm text-white/70">{item.subtitle}</p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="sessions" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-white/55">
              Sessions
            </p>
            <h2 className="font-display text-2xl font-semibold text-white">
              Les 5 seances terrain
            </h2>
          </div>
          <Link href="/exercises" className="ui-link text-sm font-medium">
            Tout parcourir
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/exercises/${session.id}`}
              className="ui-card ui-pressable overflow-hidden"
            >
              <div className="relative h-32 w-full">
                <Image
                  src={session.heroImage}
                  alt={session.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized={session.heroImage.toLowerCase().endsWith(".svg")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-1 text-[11px] font-semibold text-white">
                  {session.id}
                </span>
              </div>
              <div className="space-y-2 p-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">
                    {session.title}
                  </h3>
                  <p className="text-sm text-white/70">{session.subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                  <span className="ui-chip px-3 py-1">
                    {session.exerciseCount} exercices
                  </span>
                  {session.chips.slice(0, 2).map((chip) => (
                    <span key={chip} className="ui-chip px-3 py-1">
                      {chip}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white">
                  Voir la session
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-white/55">
              Outils terrain
            </p>
            <h2 className="font-display text-2xl font-semibold text-white">
              Notes rapides et projet actif
            </h2>
          </div>
          <Link href="/carnet" className="ui-link text-sm font-medium">
            Ouvrir le carnet
          </Link>
        </div>
        <div className="grid gap-4">
          <MuscuProjectPicker />
          <MuscuQuickLog />
        </div>
      </section>
    </div>
  );
}
