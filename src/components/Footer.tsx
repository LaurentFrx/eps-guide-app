"use client";

import { useEffect, useMemo, useState } from "react";
import { getExerciseStats } from "@/lib/stats";
import { APP_VERSION, BUILD_TIME, COMMIT_REF, COMMIT_SHA } from "@/lib/version";
import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

type VersionPayload = {
  version: string;
  commitSha?: string;
  commitRef?: string;
  buildTime?: string | null;
};

export default function Footer({ className }: FooterProps) {
  const stats = useMemo(() => getExerciseStats(), []);
  const fallback = useMemo<VersionPayload>(
    () => ({
      version: APP_VERSION,
      commitSha: COMMIT_SHA ?? "unknown",
      commitRef: COMMIT_REF ?? "",
      buildTime: BUILD_TIME ?? null,
    }),
    []
  );
  const [runtime, setRuntime] = useState<VersionPayload>(fallback);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as VersionPayload;
        if (!mounted) return;
        setRuntime({ ...fallback, ...payload });
      } catch {
        // fallback stays in place
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fallback]);

  const short = runtime.commitSha ? runtime.commitSha.slice(0, 7) : null;
  const buildDate = runtime.buildTime ? runtime.buildTime.slice(0, 10) : null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-40 flex justify-center px-4 pointer-events-none",
        className
      )}
    >
      <span className="text-[11px] text-white/60 pointer-events-none">
        v{runtime.version} ú Sessions: {stats.sessionsCount} ú Exercices:{" "}
        {stats.totalExercises}
        {buildDate ? ` ú Build: ${buildDate}` : ""}
        {short ? ` ú Commit: ${short}` : ""}
        {runtime.commitRef ? ` ú ${runtime.commitRef}` : ""}
      </span>
    </div>
  );
}
