import { FavoritesView } from "@/components/FavoritesView";
import { getMergedExercises } from "@/lib/exercises/merged";

export default async function FavoritesPage() {
  const exercises = await getMergedExercises();
  return <FavoritesView exercises={exercises} />;
}
