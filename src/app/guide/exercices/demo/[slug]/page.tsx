import React from "react";

type DemoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="space-y-6">
      <h1>{title}</h1>

      <section className="space-y-2">
        <h2>Vidéo</h2>
        <div className="aspect-video w-full rounded-xl border flex items-center justify-center">
          À venir
        </div>
      </section>

      <section className="space-y-2">
        <h2>Objectif</h2>
        <p>Objectif: …</p>
      </section>

      <section className="space-y-2">
        <h2>Placement / Exécution</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>…</li>
          <li>…</li>
          <li>…</li>
          <li>…</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>Erreurs fréquentes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>…</li>
          <li>…</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>Variantes</h2>
        <p>Facile: …</p>
        <p>Difficile: …</p>
      </section>

      <section className="space-y-2">
        <h2>Paramètres rapides</h2>
        <div className="space-y-1">
          <p>Endurance — Séries | Reps | Repos | Intensité</p>
          <p>Volume — Séries | Reps | Repos | Intensité</p>
          <p>Puissance — Séries | Reps | Repos | Intensité</p>
        </div>
      </section>
    </div>
  );
}
