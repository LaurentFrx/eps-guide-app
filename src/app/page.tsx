import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/GlassCard";
import { HomeTopBanner } from "@/components/home/HomeTopBanner";
import { sessions } from "@/lib/exercises";
import { getExerciseStats } from "@/lib/stats";

export default function HomePage() {
  const stats = getExerciseStats();
  return (
    <>
      <HomeTopBanner />
      <main className="eps-home space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-4">
        <header className="eps-home__header space-y-3">
          <div className="eps-home__brand">
            <h1 className="sr-only">Guide EPS</h1>
            <span className="eps-home__title">GUIDE DE MUSCULATION</span>
          </div>
        </header>
        <p className="text-sm text-white/70">
          Recherchez, filtrez et sauvegardez vos exercices, même hors ligne.
        </p>
        <div className="eps-home__chips flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="ui-chip">
            {stats.sessionsCount} sessions
          </Badge>
          <Badge variant="outline" data-active="true" className="ui-chip">
            {stats.totalExercises} exercices
          </Badge>
          <Button asChild variant="outline" size="sm" className="ui-chip">
            <Link href="/docs">Docs</Link>
          </Button>
        </div>
      </div>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Recherche rapide
        </p>
        <form action="/search" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <Input
              name="q"
              placeholder="Planche, squat, S2-03..."
              className="pl-9"
            />
          </div>
          <Button type="submit" className="ui-btn-primary shrink-0">
            Chercher
          </Button>
        </form>
      </GlassCard>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-white">
            Sessions
          </h2>
          <span className="text-sm text-white/60">Tout parcourir</span>
        </div>
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Link key={session.id} href={`/exercises/${session.id}`} className="block">
              <GlassCard className="transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">
                      {session.id}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-white">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">{session.subtitle}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/70" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="ui-chip">
                    {stats.bySeries[session.id] ?? session.exerciseCount} exercices
                  </Badge>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
      </main>
    </>
  );
}
