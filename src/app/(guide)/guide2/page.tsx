import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Guide Musculation EPS</h1>
      <p>Conçois tes séances d’entraînement en EPS.</p>
      <div className="flex flex-col gap-2">
        <Link
          href="/guide2/exercices"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Trouver un exercice
        </Link>
        <Link
          href="/guide2/entrainement"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Choisir un thème
        </Link>
        <Link
          href="/guide2/evaluation"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Comprendre l’évaluation
        </Link>
      </div>
    </div>
  );
}
