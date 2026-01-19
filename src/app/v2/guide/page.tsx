import { PDF_INDEX } from "@/data/pdfIndex";
import { getGuideData } from "@/lib/editorial";
import GuideView from "./GuideView";

const SESSION_IDS = ["S1", "S2", "S3", "S4", "S5"] as const;

export default function GuidePage() {
  const guide = getGuideData();
  const counts = SESSION_IDS.reduce<Record<string, number>>((acc, id) => {
    acc[id] = 0;
    return acc;
  }, {});

  for (const item of PDF_INDEX) {
    if (item.series in counts) {
      counts[item.series] += 1;
    }
  }

  return <GuideView guide={guide} counts={counts} />;
}
