import { APP_VERSION, BUILD_TIME, COMMIT_REF, COMMIT_SHA } from "@/lib/version";
import { getExerciseStats } from "@/lib/stats";

type BuildStampProps = {
  className?: string;
};

export default function BuildStamp({ className }: BuildStampProps) {
  const stats = getExerciseStats();
  const short = COMMIT_SHA ? COMMIT_SHA.slice(0, 7) : "local";
  const buildDate = BUILD_TIME ? BUILD_TIME.slice(0, 10) : null;

  return (
    <span className={className}>
      v{APP_VERSION} · Sessions: {stats.sessionsCount} · Exercices:{" "}
      {stats.totalExercises}
      {buildDate ? ` · Build: ${buildDate}` : ""}
      {short ? ` · Commit: ${short}` : ""}
      {COMMIT_REF ? ` · ${COMMIT_REF}` : ""}
    </span>
  );
}
