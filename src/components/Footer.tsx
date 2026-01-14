"use client";

import { useEffect, useMemo, useState } from "react";
import { APP_VERSION, COMMIT_SHA } from "@/lib/version";
import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

type VersionPayload = {
  version: string;
  commitSha?: string;
};

export default function Footer({ className }: FooterProps) {
  const fallback = useMemo<VersionPayload>(
    () => ({
      version: APP_VERSION,
      commitSha: COMMIT_SHA ?? "unknown",
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

  const short = runtime.commitSha ? runtime.commitSha.slice(0, 7) : "unknown";
  const displayVersion = runtime.version?.trim() || APP_VERSION;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-40 flex justify-center px-4 pointer-events-none",
        className
      )}
    >
      <span className="pointer-events-none text-[11px] font-medium tracking-wide tabular-nums text-white/60 md:text-xs">
        v{displayVersion} · {short}
      </span>
    </div>
  );
}
