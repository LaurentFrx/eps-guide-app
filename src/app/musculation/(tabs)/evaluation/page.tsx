import { MuscuEvaluationView } from "@/components/muscu/MuscuEvaluationView";
import { evaluationInfographicsBySection, evaluationProfiles } from "@/lib/muscu";

export default function MuscuEvaluationPage() {
  return (
    <MuscuEvaluationView
      sections={evaluationProfiles[0]?.sections ?? []}
      infographicsBySection={evaluationInfographicsBySection}
    />
  );
}
