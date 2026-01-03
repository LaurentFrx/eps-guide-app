import { sessions, exercises } from "@/lib/exercises";

export default function BuildStamp() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const ref = process.env.VERCEL_GIT_COMMIT_REF;
  const short = sha ? sha.slice(0, 7) : "local";

  return (
    <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none mb-[calc(env(safe-area-inset-bottom)+104px)]">
      <div className="text-xs opacity-60 text-center py-1 px-2 bg-transparent">
        Commit: {short}
        {ref ? ` · ${ref}` : ""} · Sessions: {sessions.length} · Exercices: {exercises.length}
      </div>
    </div>
  );
}
