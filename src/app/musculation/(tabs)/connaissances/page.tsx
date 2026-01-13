"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { ImageZoomModal } from "@/components/muscu/ImageZoomModal";
import { knowledgeInfographicsBySection, knowledgeThemes } from "@/lib/muscu";

export default function MuscuConnaissancesPage() {
  const sectionLabels: Record<string, string> = {
    Projets: "Projets",
    Paramètres: "Paramètres",
    Méthodes: "Méthodes",
    Anatomie: "Anatomie",
    Contractions: "Contractions",
  };
  const formatSection = (section: string) => sectionLabels[section] ?? section;

  const primarySections = ["Anatomie", "Contractions", "Méthodes"];
  const secondarySections = ["Projets", "Paramètres"];
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [infographicsOpen, setInfographicsOpen] = useState(false);

  const bySection = useMemo(
    () =>
      knowledgeThemes.reduce<Record<string, typeof knowledgeThemes>>(
        (acc, theme) => {
          const list = acc[theme.section] ?? [];
          list.push(theme);
          acc[theme.section] = list;
          return acc;
        },
        {}
      ),
    []
  );

  const orderedSections = [
    ...primarySections.filter((section) => bySection[section]?.length),
    ...secondarySections.filter((section) => bySection[section]?.length),
    ...Object.keys(bySection).filter(
      (section) =>
        !primarySections.includes(section) &&
        !secondarySections.includes(section)
    ),
  ];

  const infographicSections = Object.entries(knowledgeInfographicsBySection);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const anchorForLabel = (label: string) => {
    if (label === "Paramètres") return "parametres";
    if (label === "Méthodes") return "methodes";
    return `section-${slugify(label)}`;
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Connaissances
        </p>
        <h2 className="font-display text-2xl font-semibold text-white">
          Connaissances terrain
        </h2>
        <p className="text-sm text-white/70">
          Repère rapide sur l’anatomie, les contractions et les méthodes.
        </p>
      </header>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Index
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          {primarySections
            .filter((section) => bySection[section]?.length)
            .map((section) => {
              const label = formatSection(section);
              const anchor = anchorForLabel(label);
              return (
                <a key={section} href={`#${anchor}`} className="ui-chip">
                  {label}
                </a>
              );
            })}
        </div>
      </GlassCard>

      <div className="space-y-4">
        {orderedSections.map((section) => {
          const label = formatSection(section);
          const sectionId = slugify(label);
          const anchorId = anchorForLabel(label);
          return (
          <div key={section} id={anchorId} className="ui-card p-4">
            <button
              type="button"
              id={`toggle-${sectionId}`}
              aria-controls={`panel-${sectionId}`}
              aria-expanded={openSections[section] ?? false}
              onClick={() => toggleSection(section)}
              className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
            >
              <span className="font-display text-lg font-semibold text-white">
                {label}
              </span>
              <span className="text-xs uppercase tracking-widest text-white/50">
                {bySection[section]?.length ?? 0} fiches
              </span>
            </button>
            <div
              id={`panel-${sectionId}`}
              role="region"
              aria-labelledby={`toggle-${sectionId}`}
              hidden={!openSections[section]}
              className="mt-4 grid gap-4"
            >
              {bySection[section]?.map((theme) => (
                <GlassCard key={theme.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {theme.title}
                    </h3>
                  </div>
                  <p className="text-sm text-white/70">{theme.summary}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
                    {theme.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  {theme.imageSrc ? (
                    <ImageZoomModal
                      src={theme.imageSrc}
                      alt={(theme.alt ?? theme.title).replace(/\bbac\b/gi, "epreuve")}
                    />
                  ) : null}
                </GlassCard>
              ))}
            </div>
          </div>
        );
        })}
      </div>

      {infographicSections.length ? (
        <div className="ui-card p-4">
          <button
            type="button"
            id="toggle-infographies"
            aria-controls="panel-infographies"
            aria-expanded={infographicsOpen}
            onClick={() => setInfographicsOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
          >
            <span className="font-display text-lg font-semibold text-white">
              Infographies
            </span>
            <span className="ui-chip px-3 py-1 text-xs">
              Voir toutes les infographies
            </span>
          </button>
          <div
            id="panel-infographies"
            role="region"
            aria-labelledby="toggle-infographies"
            hidden={!infographicsOpen}
            className="mt-4 space-y-4"
          >
            {infographicSections.map(([section, infographics]) => {
              const displaySection = formatSection(section);
              return (
                <div key={section} className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">
                    {displaySection}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {infographics.map((info) => (
                      <ImageZoomModal
                        key={info.id}
                        src={info.src}
                        alt={info.alt.replace(/\bbac\b/gi, "epreuve")}
                        className="shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}


