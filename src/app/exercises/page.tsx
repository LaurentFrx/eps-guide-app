import Link from "next/link";
import Image from "next/image";
import { sessions } from "@/lib/exercises";

export const revalidate = 60;

export default async function ExercicesPage(props: unknown) {
  const { searchParams } = props as {
    searchParams?: { from?: string } | Promise<{ from?: string }>;
  };
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const rawFrom = resolvedSearchParams?.from;
  const safeFrom = typeof rawFrom === "string" && rawFrom.startsWith("/") ? rawFrom : "";

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Exercices</h1>
        <p className="text-sm text-white/70">Parcours image-first des 5 sessions du guide.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <article key={s.id} className="ui-card overflow-hidden">
            <Link
              href={
                safeFrom
                  ? `/exercises/${s.id}?from=${encodeURIComponent(safeFrom)}`
                  : `/exercises/${s.id}`
              }
              className="block"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={s.heroImage}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized={s.heroImage.toLowerCase().endsWith(".svg")}
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-medium">{s.title}</h2>
                <p className="text-xs text-white/60">{s.subtitle}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-white/75">{s.exerciseCount} exercices</span>
                  <button className="ui-btn-primary px-3 py-1 text-sm">Voir les exercices</button>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
