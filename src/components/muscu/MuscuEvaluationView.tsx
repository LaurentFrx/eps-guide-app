import { GlassCard } from "@/components/GlassCard";
import { ImageZoomModal } from "@/components/muscu/ImageZoomModal";
import type { EvaluationProfile, Infographic } from "@/lib/muscu/types";

type MuscuEvaluationViewProps = {
  sections: EvaluationProfile["sections"];
  infographicsBySection: Record<string, Infographic[]>;
};

export function MuscuEvaluationView({
  sections,
  infographicsBySection,
}: MuscuEvaluationViewProps) {
  const infographicSections = Object.entries(infographicsBySection);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {sections.map((section) => (
          <GlassCard key={section.title} className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/60">
              {section.title}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </GlassCard>
        ))}

        {infographicSections.length ? (
          <div className="space-y-4">
            {infographicSections.map(([section, infographics]) => (
              <div key={section} className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-white/60">
                  {section}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {infographics.map((info) => (
                    <ImageZoomModal
                      key={info.id}
                      src={info.src}
                      alt="Infographie epreuve musculation"
                      className="shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
