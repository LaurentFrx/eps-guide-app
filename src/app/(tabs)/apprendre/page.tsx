const topics = [
  "Placement & sécurité",
  "Mouvements clés",
  "Muscles",
  "Méthodes",
];

export default function ApprendrePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Apprendre</h1>

      <div className="grid grid-cols-2 gap-3">
        {topics.map((topic) => (
          <button key={topic} type="button" className="ui-card p-4 text-left">
            <p className="text-sm font-semibold">{topic}</p>
          </button>
        ))}
      </div>
    </div>
  );
}