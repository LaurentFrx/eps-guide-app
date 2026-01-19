import type { KnowledgeCard } from "@/lib/v3/types";

export const knowledgeSeed: KnowledgeCard[] = [
  {
    id: "k-anat-quadri",
    category: "Anatomie",
    title: "Quadriceps : moteur des extensions",
    contentMd:
      "Le quadriceps (droit fémoral + vastes) est clé sur les squats et presses.\n\n- Pense à pousser le sol avec les talons.\n- Garde le genou dans l’axe des orteils.\n- La profondeur dépend de ta mobilité.",
    relatedExerciseIds: ["squat-barre", "squat-pdc", "presse-cuisses"],
  },
  {
    id: "k-anat-chain-post",
    category: "Anatomie",
    title: "Chaîne postérieure et posture",
    contentMd:
      "Ischios, fessiers et érecteurs du rachis stabilisent la colonne.\n\n- Gainage actif avant chaque rep.\n- Hanches en arrière sur les patterns de hip hinge.\n- Respiration contrôlée pour garder la pression intra-abdominale.",
    relatedExerciseIds: ["souleve-terre", "hip-thrust"],
  },
  {
    id: "k-meth-progress",
    category: "Méthodes",
    title: "Progression de charge maîtrisée",
    contentMd:
      "Augmente la charge quand la technique est stable sur toutes les séries.\n\n- +2,5 kg quand le RPE reste ≤7.\n- Note tes charges dans le carnet.\n- Ne change qu’un paramètre à la fois.",
  },
  {
    id: "k-meth-tempo",
    category: "Méthodes",
    title: "Tempo et temps sous tension",
    contentMd:
      "Le tempo ralentit la descente pour recruter davantage de fibres.\n\n- Exemple : 3 secondes en excentrique.\n- Favorise l’hypertrophie en volume.\n- Garde le contrôle jusqu’au bout.",
  },
  {
    id: "k-nutri-hydra",
    category: "Nutrition",
    title: "Hydratation et performance",
    contentMd:
      "Même en séance courte, l’hydratation influence la qualité des reps.\n\n- Bois avant, pendant, après.\n- Repère la couleur des urines.\n- Évite la déshydratation en été.",
  },
  {
    id: "k-nutri-prot",
    category: "Nutrition",
    title: "Protéines et récupération",
    contentMd:
      "Les protéines aident à réparer les fibres musculaires.\n\n- Objectif lycée : répartir sur la journée.\n- Associer protéines + glucides après séance.\n- Pas besoin de suppléments pour débuter.",
  },
  {
    id: "k-rec-sleep",
    category: "Récupération",
    title: "Sommeil : facteur numéro 1",
    contentMd:
      "La progression passe aussi par la qualité du sommeil.\n\n- 8 h est un repère simple.\n- Évite l’écran juste avant de dormir.\n- Une séance intense demande plus de récup.",
  },
  {
    id: "k-sec-warmup",
    category: "Sécurité",
    title: "Échauffement spécifique",
    contentMd:
      "Un échauffement actif prépare les articulations et limite les risques.\n\n- Mobilité ciblée + activation.\n- 2 séries légères avant le lourd.\n- Priorise les mouvements du thème.",
  },
  {
    id: "k-sec-breath",
    category: "Sécurité",
    title: "Respiration et gainage",
    contentMd:
      "La respiration stabilise le tronc et améliore la force.\n\n- Inspire en descente, expire en poussée.\n- Gainage actif sur toute la série.\n- Évite de bloquer trop longtemps.",
  },
  {
    id: "k-meth-planning",
    category: "Méthodes",
    title: "Planifier sa semaine",
    contentMd:
      "Répartis les séances pour permettre la récupération.\n\n- 48 h entre deux séances similaires.\n- Alterne haut / bas du corps.\n- Note tes séances à l’avance.",
  },
];
