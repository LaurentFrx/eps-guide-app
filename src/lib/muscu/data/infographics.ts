import type { Infographic } from "@/lib/muscu/types";
import rawInfographics from "@/lib/muscu/muscuInfographics.json";

export type MuscuInfographic = Infographic & { section: string };

type RawInfographic = {
  id: string;
  title: string;
  section: string;
  imageDir: string;
  imageFile: string;
  alt: string;
};

const buildSrc = (dir: string, file: string) =>
  `${dir.replace(/\/$/, "")}/${file}`;

const muscuInfographics: MuscuInfographic[] = (rawInfographics as RawInfographic[]).map(
  (item) => ({
    id: item.id,
    title: item.title,
    section: item.section,
    src: buildSrc(item.imageDir, item.imageFile),
    alt: item.alt,
  })
);

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
