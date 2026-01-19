export default function EvaluationPage() {
  return (
    <div className="space-y-4">
      <h1>Évaluation</h1>
      <p>Critères et barèmes par niveau.</p>
      <div className="rounded border px-3 py-2">2nde + CAP</div>
      <div className="rounded border px-3 py-2">1ère LGT + PRO</div>
      <div className="rounded border px-3 py-2">Terminale LGT + PRO</div>
      <section className="space-y-2">
        <h2>À vérifier avant l’évaluation</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Thème choisi et justifié (Endurance / Volume / Puissance)</li>
          <li>Paramètres cohérents (séries, reps, repos, intensité)</li>
          <li>Technique et sécurité (placement, amplitude, respiration)</li>
          <li>Progression mesurable (charges/reps/temps)</li>
          <li>Carnet de suivi complété (séances + ressenti)</li>
        </ul>
      </section>
    </div>
  );
}
