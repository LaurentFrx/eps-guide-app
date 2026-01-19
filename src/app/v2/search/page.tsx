import { SearchView } from "@/components/SearchView";

type PageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = sp.q ?? "";
  const initialQuery = typeof q === "string" ? q : undefined;

  return <SearchView initialQuery={initialQuery} />;
}
