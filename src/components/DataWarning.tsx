import { Info } from "lucide-react";
import { isMockData, mockWarning } from "@/lib/exercise-data";
import { getDocsStatus } from "@/lib/docsStatus";
import { cn } from "@/lib/utils";

export const DataWarning = async ({ className }: { className?: string }) => {
  if (!isMockData) {
    return null;
  }

  const status = await getDocsStatus();
  if (status !== "missing") {
    return null;
  }

  return (
    <div
      className={cn(
        "ui-card flex items-start gap-3 border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 text-amber-200" />
      <span>{mockWarning}</span>
    </div>
  );
};
