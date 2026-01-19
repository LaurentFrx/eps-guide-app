import Link from "next/link";

export default function EntrainementPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">S’entraîner</h1>
      <div className="flex flex-col gap-2">
        <Link
          href="/guide2/entrainement/endurance"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Endurance
        </Link>
        <Link
          href="/guide2/entrainement/volume"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Volume
        </Link>
        <Link
          href="/guide2/entrainement/puissance"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Puissance
        </Link>
      </div>
      <Link
        href="/guide2/entrainement/anatomie"
        className="rounded-md border px-3 py-2 text-sm"
      >
        Anatomie & contractions
      </Link>
    </div>
  );
}
