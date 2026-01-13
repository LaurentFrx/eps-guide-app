import type { EvaluationProfile } from "@/lib/muscu/types";

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
    infographics: ["/muscu/infographies/evaluation/musculation-au-bac.png"],
  },
];
