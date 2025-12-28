import { notFound } from "next/navigation";
import { SessionView } from "@/components/SessionView";
import { getSession } from "@/lib/exercise-data";

export default function SessionPage({
  params,
}: {
  params: { num: string };
}) {
  const num = Number(params.num);
  const session = Number.isNaN(num) ? null : getSession(num);

  if (!session) {
    notFound();
  }

  return <SessionView session={session} />;
}
