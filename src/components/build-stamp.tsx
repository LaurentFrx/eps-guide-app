import { sessions, allExercises } from "@/lib/exercise-data";

type BuildStampProps = {
  className?: string;
};

export default function BuildStamp({ className }: BuildStampProps) {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const ref = process.env.VERCEL_GIT_COMMIT_REF;
  const short = sha ? sha.slice(0, 7) : "local";

  return (
    <span className={className}>
      Commit: {short}
      {ref ? ` · ${ref}` : ""} · Sessions: {sessions.length} · Exercices:{" "}
      {allExercises.length}
    </span>
  );
}
