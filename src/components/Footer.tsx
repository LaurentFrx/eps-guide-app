import { getExerciseStats } from "@/lib/stats";
import { APP_VERSION, BUILD_TIME, COMMIT_REF, COMMIT_SHA } from "@/lib/version";
import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  const stats = getExerciseStats();
  const short = COMMIT_SHA ? COMMIT_SHA.slice(0, 7) : null;
  const buildDate = BUILD_TIME ? BUILD_TIME.slice(0, 10) : null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-40 flex justify-center px-4 pointer-events-none",
        className
      )}
    >
      <span className="text-[11px] text-white/60 pointer-events-none">
        v{APP_VERSION} · Sessions: {stats.sessionsCount} · Exercices:{" "}
        {stats.totalExercises}
        {buildDate ? ` · Build: ${buildDate}` : ""}
        {short ? ` · Commit: ${short}` : ""}
        {COMMIT_REF ? ` · ${COMMIT_REF}` : ""}
      </span>
    </div>
  );
}
