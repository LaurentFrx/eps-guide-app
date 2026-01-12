import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { muscuExercises } from "@/lib/muscu";

export default function MuscuExercicesPage() {
  return (
    <div className="space-y-4">
      {muscuExercises.map((exercise) => (
        <GlassCard key={exercise.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">
                {exercise.zone}
              </p>
              <h3 className="text-lg font-semibold text-white">{exercise.title}</h3>
            </div>
            <Badge variant="outline" className="ui-chip">
              {exercise.status === "approved" ? "Valide" : "Draft"}
            </Badge>
          </div>
          <p className="text-sm text-white/70">
            {exercise.targetMuscles.join(", ")}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
            {exercise.cues.slice(0, 3).map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </GlassCard>
      ))}
    </div>
  );
}
