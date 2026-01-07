import { getExerciseStats } from "../src/lib/stats";

const expected = {
  sessionsCount: 5,
  totalExercises: 70,
  bySeries: {
    S1: 10,
    S2: 15,
    S3: 20,
    S4: 15,
    S5: 10,
  },
};

const stats = getExerciseStats();
const errors: string[] = [];

if (stats.sessionsCount !== expected.sessionsCount) {
  errors.push(
    `sessionsCount=${stats.sessionsCount} (expected ${expected.sessionsCount})`
  );
}

if (stats.totalExercises !== expected.totalExercises) {
  errors.push(
    `totalExercises=${stats.totalExercises} (expected ${expected.totalExercises})`
  );
}

const mismatches = Object.entries(expected.bySeries).filter(
  ([key, value]) => stats.bySeries[key as keyof typeof stats.bySeries] !== value
);
if (mismatches.length) {
  errors.push(
    `bySeries mismatch: ${mismatches
      .map(
        ([key, value]) =>
          `${key}=${stats.bySeries[key as keyof typeof stats.bySeries]} (expected ${value})`
      )
      .join(", ")}`
  );
}

if (errors.length) {
  console.error("Exercise stats check failed:");
  errors.forEach((line) => console.error(`- ${line}`));
  process.exit(1);
}

console.log("Exercise stats check passed.");
