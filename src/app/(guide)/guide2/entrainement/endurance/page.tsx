import Link from "next/link";

export default function EndurancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Endurance</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Topo</h2>
        <p>Objectif: …</p>
        <p>Repères: …</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Paramètres</h2>
        <p>Séries: …</p>
        <p>Reps: …</p>
        <p>Repos: …</p>
        <p>Intensité: …</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Méthodes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>…</li>
          <li>…</li>
          <li>…</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Exercices recommandés</h2>
        <div className="flex flex-col gap-2">
          <Link href="/guide2/exercices/demo/squat" className="text-sm underline">
            Squat
          </Link>
          <Link href="/guide2/exercices/demo/pompes" className="text-sm underline">
            Pompes
          </Link>
          <Link href="/guide2/exercices/demo/tractions" className="text-sm underline">
            Tractions
          </Link>
          <Link href="/guide2/exercices/demo/fentes" className="text-sm underline">
            Fentes
          </Link>
          <Link href="/guide2/exercices/demo/planche" className="text-sm underline">
            Planche
          </Link>
        </div>
      </section>
    </div>
  );
}
