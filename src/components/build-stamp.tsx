import { sessions, exercises } from "@/lib/exercises";

type BuildStampProps = {
  className?: string;
};

export default function BuildStamp({ className }: BuildStampProps) {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const ref = process.env.VERCEL_GIT_COMMIT_REF;
  const short = sha ? sha.slice(0, 7) : "local";
  const classes = ["text-xs opacity-60 text-center py-1 px-2 bg-transparent", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      Commit: {short}
      {ref ? ` · ${ref}` : ""} · Sessions: {sessions.length} · Exercices: {exercises.length}
    </div>
  );
}
