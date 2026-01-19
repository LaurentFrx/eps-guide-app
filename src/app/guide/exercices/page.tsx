import Link from "next/link";

export default function ExercicesPage() {
  return (
    <div className="space-y-4">
      <h1>Exercices</h1>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded border px-3 py-1">
          Abdos
        </button>
        <button type="button" className="rounded border px-3 py-1">
          Dorsaux
        </button>
        <button type="button" className="rounded border px-3 py-1">
          Membres supérieurs
        </button>
        <button type="button" className="rounded border px-3 py-1">
          Membres inférieurs
        </button>
        <button type="button" className="rounded border px-3 py-1">
          Cross-training
        </button>
        <button type="button" className="rounded border px-3 py-1">
          Étirements
        </button>
      </div>
      <ul className="space-y-2">
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
        <li>
          <Link href="/guide/exercices/demo/burpees">Burpees</Link>
        </li>
      </ul>
    </div>
  );
}