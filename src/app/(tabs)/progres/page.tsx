const gauges = [
  { label: "Sécurité", value: 70 },
  { label: "Technique", value: 45 },
  { label: "Autonomie", value: 30 },
];

const badges = [
  { label: "Posture", unlocked: true },
  { label: "Respiration", unlocked: true },
  { label: "Régularité", unlocked: false },
  { label: "Progression", unlocked: false },
  { label: "Assiduité", unlocked: false },
  { label: "Respect des repos", unlocked: false },
];

export default function ProgresPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Progrès</h1>

      <div className="space-y-4">
        {gauges.map((gauge) => (
          <div key={gauge.label} className="ui-card space-y-2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{gauge.label}</p>
              <span className="text-xs text-white/70">{gauge.value}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-[rgba(176,216,132,0.9)]"
                style={{ width: `${gauge.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="ui-card space-y-3 p-4">
        <p className="text-sm font-semibold">Badges</p>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className="ui-chip px-3 py-2 text-xs"
              data-active={badge.unlocked ? "true" : undefined}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      <div className="ui-card p-4">
        <p className="text-sm font-semibold">Historique</p>
        <p className="mt-2 text-xs text-white/70">À venir.</p>
      </div>
    </div>
  );
}