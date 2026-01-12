import { MuscuEvaluationView } from "@/components/muscu/MuscuEvaluationView";
import { evaluationInfographics, evaluationProfiles } from "@/lib/muscu";

export default function MuscuEvaluationPage() {
  return (
    <MuscuEvaluationView
      profiles={evaluationProfiles}
      infographics={evaluationInfographics}
    />
  );
}
