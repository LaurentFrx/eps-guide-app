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
        "flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 text-amber-600" />
      <span>{mockWarning}</span>
    </div>
  );
};
