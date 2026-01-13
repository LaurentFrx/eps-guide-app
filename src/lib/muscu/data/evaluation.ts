import type { EvaluationProfile } from "@/lib/muscu/types";

export const evaluationProfiles: EvaluationProfile[] = [
  {
    id: "eval-bac-lgt",
    title: "Bac LGT",
    updatedAtISO: "2026-01-12",
    status: "approved",
    profile: "Bac LGT",
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
  {
    id: "eval-bac-pro",
    title: "Bac Pro",
    updatedAtISO: "2026-01-12",
    status: "approved",
    profile: "Bac Pro",
    sections: [
      {
        title: "Criteres techniques",
        bullets: ["Postures solides", "Respect des consignes"],
      },
      {
        title: "Criteres d engagement",
        bullets: ["Regularite", "Gestion de l effort"],
      },
    ],
    infographics: ["/muscu/infographies/evaluation/musculation-au-bac.png"],
  },
  {
    id: "eval-cap",
    title: "CAP",
    updatedAtISO: "2026-01-12",
    status: "approved",
    profile: "CAP",
    sections: [
      {
        title: "Criteres techniques",
        bullets: ["Execution securisee", "Cadence stable"],
      },
      {
        title: "Criteres d autonomie",
        bullets: ["Connaissance des charges", "Respect du protocole"],
      },
    ],
    infographics: ["/muscu/infographies/evaluation/musculation-au-bac.png"],
  },
  {
    id: "eval-seconde-cap",
    title: "Seconde/CAP",
    updatedAtISO: "2026-01-12",
    status: "draft",
    profile: "Seconde/CAP",
    sections: [
      {
        title: "Criteres techniques",
        bullets: ["Apprentissage des gestes", "Posture stable"],
      },
      {
        title: "Criteres d engagement",
        bullets: ["Participation active", "Ecoute des consignes"],
      },
    ],
    infographics: ["/muscu/infographies/evaluation/musculation-au-bac.png"],
  },
  {
    id: "eval-premiere-cap",
    title: "Premiere/CAP",
    updatedAtISO: "2026-01-12",
    status: "draft",
    profile: "Première/CAP",
    sections: [
      {
        title: "Criteres techniques",
        bullets: ["Stabilite", "Gestion des amplitudes"],
      },
      {
        title: "Criteres d autonomie",
        bullets: ["Preparation du materiel", "Respect de la securite"],
      },
    ],
    infographics: ["/muscu/infographies/evaluation/musculation-au-bac.png"],
  },
];
