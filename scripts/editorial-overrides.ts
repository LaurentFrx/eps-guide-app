type EditorialFields = {
  materielMd: string;
  consignesMd: string;
  dosageMd: string;
  securiteMd: string;
  detailMd: string;
  fullMdRaw: string;
  complementsMd: string;
  auditSummaryMd: string;
};

type EditorialOverride = Partial<EditorialFields>;

const OVERRIDES: Record<string, EditorialOverride> = {
  "S1-09": {
    securiteMd:
      "- Déconseillé en cas de syndromes fémoro-patellaires ou psoïtis : la forte contraction du psoas peut majorer la douleur.\n- Manque de force ou bras courts : utiliser parallettes/blocks pour rehausser les mains et donner de l’espace.\n- Raideur ischio-jambiers : garder une légère flexion des genoux au départ.\n- Douleur d’épaule en appui prolongé : vérifier la dépression scapulaire et utiliser des barres basses.\n- Variante adaptée : chaise romaine (dips station) pour réduire la sollicitation lombaire avec soutien du dos (ce n’est plus un L-Sit libre).",
  },
  "S4-02": {
    securiteMd: "Aucun",
  },
  "S4-04": {
    dosageMd: "3x10 pas par jambe.",
  },
  "S2-08": {
    securiteMd:
      "- Eviter en cas de lombalgie aigue ou de hernie discale : flexion/rotation repetee a risque.\n- Douleurs cervicales : garder la nuque neutre, ne pas tirer sur la tete.\n- Si le bas du dos se decolle, reduire l'amplitude ou ralentir.",
  },
  "S5-02": {
    consignesMd:
      "- Depuis debout, descendre en squat puis poser les mains au sol.\n- Passer en planche sans la phase pompe, gainage serre.\n- Ramener les pieds pres des mains, remonter en squat puis sauter (ou se lever sur pointes).\n- Amortir la reception et garder le dos neutre tout au long du mouvement.",
    dosageMd:
      "3 a 4 series de 8 a 12 repetitions, repos 45 a 90 s selon l'intensite.",
    securiteMd:
      "- Trop intense pour debutants sedentaires : fractionner les phases et supprimer le saut au debut.\n- Eviter en cas de douleurs articulaires severes (genoux, poignets, epaules) ou hypertension non controlee.\n- Arreter si perte d'alignement ou essoufflement excessif.",
    detailMd:
      "Description anatomique : Variante du burpee sans pompe. Le mouvement enchaine squat -> planche -> squat -> saut, avec une sollicitation cardio globale et moins de charge sur pectoraux/triceps.\n\nObjectifs fonctionnels : Conditionnement metabolique avec coordination et gainage, tout en reduisant la difficulte du haut du corps.\n\nProgressions / regressions : Regression = sans saut et retour en marchant en planche. Progression = ajouter la pompe, augmenter le rythme, ou sauter sur box.\n\nDosage recommande : 3 a 4 series de 8 a 12 repetitions, repos 45 a 90 s selon l'intensite.",
    fullMdRaw:
      "Burpee sans pompe : squat -> planche -> squat -> saut. Variante cardio globale avec moindre charge sur le haut du corps.",
    complementsMd: "",
  },
  "S5-07": {
    consignesMd:
      "- Hanche en charniere, dos neutre, genoux legerement flechis.\n- Garder les haltères proches des jambes et controler la descente.\n- Remonter en poussant les hanches, sans arrondir le dos.",
    dosageMd: "3 a 4 series de 8 a 12 repetitions, repos 60 a 90 s.",
  },
  "S5-08": {
    consignesMd:
      "- Descendre en squat complet, puis lancer le medecine-ball vers la cible.\n- Attraper le ballon en redescendant et enchaîner sans perdre le gainage.\n- Garder les talons au sol et amortir la reception.",
    dosageMd: "3 a 4 series de 10 a 15 repetitions, repos 60 s.",
  },
};

export const applyEditorialOverrides = (
  editorialByCode: Record<string, EditorialFields>,
  sanitize: (value: string, code: string) => string
) => {
  Object.entries(OVERRIDES).forEach(([code, overrides]) => {
    const entry = editorialByCode[code];
    if (!entry) return;
    Object.entries(overrides).forEach(([field, value]) => {
      const key = field as keyof EditorialFields;
      const nextValue = value == null ? "" : sanitize(String(value), code);
      entry[key] = nextValue;
    });
  });
};
