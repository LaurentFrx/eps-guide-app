import { PDF_INDEX } from "@/data/pdfIndex";
import { normalizeExerciseCode } from "@/lib/exerciseCode";

export type ExerciseStats = {
  totalExercises: number;
  sessionsCount: number;
  bySeries: Record<"S1" | "S2" | "S3" | "S4" | "S5", number>;
};

const EMPTY_SERIES: ExerciseStats["bySeries"] = {
  S1: 0,
  S2: 0,
  S3: 0,
  S4: 0,
  S5: 0,
};

export const getExerciseStats = (): ExerciseStats => {
  const bySeries = { ...EMPTY_SERIES };
  for (const entry of PDF_INDEX) {
    const series =
      (entry.series as keyof ExerciseStats["bySeries"]) ??
      (normalizeExerciseCode(entry.code).slice(0, 2) as keyof ExerciseStats["bySeries"]);
    if (series in bySeries) {
      bySeries[series] += 1;
    }
  }

  const totalExercises = Object.values(bySeries).reduce(
    (sum, count) => sum + count,
    0
  );

  return {
    totalExercises,
    sessionsCount: Object.keys(bySeries).length,
    bySeries,
  };
};
