import Image from "next/image";
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
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Guide EPS
        </p>
        <div className="flex items-center">
          <Image
            src="/logo-eps.png"
            alt="EPS"
            width={512}
            height={160}
            priority
            sizes="(max-width: 640px) 160px, 220px"
            className="h-8 w-auto sm:h-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Recherchez, filtrez et sauvegardez vos exercices, même hors ligne.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border border-border/60 bg-surface-2 text-muted-foreground">
            {sessions.length} sessions
          </Badge>
          <Badge className="border border-border/60 bg-surface-2 text-muted-foreground">
            {exercises.length} exercices
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href="/docs">Docs</Link>
          </Button>
        </div>
      </div>

      <GlassCard className="space-y-3 border border-border/60 bg-surface/90 shadow-[var(--shadow)]">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Recherche rapide
        </p>
        <form action="/search" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
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
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Sessions
          </h2>
          <span className="text-sm text-muted-foreground">Tout parcourir</span>
        </div>
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Link key={session.id} href={`/exercises/${session.id}`} className="block">
              <GlassCard className="border border-border/60 bg-surface/90 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {session.id}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{session.subtitle}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground/70" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="border border-border/60 bg-surface-2 text-muted-foreground">
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
