export default function EvaluationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Évaluation</h1>
      <p>Critères et barèmes par niveau.</p>
      <div className="space-y-2">
        <div className="rounded-md border px-3 py-2 text-sm">2nde + CAP</div>
        <div className="rounded-md border px-3 py-2 text-sm">1ère LGT + PRO</div>
        <div className="rounded-md border px-3 py-2 text-sm">Terminale LGT + PRO</div>
      </div>
    </div>
  );
}
