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
        slug: "connaissances/muscles",
        route: makeRoute("connaissances/muscles"),
        title: "Muscles et fonctionnement",
        accent: "var(--accent-knowledge)",
        variant: "light",
        startPage: 17,
        endPage: 18,
      },
      {
        slug: "connaissances/methodes",
        route: makeRoute("connaissances/methodes"),
        title: "Methodes d entrainement",
        accent: "var(--accent-knowledge)",
        variant: "light",
        startPage: 19,
        endPage: 21,
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
        slug: "securite",
        route: makeRoute("securite"),
        title: "Principes securitaires",
        accent: "var(--accent-eval)",
        variant: "pill",
        startPage: 14,
        endPage: 15,
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
        startPage: 22,
        endPage: 24,
      },
      {
        slug: "projets/vitesse-agilite",
        route: makeRoute("projets/vitesse-agilite"),
        title: "Vitesse & agilite",
        subtitle: "Sports co",
        accent: "var(--accent-projects)",
        startPage: 25,
        endPage: 27,
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

export const getMuscutazieffSection = (slug: string) => sectionsBySlug.get(slug);
