import Link from "next/link";

export default function PuissancePage() {
  return (
    <div className="space-y-6">
      <h1>Puissance</h1>

      <section className="space-y-2">
        <h2>Topo</h2>
        <p>…</p>
        <p>…</p>
      </section>

      <section className="space-y-2">
        <h2>Paramètres</h2>
        <p>Séries: …</p>
        <p>Reps: …</p>
        <p>Repos: …</p>
        <p>Intensité: …</p>
      </section>

      <section className="space-y-2">
        <h2>Méthodes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>…</li>
          <li>…</li>
          <li>…</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2>Exercices recommandés</h2>
        <ul className="space-y-1">
          <li>
            <Link href="/guide/exercices/demo/squat">Squat</Link>
          </li>
          <li>
            <Link href="/guide/exercices/demo/pompes">Pompes</Link>
          </li>
          <li>
            <Link href="/guide/exercices/demo/tractions">Tractions</Link>
          </li>
          <li>
            <Link href="/guide/exercices/demo/fentes">Fentes</Link>
          </li>
          <li>
            <Link href="/guide/exercices/demo/planche">Planche</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}