import { sessions, allExercises } from "@/lib/exercise-data";
import { APP_VERSION, BUILD_TIME, COMMIT_REF, COMMIT_SHA } from "@/lib/version";

type BuildStampProps = {
  className?: string;
};

export default function BuildStamp({ className }: BuildStampProps) {
  const short = COMMIT_SHA ? COMMIT_SHA.slice(0, 7) : "local";
  const buildDate = BUILD_TIME ? BUILD_TIME.slice(0, 10) : null;

  return (
    <span className={className}>
      v{APP_VERSION} · Sessions: {sessions.length} · Exercices:{" "}
      {allExercises.length}
      {buildDate ? ` · Build: ${buildDate}` : ""}
      {short ? ` · Commit: ${short}` : ""}
      {COMMIT_REF ? ` · ${COMMIT_REF}` : ""}
    </span>
  );
}
