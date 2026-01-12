import { GlassCard } from "@/components/GlassCard";
import { stretches } from "@/lib/muscu";

export default function MuscuEtirementsPage() {
  return (
    <div className="space-y-4">
      {stretches.map((stretch) => (
        <GlassCard key={stretch.id} className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            {stretch.status === "approved" ? "Valide" : "Draft"}
          </p>
          <h3 className="text-lg font-semibold text-white">{stretch.title}</h3>
          <div className="flex flex-wrap gap-2">
            {stretch.target.map((item) => (
              <span key={item} className="ui-chip rounded-full px-3 py-1 text-xs">
                {item}
              </span>
            ))}
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
            {stretch.cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </GlassCard>
      ))}
    </div>
  );
}
