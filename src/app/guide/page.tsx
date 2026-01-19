import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="space-y-4">
      <h1>Guide Musculation EPS</h1>
      <p>Conçois tes séances d’entraînement en EPS.</p>
      <div className="flex flex-col gap-2">
        <Link
          className="inline-flex w-fit rounded border px-3 py-2"
          href="/guide/exercices"
        >
          Trouver un exercice
        </Link>
        <Link
          className="inline-flex w-fit rounded border px-3 py-2"
          href="/guide/entrainement"
        >
          Choisir un thème
        </Link>
        <Link
          className="inline-flex w-fit rounded border px-3 py-2"
          href="/guide/evaluation"
        >
          Comprendre l’évaluation
        </Link>
      </div>
    </div>
  );
}