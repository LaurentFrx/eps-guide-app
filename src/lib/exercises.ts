export type Session = {
  id: "S1" | "S2" | "S3" | "S4" | "S5";
  title: string;
  subtitle: string;
  exerciseCount: number;
  accent: string; // CSS color token or hex
  heroImage: string; // public path
  reperePedagogiques: string[];
};

export type Exercise = {
  id: string;
  sessionId: Session["id"];
  title: string;
  subtitleEn?: string;
  level:
    | "Débutant"
    | "Débutant-Intermédiaire"
    | "Intermédiaire"
    | "Intermédiaire-Avancé"
    | "Avancé"
    | "Très avancé";
  image: string;
  objectif: string;
  materiel: string;
  anatomie: { muscles: string; fonction: string };
  techniquePoints: string[];
  securitePoints: string[];
  progression: { regression: string; progression: string };
  dosage: string;
};

export const sessions: Session[] = [
  {
    id: "S1",
    title: "Préparation générale",
    subtitle: "S1 — Mobilité, gainage et maîtrise du mouvement",
    exerciseCount: 10,
    accent: "var(--s1)",
    heroImage: "/exercises/S1/hero.jpg",
    reperePedagogiques: [
      "Posture active",
      "Respiration maîtrisée",
      "Alignement segmentaire",
    ],
  },
  {
    id: "S2",
    title: "Force et explosivité",
    subtitle: "S2 — Travail de poussée, tirage et saut",
    exerciseCount: 15,
    accent: "var(--s2)",
    heroImage: "/exercises/S2/hero.jpg",
    reperePedagogiques: ["Chaîne musculaire du membre supérieur", "Appui podal"],
  },
  {
    id: "S3",
    title: "Endurance et enchaînements",
    subtitle: "S3 — Cardio, circuit et rythme",
    exerciseCount: 20,
    accent: "var(--s3)",
    heroImage: "/exercises/S3/hero.jpg",
    reperePedagogiques: ["Gestion de l'effort", "Rythme et récupération"],
  },
  {
    id: "S4",
    title: "Coordination et agilité",
    subtitle: "S4 — Change of direction, équilibre",
    exerciseCount: 15,
    accent: "var(--s4)",
    heroImage: "/exercises/S4/hero.jpg",
    reperePedagogiques: ["Contrôle sensoriel", "Changement d'appui"],
  },
  {
    id: "S5",
    title: "Performance avancée",
    subtitle: "S5 — Puissance et situations complexes",
    exerciseCount: 10,
    accent: "var(--s5)",
    heroImage: "/exercises/S5/hero.jpg",
    reperePedagogiques: ["Analyse technique", "Automatisation"],
  },
];

// Real S1 exercises (10 examples)
const s1Exercises: Exercise[] = [
  {
    id: "S1-01",
    sessionId: "S1",
    title: "Planche coudes",
    level: "Débutant",
    image: "/exercises/S1/S1-01.jpg",
    objectif: "Renforcer la sangle abdominale et stabiliser la colonne.",
    materiel: "Tapis",
    anatomie: { muscles: "Grand droit, transverses, obliques", fonction: "Stabilisation du tronc" },
    techniquePoints: ["Aligner tête/tronc/pieds", "Ne pas cambrer le bas du dos"],
    securitePoints: ["Ne pas retenir la respiration", "Arrêter si douleur lombaire"],
    progression: { regression: "Planche genoux", progression: "Planche latérale / lever jambe" },
    dosage: "3 x 30s à 60s selon niveau",
  },
  {
    id: "S1-02",
    sessionId: "S1",
    title: "Pont fessier",
    level: "Débutant-Intermédiaire",
    image: "/exercises/S1/S1-02.jpg",
    objectif: "Activer et renforcer les fessiers et l'arrière des cuisses.",
    materiel: "Tapis",
    anatomie: { muscles: "Grand fessier, ischio-jambiers", fonction: "Extension de la hanche" },
    techniquePoints: ["Pousser avec les talons", "Ne pas cambrer la colonne"],
    securitePoints: ["Contrôler le bassin", "Ne pas forcer le cou"],
    progression: { regression: "Pont unilatéral assisté", progression: "Pont sur une jambe" },
    dosage: "3 x 10-15 répétitions",
  },
  {
    id: "S1-03",
    sessionId: "S1",
    title: "Squat au poids du corps",
    level: "Débutant",
    image: "/exercises/S1/S1-03.jpg",
    objectif: "Améliorer la mobilité de hanche et la force des cuisses.",
    materiel: "Aucun",
    anatomie: { muscles: "Quadriceps, fessiers", fonction: "Flexion/extension du genou" },
    techniquePoints: ["Pousser les genoux vers l'extérieur", "Regarder vers l'avant"],
    securitePoints: ["Genou aligné pied", "Descendre selon mobilité"],
    progression: { regression: "Squat partiel", progression: "Squat saut" },
    dosage: "3 x 12-15",
  },
  {
    id: "S1-04",
    sessionId: "S1",
    title: "Fente avant",
    level: "Intermédiaire",
    image: "/exercises/S1/S1-04.jpg",
    objectif: "Travail unilatéral pour équilibre et force des membres inférieurs.",
    materiel: "Aucun / haltères optionnel",
    anatomie: { muscles: "Quadriceps, ischios, fessiers", fonction: "Stabilisation et propulsion" },
    techniquePoints: ["Genou avant aligné", "Tronc droit"],
    securitePoints: ["Ne pas laisser le genou dépasser trop loin", "Contrôler descente"],
    progression: { regression: "Fente statique", progression: "Fente saut" },
    dosage: "3 x 8-12 par jambe",
  },
  {
    id: "S1-05",
    sessionId: "S1",
    title: "Oiseau-chien",
    level: "Débutant",
    image: "/exercises/S1/S1-05.jpg",
    objectif: "Renforcer stabilité lombopelvienne et coordination.",
    materiel: "Tapis",
    anatomie: { muscles: "Erecteurs du rachis, fessiers", fonction: "Extension du tronc et contrôle postural" },
    techniquePoints: ["Mouvement lent et contrôlé", "Ne pas cambrer"],
    securitePoints: ["Maintenir la neutralité rachidienne"],
    progression: { regression: "Lever une seule extrémité", progression: "Ajouter contraction isométrique" },
    dosage: "3 x 8-10 par côté",
  },
  {
    id: "S1-06",
    sessionId: "S1",
    title: "Rowing inversé (TRX ou barre)",
    level: "Intermédiaire",
    image: "/exercises/S1/S1-06.jpg",
    objectif: "Renforcer les muscles du dos et scapulaires.",
    materiel: "TRX / barre fixe",
    anatomie: { muscles: "Grand dorsal, rhomboïdes", fonction: "Rétraction scapulaire" },
    techniquePoints: ["Épaules basses", "Traction avec le dos"],
    securitePoints: ["Ne pas tirer avec les bras uniquement"],
    progression: { regression: "Rowing incliné", progression: "Rowing pieds surélevés" },
    dosage: "3 x 8-12",
  },
  {
    id: "S1-07",
    sessionId: "S1",
    title: "Pompes genoux",
    level: "Débutant-Intermédiaire",
    image: "/exercises/S1/S1-07.jpg",
    objectif: "Travail de poussée et stabilisation du tronc.",
    materiel: "Tapis",
    anatomie: { muscles: "Pectoraux, triceps, deltoïdes antérieurs", fonction: "Poussée du membre supérieur" },
    techniquePoints: ["Corps aligné", "Amplitude contrôlée"],
    securitePoints: ["Ne pas cambrer le dos"],
    progression: { regression: "Pompes murales", progression: "Pompes classiques" },
    dosage: "3 x 8-15",
  },
  {
    id: "S1-08",
    sessionId: "S1",
    title: "Montée de genoux dynamique",
    level: "Intermédiaire",
    image: "/exercises/S1/S1-08.jpg",
    objectif: "Éveil cardio et coordination jambes/bras.",
    materiel: "Aucun",
    anatomie: { muscles: "Fléchisseurs de la hanche", fonction: "Mobilité et cadence" },
    techniquePoints: ["Mouvement rythmé", "Rythme respiratoire"],
    securitePoints: ["Contrôler impact si tendon sensible"],
    progression: { regression: "Montée modérée", progression: "Montée rapide sur 30s" },
    dosage: "4 x 30s",
  },
  {
    id: "S1-09",
    sessionId: "S1",
    title: "Squat isométrique contre mur",
    level: "Débutant",
    image: "/exercises/S1/S1-09.jpg",
    objectif: "Renforcement statique des cuisses et endurance musculaire.",
    materiel: "Mur",
    anatomie: { muscles: "Quadriceps", fonction: "Maintien en flexion" },
    techniquePoints: ["Dos contre le mur", "Respiration régulière"],
    securitePoints: ["Arrêter en cas de douleur genou"],
    progression: { regression: "Assis sur chaise", progression: "Allonger la durée" },
    dosage: "3 x 30-60s",
  },
  {
    id: "S1-10",
    sessionId: "S1",
    title: "Étirements actifs du bas du dos",
    level: "Débutant",
    image: "/exercises/S1/S1-10.jpg",
    objectif: "Récupération et mobilité lombaire.",
    materiel: "Tapis",
    anatomie: { muscles: "Lombaires, fessiers", fonction: "Mobilité segmentaire" },
    techniquePoints: ["Mouvements lents", "Ne pas forcer"],
    securitePoints: ["Arrêter si douleur aiguë"],
    progression: { regression: "Étirements passifs", progression: "Ajout de rotations" },
    dosage: "10 minutes de routine",
  },
];

// Generate placeholders to reach 70 total exercises (we have 10 real S1 -> need 60 more)
const placeholders: Exercise[] = Array.from({ length: 60 }).map((_, i) => {
  const order = [
    "S2","S2","S2","S2","S2",
    "S3","S3","S3","S3","S3","S3","S3","S3","S3","S3",
    "S3","S3","S3","S3","S3","S3",
    "S4","S4","S4","S4","S4","S4","S4","S4","S4",
    "S5","S5","S5","S5","S5","S5","S5","S5","S5","S5",
    "S2","S3","S4","S2","S4","S3","S2","S4","S2","S3",
    "S5","S5","S4","S3","S2","S2","S3","S3","S4","S4",
    "S5","S5","S3","S3","S4","S2","S2","S5"
  ];
  const sid = (order[i % order.length] || "S2") as Exercise["sessionId"];
  const num = String(i + 11).padStart(2, "0");
  return {
    id: `${sid}-${num}`,
    sessionId: sid,
    title: `Contenu à compléter (${sid}-${num})`,
    level: ["Débutant", "Intermédiaire", "Avancé"][i % 3] as Exercise["level"],
    image: `/exercises/${sid}/${sid}-${num}.jpg`,
    objectif: "Contenu à compléter",
    materiel: "Contenu à compléter",
    anatomie: { muscles: "Contenu à compléter", fonction: "Contenu à compléter" },
    techniquePoints: ["Contenu à compléter"],
    securitePoints: ["Contenu à compléter"],
    progression: { regression: "Contenu à compléter", progression: "Contenu à compléter" },
    dosage: "Contenu à compléter",
  } as Exercise;
});

export const exercises: Exercise[] = [...s1Exercises, ...placeholders];

export default exercises;
