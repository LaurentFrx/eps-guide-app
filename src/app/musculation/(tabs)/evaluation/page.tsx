import { GlassCard } from "@/components/GlassCard";
import { evaluationProfiles } from "@/lib/muscu";

export default function MuscuEvaluationPage() {
  return (
    <div className="space-y-4">
      {evaluationProfiles.map((profile) => (
        <GlassCard key={profile.id} className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/60">
            {profile.title}
          </p>
          {profile.sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-white/50">
                {section.title}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </GlassCard>
      ))}
    </div>
  );
}
