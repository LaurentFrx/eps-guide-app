#!/usr/bin/env node
/* eslint-disable no-console */
import { exercises } from "../src/lib/exercises";
import { getExercise } from "../src/lib/exercise-data";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";
import { getExerciseStatus, isExerciseDetailReady } from "../src/lib/exerciseStatus";

type Issue = {
  code: string;
  reason: string;
};

async function main() {
  const issues: Issue[] = [];
  let readyCount = 0;
  let draftCount = 0;

  for (const exercise of exercises) {
    const normalized = normalizeExerciseCode(exercise.id);
    if (!isValidExerciseCode(normalized)) {
      issues.push({ code: exercise.id, reason: "invalid exercise code format" });
      continue;
    }

    const status = getExerciseStatus({ id: exercise.id, image: exercise.image });
    if (status === "ready") {
      readyCount += 1;
      const detail = getExercise(normalized);
      if (!detail) {
        issues.push({ code: normalized, reason: "ready but missing detail entry" });
        continue;
      }
      if (!isExerciseDetailReady(detail)) {
        issues.push({ code: normalized, reason: "ready but missing required fields" });
      }
    } else {
      draftCount += 1;
    }
  }

  if (issues.length > 0) {
    console.error("check-exercises: failed");
    issues.forEach((issue) => {
      console.error(`- ${issue.code}: ${issue.reason}`);
    });
    process.exit(1);
  }

  console.log(`check-exercises: ok (${readyCount} ready, ${draftCount} draft)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
