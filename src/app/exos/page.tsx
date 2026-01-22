const cards = [
  {
    title: "Catalogue",
    tag: "Library",
    body: "Browse a clean list of movements to build your routine.",
  },
  {
    title: "Focus",
    tag: "Target",
    body: "Filter by muscle group, equipment, or level as needed.",
  },
  {
    title: "Quick set",
    tag: "Build",
    body: "Draft a short set and keep the pace steady.",
  },
];

export default function ExosPage() {
  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Exos</p>
        <h1>Build your training blocks</h1>
        <p className="lede">
          Start with a focused list of moves and keep each session simple.
        </p>
      </header>
      <div className="card-grid">
        {cards.map((card) => (
          <article key={card.title} className="card">
            <span className="pill">{card.tag}</span>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
