import { notFound } from "next/navigation";
import { SessionView } from "@/components/SessionView";
import { getSession } from "@/lib/exercise-data";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num } = await params;
  const numValue = Number(num);
  const session = Number.isNaN(numValue) ? null : getSession(numValue);

  if (!session) {
    notFound();
  }

  return <SessionView session={session} />;
}
