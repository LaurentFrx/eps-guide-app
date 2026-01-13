import { MuscuEvaluationView } from "@/components/muscu/MuscuEvaluationView";
import { evaluationInfographicsBySection, evaluationProfiles } from "@/lib/muscu";

export default function MuscuEvaluationPage() {
  return (
    <MuscuEvaluationView
      profiles={evaluationProfiles}
      infographicsBySection={evaluationInfographicsBySection}
    />
  );
}
