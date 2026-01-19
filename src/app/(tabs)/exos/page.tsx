const tiles = ["Jambes", "Haut du corps", "Dos", "Gainage"];
const chips = ["Débutant", "Sans matériel", "Étirements"];
const mockExos = [
  { name: "Squat", tags: ["Débutant", "Sans matériel", "Jambes"] },
  { name: "Pompes", tags: ["Débutant", "Sans matériel", "Haut du corps"] },
  { name: "Rowing", tags: ["Intermédiaire", "Haltères", "Dos"] },
  { name: "Fentes", tags: ["Débutant", "Sans matériel", "Jambes"] },
  { name: "Planche", tags: ["Débutant", "Sans matériel", "Gainage"] },
  { name: "Hip thrust", tags: ["Intermédiaire", "Barre", "Jambes"] },
];

export default function ExosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Exos</h1>

      <section className="grid grid-cols-2 gap-3">
        {tiles.map((label) => (
          <div key={label} className="ui-card p-4">
            <p className="text-sm font-semibold">{label}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-2">
        {chips.map((label) => (
          <button key={label} type="button" className="ui-chip px-3 py-2 text-xs">
            {label}
          </button>
        ))}
      </section>

      <section className="space-y-3">
        {mockExos.map((exo) => (
          <div key={exo.name} className="ui-card space-y-3 p-4">
            <div>
              <p className="text-sm font-semibold">{exo.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {exo.tags.map((tag) => (
                  <span key={tag} className="ui-chip px-2 py-1 text-[11px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button type="button" className="ui-chip px-3 py-2 text-xs">
              Voir
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}