import { SearchView } from "@/components/SearchView";

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const initialQuery =
    typeof searchParams?.q === "string" ? searchParams.q : undefined;

  return <SearchView initialQuery={initialQuery} />;
}
