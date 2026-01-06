import { SearchView } from "@/components/SearchView";
import { getMergedExercises } from "@/lib/exercises/merged";

type PageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = sp.q ?? "";
  const initialQuery = typeof q === "string" ? q : undefined;
  const exercises = await getMergedExercises();

  return <SearchView initialQuery={initialQuery} exercises={exercises} />;
}
