import { notFound } from "next/navigation";
import { SessionView } from "@/components/SessionView";
import { getMergedSession } from "@/lib/exercises/merged";
import type { SessionId } from "@/lib/editorial/sessions";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num } = await params;
  const numValue = Number(num);
  const sessionId = Number.isNaN(numValue) ? null : (`S${numValue}` as SessionId);
  const session = sessionId ? await getMergedSession(sessionId) : null;

  if (!session) {
    notFound();
  }

  return <SessionView session={session} />;
}
