import Link from "next/link";

export default function EntrainementPage() {
  return (
    <div className="space-y-4">
      <h1>S’entraîner</h1>
      <div className="flex flex-col gap-2">
        <Link
          className="inline-flex w-fit rounded border px-3 py-2"
          href="/guide/entrainement/endurance"
        >
          Endurance
        </Link>
        <Link
          className="inline-flex w-fit rounded border px-3 py-2"
          href="/guide/entrainement/volume"
        >
          Volume
        </Link>
        <Link
          className="inline-flex w-fit rounded border px-3 py-2"
          href="/guide/entrainement/puissance"
        >
          Puissance
        </Link>
      </div>
      <Link
        className="inline-flex w-fit rounded border px-3 py-2"
        href="/guide/entrainement/anatomie"
      >
        Anatomie & contractions
      </Link>
    </div>
  );
}