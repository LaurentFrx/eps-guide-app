const sessions = [
  {
    title: "Séance rapide",
    subtitle: "10 min",
  },
  {
    title: "Débutant",
    subtitle: "2 semaines",
  },
  {
    title: "Objectif",
    subtitle: "Endurance / Volume / Puissance",
  },
];

export default function SeancesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Séances</h1>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.title} className="ui-card space-y-3 p-4">
            <div>
              <p className="text-sm font-semibold">{session.title}</p>
              <p className="text-xs text-white/70">{session.subtitle}</p>
            </div>
            <button type="button" className="ui-btn-primary w-full px-4 py-2 text-sm">
              Démarrer
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="ui-chip px-3 py-2 text-xs">
        Changer le niveau
      </button>
    </div>
  );
}