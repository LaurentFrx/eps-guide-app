import { GlassCard } from "@/components/GlassCard";
import { ImageZoomModal } from "@/components/muscu/ImageZoomModal";
import {
  KNOWLEDGE_SECTIONS,
  knowledgeInfographicsBySection,
  knowledgeThemes,
} from "@/lib/muscu";

export default function MuscuConnaissancesPage() {
  const formatSection = (section: string) =>
    section === "Connaissances" ? "Revisions" : section;

  const bySection = knowledgeThemes.reduce<Record<string, typeof knowledgeThemes>>(
    (acc, theme) => {
      const list = acc[theme.section] ?? [];
      list.push(theme);
      acc[theme.section] = list;
      return acc;
    },
    {}
  );

  const orderedSections = [
    ...KNOWLEDGE_SECTIONS.filter((section) => bySection[section]?.length),
    ...Object.keys(bySection).filter(
      (section) => !KNOWLEDGE_SECTIONS.includes(section as typeof KNOWLEDGE_SECTIONS[number])
    ),
  ];

  const infographicSections = Object.entries(knowledgeInfographicsBySection);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Revisions</p>
        <h2 className="font-display text-2xl font-semibold text-white">
          Revisions terrain
        </h2>
        <p className="text-sm text-white/70">
          Repere rapide sur les projets, methodes et consignes cles.
        </p>
      </header>

      <div className="space-y-4">
        {orderedSections.map((section) => (
          <details key={section} className="ui-card p-4">
            <summary className="flex cursor-pointer items-center justify-between gap-3">
              <span className="font-display text-lg font-semibold text-white">
                {formatSection(section)}
              </span>
              <span className="text-xs uppercase tracking-widest text-white/50">
                {bySection[section]?.length ?? 0} fiches
              </span>
            </summary>
            <div className="mt-4 grid gap-4">
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
          </details>
        ))}
      </div>

      {infographicSections.length ? (
        <details className="ui-card p-4">
          <summary className="flex cursor-pointer items-center justify-between gap-3">
            <span className="font-display text-lg font-semibold text-white">
              Infographies
            </span>
            <span className="ui-chip px-3 py-1 text-xs">Voir toutes les infographies</span>
          </summary>
          <div className="mt-4 space-y-4">
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
        </details>
      ) : null}
    </div>
  );
}


