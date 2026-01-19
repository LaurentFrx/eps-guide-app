import React from "react";

type DemoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const isSquat = slug === "squat";
  const title = isSquat
    ? "Squat"
    : slug.charAt(0).toUpperCase() + slug.slice(1);

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
        <p>
          {isSquat
            ? "Objectif: Renforcer cuisses et fessiers, apprendre un mouvement de base sûr."
            : "Objectif: …"}
        </p>
      </section>

      <section className="space-y-2">
        <h2>Placement / Exécution</h2>
        <ul className="list-disc pl-5 space-y-1">
          {isSquat ? (
            <>
              <li>
                Pieds largeur d’épaules, pointes légèrement ouvertes; talons au sol.
              </li>
              <li>Gainage fort, dos neutre, poitrine ouverte, regard horizontal.</li>
              <li>
                Descendre en poussant les hanches en arrière; genoux suivent les
                pointes de pieds.
              </li>
              <li>
                Remonter en poussant le sol; expiration en montée, inspiration en
                descente.
              </li>
            </>
          ) : (
            <>
              <li>…</li>
              <li>…</li>
              <li>…</li>
              <li>…</li>
            </>
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h2>Erreurs fréquentes</h2>
        <ul className="list-disc pl-5 space-y-1">
          {isSquat ? (
            <>
              <li>
                Genoux qui rentrent (valgus) → écarter légèrement, activer fessiers.
              </li>
              <li>
                Dos qui s’arrondit / buste qui s’effondre → réduire charge, gainer,
                amplitude contrôlée.
              </li>
            </>
          ) : (
            <>
              <li>…</li>
              <li>…</li>
            </>
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h2>Variantes</h2>
        {isSquat ? (
          <>
            <p>Facile: Squat au poids du corps ou squat sur box (amplitude contrôlée).</p>
            <p>Difficile: Front squat ou squat tempo (3s descente) / pause 1s en bas.</p>
          </>
        ) : (
          <>
            <p>Facile: …</p>
            <p>Difficile: …</p>
          </>
        )}
      </section>

      <section className="space-y-2">
        <h2>Paramètres rapides</h2>
        <div className="space-y-1">
          {isSquat ? (
            <>
              <p>Endurance — 3x15–20 | 45–60s | RPE 6 (léger/modéré)</p>
              <p>Volume — 4x8–12 | 60–90s | RPE 7–8 (modéré)</p>
              <p>Puissance — 5x3–5 | 3–4 min | RPE 8–9 (lourd, technique parfaite)</p>
            </>
          ) : (
            <>
              <p>Endurance — Séries | Reps | Repos | Intensité</p>
              <p>Volume — Séries | Reps | Repos | Intensité</p>
              <p>Puissance — Séries | Reps | Repos | Intensité</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
