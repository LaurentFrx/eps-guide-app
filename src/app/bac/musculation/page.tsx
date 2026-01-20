"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GlassCard } from "@/components/GlassCard";
import {
  BAC_MUSCULATION_DOCS,
  BAC_MUSCULATION_SECTIONS,
} from "@/lib/bac/muscuDocs";

const BAC_BASE = "/bac";
const MUSCULATION_SLUG = "musculation";
const BAC_MUSCULATION_PATH = `${BAC_BASE}/${MUSCULATION_SLUG}`;

const getSummaryPreview = (summaryMd: string) => {
  const line = summaryMd.split(/\r?\n/).find(Boolean) ?? "";
  return line.replace(/^\s*-\s*/, "");
};

export default function BacMusculationPage() {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const tags = useMemo(() => {
    const all = new Set<string>();
    BAC_MUSCULATION_DOCS.forEach((doc) => doc.tags.forEach((tag) => all.add(tag)));
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredDocs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return BAC_MUSCULATION_DOCS.filter((doc) => {
      const matchesQuery =
        !normalized ||
        doc.title.toLowerCase().includes(normalized) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(normalized)) ||
        doc.summaryMd.toLowerCase().includes(normalized);
      const matchesTags =
        activeTags.length === 0 || activeTags.every((tag) => doc.tags.includes(tag));
      return matchesQuery && matchesTags;
    });
  }, [activeTags, query]);

  const docsBySection = useMemo(
    () =>
      BAC_MUSCULATION_SECTIONS.map((section) => ({
        section,
        docs: filteredDocs.filter((doc) => doc.sectionId === section.id),
      })),
    [filteredDocs]
  );

  const hasFilters = query.trim().length > 0 || activeTags.length > 0;
  const totalResults = filteredDocs.length;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Ressources musculation
        </p>
        <h1 className="font-display text-3xl font-semibold text-white">
          Musculation
        </h1>
        <p className="text-sm text-white/70">
          17 ressources terrain, filtrables par tags, avec lecture PDF.
        </p>
      </header>

      <div className="sticky top-0 z-30 -mx-5 space-y-3 border-b border-white/5 bg-[#0b0f1a]/85 px-5 py-3 backdrop-blur">
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white/75">
            <Search className="h-4 w-4" />
            Recherche rapide
          </div>
          <Input
            placeholder="Épreuve, projet, méthode..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-white/75">
              <Filter className="h-4 w-4" />
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = activeTags.includes(tag);
                return (
                  <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "secondary"}
                    data-active={isActive ? "true" : "false"}
                    onClick={() =>
                      setActiveTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((item) => item !== tag)
                          : [...prev, tag]
                      )
                    }
                    className="ui-chip"
                  >
                    {tag}
                  </Button>
                );
              })}
            </div>
          </div>
          {hasFilters ? (
            <Button
              type="button"
              variant="secondary"
              className="ui-chip"
              onClick={() => {
                setQuery("");
                setActiveTags([]);
              }}
            >
              Réinitialiser les filtres
            </Button>
          ) : null}
        </GlassCard>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="ui-chip border-0">
            {totalResults} résultats
          </Badge>
          <Button asChild className="ui-btn-primary">
            <Link href="/accueil">Aller au guide complet</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {docsBySection.map(({ section, docs }) => {
          if (!docs.length) return null;
          return (
            <section key={section.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-white">
                    {section.title}
                  </h2>
                  <p className="text-sm text-white/60">{section.description}</p>
                </div>
                <Badge className="ui-chip border-0">{docs.length} docs</Badge>
              </div>
              <div className="grid gap-4">
                {docs.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`${BAC_MUSCULATION_PATH}/${doc.slug}`}
                    className="block"
                  >
                    <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-white/60">
                            {section.title}
                          </p>
                          <h3 className="font-display text-xl font-semibold text-white">
                            {doc.title}
                          </h3>
                          <p className="mt-1 text-sm text-white/70">
                            {getSummaryPreview(doc.summaryMd)}
                          </p>
                        </div>
                        <ArrowUpRight className="mt-1 h-5 w-5 text-white/70" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="ui-chip">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        {!totalResults ? (
          <GlassCard className="text-sm text-white/70">
            Aucun document ne correspond à la recherche.
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}
