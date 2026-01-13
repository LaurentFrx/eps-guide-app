import type { Infographic } from "@/lib/muscu/types";
import rawInfographics from "@/lib/muscu/muscuInfographics.json";

export type MuscuInfographic = Infographic & { section: string };

const muscuInfographics: MuscuInfographic[] = rawInfographics.map((item) => ({
  id: item.id,
  title: item.title,
  section: item.section,
  src: item.imageSrc,
  alt: item.alt,
}));

const isEvaluationInfographic = (item: MuscuInfographic) =>
  item.src.includes("/evaluation/");

const groupBySection = (items: MuscuInfographic[]) =>
  items.reduce<Record<string, MuscuInfographic[]>>((acc, item) => {
    const list = acc[item.section] ?? [];
    list.push(item);
    acc[item.section] = list;
    return acc;
  }, {});

export const knowledgeInfographics = muscuInfographics.filter(
  (item) => !isEvaluationInfographic(item)
);
export const evaluationInfographics = muscuInfographics.filter(
  isEvaluationInfographic
);

export const knowledgeInfographicsBySection = groupBySection(knowledgeInfographics);
export const evaluationInfographicsBySection =
  groupBySection(evaluationInfographics);

export { muscuInfographics };
