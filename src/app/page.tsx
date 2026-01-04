import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/GlassCard";
import { sessions, exercises } from "@/lib/exercises";

export default function HomePage() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Guide EPS
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Vos fiches d&apos;entraînement, partout.
        </h1>
        <p className="text-sm text-slate-600">
          Recherchez, filtrez et sauvegardez vos exercices, même hors ligne.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-slate-100 text-slate-700">
            {sessions.length} sessions
          </Badge>
          <Badge className="border-0 bg-slate-100 text-slate-700">
            {exercises.length} exercices
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href="/docs">Docs</Link>
          </Button>
        </div>
      </div>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Recherche rapide
        </p>
        <form action="/search" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              placeholder="Planche, squat, S2-03..."
              className="pl-9"
            />
          </div>
          <Button type="submit" className="shrink-0">
            Chercher
          </Button>
        </form>
      </GlassCard>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-slate-900">
            Sessions
          </h2>
          <span className="text-sm text-slate-500">Tout parcourir</span>
        </div>
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Link key={session.id} href={`/exercises/${session.id}`} className="block">
              <GlassCard className="transition hover:-translate-y-0.5 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      {session.id}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-slate-900">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{session.subtitle}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="border-0 bg-slate-100 text-slate-700">
                    {session.exerciseCount} exercices
                  </Badge>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
