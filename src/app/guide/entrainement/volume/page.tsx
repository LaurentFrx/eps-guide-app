import Link from "next/link";

export default function VolumePage() {
  return (
    <div className="space-y-6">
      <h1>Volume</h1>

      <section className="space-y-2">
        <h2>Topo</h2>
        <p>
          Objectif: augmenter le volume musculaire grâce à des charges modérées et
          un travail proche de l’échec contrôlé.
        </p>
        <p>
          Priorité: technique propre, progression régulière, récupération suffisante
          entre séances.
        </p>
      </section>

      <section className="space-y-2">
        <h2>Paramètres</h2>
        <p>Séries: 3–5</p>
        <p>Reps: 8–12</p>
        <p>Repos: 60–120s</p>
        <p>Intensité: RPE 7–8 (charge modérée)</p>
      </section>

      <section className="space-y-2">
        <h2>Méthodes</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Superset (enchaîner 2 exercices, repos réduit)</li>
          <li>Pyramidal (augmenter ou diminuer la charge sur les séries)</li>
          <li>Tempo (ralentir la descente pour augmenter le temps sous tension)</li>
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
