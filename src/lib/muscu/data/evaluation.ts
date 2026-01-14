import type { EvaluationProfile } from "@/lib/muscu/types";

const INFO_BASE = "/muscu/infographies/evaluation";
const INFO_FILE = "musculation-au-bac.png";

export const evaluationProfiles: EvaluationProfile[] = [
  {
    id: "eval-musculation",
    title: "Evaluation",
    updatedAtISO: "2026-01-12",
    status: "approved",
    profile: "Evaluation",
    sections: [
      {
        title: "Criteres techniques",
        bullets: [
          "Execution precise, securisee.",
          "Respiration adaptee a l effort.",
        ],
      },
      {
        title: "Criteres d efficacite",
        bullets: [
          "Respect du projet annonce.",
          "Capacite a tenir le volume demande.",
        ],
      },
    ],
    infographics: [`${INFO_BASE}/${INFO_FILE}`],
  },
];
