export type SessionId = "S1" | "S2" | "S3" | "S4" | "S5";

export type SessionEditorial = {
  id: SessionId;
  title: string;
  subtitle: string;
  chips: string[];
  introMd: string;
};

export const SESSIONS_EDITORIAL: Record<SessionId, SessionEditorial> = {
  S1: {
    id: "S1",
    title: "Gainage statique",
    subtitle: "Stabilité posturale · alignement · respiration",
    chips: ["Isométrie", "Posture", "Ceinture abdominale"],
    introMd:
      "**Thème :** Renforcement isométrique du tronc pour la stabilité posturale.\n\nLa session 1 regroupe des exercices statiques de gainage sollicitant la ceinture abdominale en contraction isométrique. L’objectif général est d’améliorer l’alignement et la stabilité du tronc, notamment en prévention des douleurs lombaires, grâce à un bon alignement neutre (bassin neutre, colonne longue) et une respiration maîtrisée durant le maintien.\n\nLa progression se fait en augmentant la durée de maintien, le bras de levier (positions plus difficiles) ou l’instabilité (surface mobile).\n\n**Dosage indicatif :** 20 à 60 s par série, en privilégiant toujours la qualité posturale avant la quantité de temps.",
  },
  S2: {
    id: "S2",
    title: "Gainage dynamique & abdominaux",
    subtitle: "Stabilité en mouvement · anti-rotation · contrôle lombo-pelvien",
    chips: ["Dynamique", "Anti-rotation", "Contrôle bassin"],
    introMd:
      "**Thème :** Gainage en mouvement et renforcement abdominal dynamique.\n\nCette session combine des exercices où le tronc doit rester stable malgré des mouvements des membres (anti-extension/anti-rotation dynamiques) et des exercices d’abdominaux avec mouvement (flexions, rotations). L’objectif est d’obtenir un tronc fort **dans le mouvement**, utile aux gestes sportifs et du quotidien.\n\nConsignes globales : contrôler le bassin (éviter les bascules indésirables), prioriser le contrôle plutôt que l’amplitude, respirer sans bloquer.\n\n**Dosage indicatif :** 8–15 répétitions par série, 3–4 séries, récupération 45–90 s.",
  },
  S3: {
    id: "S3",
    title: "Haut du corps — poussée & tirage",
    subtitle: "Pectoraux/Triceps · Dos/Biceps · Épaules",
    chips: ["Poussée", "Tirage", "Stabilité scapulaire"],
    introMd:
      "**Thème :** Renforcement du haut du corps en équilibrant poussées et tirages.\n\nLa session 3 vise la force et l’endurance musculaire du haut du corps, avec un accent sur la stabilité scapulaire (omoplates stables, épaules basses) et le contrôle du tronc pendant l’effort.\n\nProgression : variantes assistées/au poids du corps vers variantes plus techniques ou chargées (incliné → standard → déclinée ; tirage assisté → strict).\n\n**Dosage indicatif :** 6–15 répétitions par série selon l’objectif, en contrôlant la phase excentrique. Repos 60–120 s.",
  },
  S4: {
    id: "S4",
    title: "Bas du corps — squat, fentes & hanche",
    subtitle: "Quadriceps · fessiers · ischios · stabilité",
    chips: ["Squat", "Unilatéral", "Chaîne postérieure"],
    introMd:
      "**Thème :** Renforcement des membres inférieurs (squat, fentes, charnière de hanche) et travail unilatéral.\n\nAccent pédagogique : genoux alignés avec les pieds, poids réparti (souvent talon/milieu), dos neutre et gainé, amplitude adaptée sans douleur.\n\nProgression : poids du corps → charges, bilatéral stable → unilatéral exigeant.\n\n**Dosage indicatif :** 8–15 répétitions, 3–4 séries, repos 60–120 s. Pour la puissance (sauts) : 3–6 reps explosives, repos plus long.",
  },
  S5: {
    id: "S5",
    title: "Exercices fonctionnels & composés",
    subtitle: "Mouvements globaux · intensité · conditionnement",
    chips: ["Polyarticulaire", "Intensité", "Coordination"],
    introMd:
      "**Thème :** Mouvements polyarticulaires complets, souvent enchaînés, combinant force et cardio.\n\nObjectif : conditionnement physique (cardio + force), coordination, transfert fonctionnel. Les exercices sont plus coûteux énergétiquement : priorité à la qualité (technique) avant la vitesse.\n\nProgression : réduire amplitude/charge et découper le mouvement (étapes) avant d’augmenter l’intensité.\n\n**Dosage indicatif :** formats en séries courtes (qualité) ou en intervalles (ex : 20–40 s effort / 20–60 s repos).",
  },
};

export const SESSION_IDS: SessionId[] = ["S1", "S2", "S3", "S4", "S5"];
