import { getAllExercises } from "@/lib/exercises/index";
import { getGuideData } from "@/lib/editorial";
import GuideView from "./GuideView";

const SESSION_IDS = ["S1", "S2", "S3", "S4", "S5"] as const;

export default function GuidePage() {
  const guide = getGuideData();
  const counts = SESSION_IDS.reduce<Record<string, number>>((acc, id) => {
    acc[id] = 0;
    return acc;
  }, {});

  for (const exercise of getAllExercises()) {
    const sessionId = exercise.code.slice(0, 2).toUpperCase();
    if (sessionId in counts) {
      counts[sessionId] += 1;
    }
  }

  return <GuideView guide={guide} counts={counts} />;
}
