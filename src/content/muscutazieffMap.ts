export type MuscuSection = {
  slug: string;
  route: string;
  title: string;
  subtitle?: string;
  accent: string;
  variant?: "light" | "pill";
  startPage: number;
  endPage: number;
};

export type MuscuGroup = {
  id: string;
  title: string;
  description?: string;
  items: MuscuSection[];
};

const makeRoute = (slug: string) => `/guide/${slug}`;

export const MUSCUTAZIEFF_GROUPS: MuscuGroup[] = [
  {
    id: "hub",
    title: "Page d ouverture",
    description: "Repere rapide du PDF Muscu'Tazieff.",
    items: [
      {
        slug: "hub",
        route: makeRoute("hub"),
        title: "Hub Muscu'Tazieff",
        accent: "var(--accent-theme)",
        startPage: 1,
        endPage: 1,
      },
    ],
  },
  {
    id: "themes",
    title: "Les 3 themes",
    description: "Trois logiques pour structurer les cycles.",
    items: [
      {
        slug: "themes/endurance",
        route: makeRoute("themes/endurance"),
        title: "Endurance de force",
        subtitle: "Tonification",
        accent: "var(--accent-theme)",
        startPage: 3,
        endPage: 5,
      },
      {
        slug: "themes/volume",
        route: makeRoute("themes/volume"),
        title: "Gain de volume",
        subtitle: "Hypertrophie",
        accent: "var(--accent-theme)",
        startPage: 6,
        endPage: 9,
      },
      {
        slug: "themes/puissance",
        route: makeRoute("themes/puissance"),
        title: "Gain de puissance",
        subtitle: "Explosivite",
        accent: "var(--accent-theme)",
        startPage: 10,
        endPage: 13,
      },
    ],
  },
  {
    id: "connaissances",
    title: "Connaissances",
    description: "Comprendre les bases utiles sur le terrain.",
    items: [
      {
        slug: "connaissances/securite",
        route: makeRoute("connaissances/securite"),
        title: "Principes securitaires",
        accent: "var(--accent-eval)",
        variant: "pill",
        startPage: 14,
        endPage: 15,
      },
      {
        slug: "connaissances/rm-rir-rpe",
        route: makeRoute("connaissances/rm-rir-rpe"),
        title: "RM / RIR / RPE",
        accent: "var(--accent-knowledge)",
        variant: "light",
        startPage: 16,
        endPage: 16,
      },
      {
        slug: "connaissances/muscles",
        route: makeRoute("connaissances/muscles"),
        title: "Muscles et fonctionnement",
        accent: "var(--accent-knowledge)",
        variant: "light",
        startPage: 17,
        endPage: 18,
      },
      {
        slug: "connaissances/methodes-overview",
        route: makeRoute("connaissances/methodes-overview"),
        title: "Methodes d entrainement",
        accent: "var(--accent-knowledge)",
        variant: "light",
        startPage: 19,
        endPage: 21,
      },
    ],
  },
  {
    id: "methodes",
    title: "Methodes",
    description: "Protocoles et formats pour varier les seances.",
    items: [
      {
        slug: "methodes/superset",
        route: makeRoute("methodes/superset"),
        title: "Super set",
        accent: "var(--accent-process)",
        startPage: 22,
        endPage: 22,
      },
      {
        slug: "methodes/drop-set",
        route: makeRoute("methodes/drop-set"),
        title: "Drop set",
        accent: "var(--accent-process)",
        startPage: 23,
        endPage: 23,
      },
      {
        slug: "methodes/serie-brulante",
        route: makeRoute("methodes/serie-brulante"),
        title: "Serie brulante",
        accent: "var(--accent-process)",
        startPage: 24,
        endPage: 24,
      },
      {
        slug: "methodes/rest-pause",
        route: makeRoute("methodes/rest-pause"),
        title: "Rest pause",
        accent: "var(--accent-process)",
        startPage: 25,
        endPage: 25,
      },
      {
        slug: "methodes/triple-tri-set",
        route: makeRoute("methodes/triple-tri-set"),
        title: "Triple tri set",
        accent: "var(--accent-process)",
        startPage: 26,
        endPage: 26,
      },
      {
        slug: "methodes/circuit-training",
        route: makeRoute("methodes/circuit-training"),
        title: "Circuit training",
        accent: "var(--accent-process)",
        startPage: 27,
        endPage: 27,
      },
      {
        slug: "methodes/defi-centurion",
        route: makeRoute("methodes/defi-centurion"),
        title: "Defi Centurion",
        accent: "var(--accent-process)",
        startPage: 28,
        endPage: 28,
      },
      {
        slug: "methodes/aps",
        route: makeRoute("methodes/aps"),
        title: "APS",
        accent: "var(--accent-process)",
        startPage: 31,
        endPage: 31,
      },
      {
        slug: "methodes/emom",
        route: makeRoute("methodes/emom"),
        title: "EMOM",
        accent: "var(--accent-process)",
        startPage: 32,
        endPage: 32,
      },
      {
        slug: "methodes/amrap",
        route: makeRoute("methodes/amrap"),
        title: "AMRAP",
        accent: "var(--accent-process)",
        startPage: 33,
        endPage: 33,
      },
      {
        slug: "methodes/pre-activation",
        route: makeRoute("methodes/pre-activation"),
        title: "Pre-activation",
        accent: "var(--accent-process)",
        startPage: 34,
        endPage: 34,
      },
      {
        slug: "methodes/pyramidal-fiche",
        route: makeRoute("methodes/pyramidal-fiche"),
        title: "Pyramidal fiche",
        accent: "var(--accent-process)",
        startPage: 35,
        endPage: 35,
      },
      {
        slug: "methodes/wall-ball",
        route: makeRoute("methodes/wall-ball"),
        title: "Wall ball",
        accent: "var(--accent-process)",
        startPage: 38,
        endPage: 38,
      },
    ],
  },
  {
    id: "projets",
    title: "Projets specifiques",
    description: "Focus terrain et sports collectifs.",
    items: [
      {
        slug: "projets/detente-verticale",
        route: makeRoute("projets/detente-verticale"),
        title: "Detente verticale",
        accent: "var(--accent-projects)",
        startPage: 29,
        endPage: 29,
      },
      {
        slug: "projets/vitesse-agilite",
        route: makeRoute("projets/vitesse-agilite"),
        title: "Vitesse & agilite",
        subtitle: "Sports co",
        accent: "var(--accent-projects)",
        startPage: 30,
        endPage: 30,
      },
    ],
  },
  {
    id: "demarche",
    title: "Demarche & evaluation",
    description: "Competences, niveaux et bilan.",
    items: [
      {
        slug: "demarche/spiralaire",
        route: makeRoute("demarche/spiralaire"),
        title: "Competences attendues",
        subtitle: "Demarche spiralaire",
        accent: "var(--accent-process)",
        startPage: 2,
        endPage: 2,
      },
      {
        slug: "evaluation/seconde",
        route: makeRoute("evaluation/seconde"),
        title: "Evaluation 2nde",
        accent: "var(--accent-eval)",
        startPage: 39,
        endPage: 39,
      },
      {
        slug: "evaluation/premiere",
        route: makeRoute("evaluation/premiere"),
        title: "Evaluation 1ere",
        accent: "var(--accent-eval)",
        startPage: 40,
        endPage: 40,
      },
      {
        slug: "evaluation/terminale",
        route: makeRoute("evaluation/terminale"),
        title: "Evaluation terminale",
        accent: "var(--accent-eval)",
        startPage: 41,
        endPage: 41,
      },
      {
        slug: "evaluation/certificative",
        route: makeRoute("evaluation/certificative"),
        title: "Evaluation certificative",
        accent: "var(--accent-eval)",
        startPage: 42,
        endPage: 42,
      },
    ],
  },
];

export const MUSCUTAZIEFF_SECTIONS: MuscuSection[] = MUSCUTAZIEFF_GROUPS.flatMap(
  (group) => group.items
);

const sectionsBySlug = new Map(
  MUSCUTAZIEFF_SECTIONS.map((section) => [section.slug, section])
);

export const getMuscutazieffSection = (slug: string) =>
  sectionsBySlug.get(slug);
