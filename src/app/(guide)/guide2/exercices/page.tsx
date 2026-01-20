import Link from "next/link";

export default function ExercicesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Exercices</h1>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-full border px-3 py-2 text-xs">
          Abdos
        </button>
        <button type="button" className="rounded-full border px-3 py-2 text-xs">
          Dorsaux
        </button>
        <button type="button" className="rounded-full border px-3 py-2 text-xs">
          Membres supérieurs
        </button>
        <button type="button" className="rounded-full border px-3 py-2 text-xs">
          Membres inférieurs
        </button>
        <button type="button" className="rounded-full border px-3 py-2 text-xs">
          Cross-training
        </button>
        <button type="button" className="rounded-full border px-3 py-2 text-xs">
          Étirements
        </button>
      </div>

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
        <Link href="/guide2/exercices/demo/burpees" className="text-sm underline">
          Burpees
        </Link>
      </div>
    </div>
  );
}
