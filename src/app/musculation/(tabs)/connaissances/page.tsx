import { GlassCard } from "@/components/GlassCard";
import { ImageZoomModal } from "@/components/muscu/ImageZoomModal";
import { knowledgeThemes } from "@/lib/muscu";

export default function MuscuConnaissancesPage() {
  const bySection = knowledgeThemes.reduce<Record<string, typeof knowledgeThemes>>(
    (acc, theme) => {
      const list = acc[theme.section] ?? [];
      list.push(theme);
      acc[theme.section] = list;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {Object.entries(bySection).map(([section, themes]) => (
        <div key={section} className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-white">
            {section}
          </h2>
          <div className="grid gap-4">
            {themes.map((theme) => (
              <GlassCard key={theme.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">
                      {theme.status === "approved" ? "Valide" : "Draft"}
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      {theme.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-white/70">{theme.summary}</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
                  {theme.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                {theme.imageSrc ? (
                  <ImageZoomModal src={theme.imageSrc} alt={theme.alt ?? theme.title} />
                ) : null}
              </GlassCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
