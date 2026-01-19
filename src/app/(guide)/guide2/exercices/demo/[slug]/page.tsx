type Params = {
  slug: string;
};

type PageProps = {
  params: Promise<Params>;
};

export default async function ExerciceDemoPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ?? "";
  const title = slug ? slug[0].toUpperCase() + slug.slice(1) : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{title}</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Vidéo</h2>
        <div className="aspect-video w-full rounded-xl border flex items-center justify-center">
          À venir
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Objectif</h2>
        <p>Objectif: …</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Placement / Exécution</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>…</li>
          <li>…</li>
          <li>…</li>
          <li>…</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Erreurs fréquentes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>…</li>
          <li>…</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Variantes</h2>
        <p>Facile: …</p>
        <p>Difficile: …</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Paramètres rapides</h2>
        <div className="space-y-1 text-sm">
          <p>Endurance — Séries | Reps | Repos | Intensité</p>
          <p>Volume — Séries | Reps | Repos | Intensité</p>
          <p>Puissance — Séries | Reps | Repos | Intensité</p>
        </div>
      </section>
    </div>
  );
}
