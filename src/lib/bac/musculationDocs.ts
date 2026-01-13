export type BacMusculationSectionId =
  | "epreuve"
  | "se-preparer"
  | "themes"
  | "methodes"
  | "performance"
  | "ressources-prof";

export type BacMusculationSection = {
  id: BacMusculationSectionId;
  title: string;
  description: string;
};

export type BacMusculationDoc = {
  slug: string;
  title: string;
  sectionId: BacMusculationSectionId;
  tags: string[];
  pdfPath: string;
  summaryMd: string;
};

const summary = (...lines: string[]) => lines.join("\n");

export const BAC_MUSCULATION_SECTIONS: BacMusculationSection[] = [
  {
    id: "epreuve",
    title: "Epreuve",
    description: "Cadre officiel, attendus et points de vigilance.",
  },
  {
    id: "se-preparer",
    title: "Se preparer",
    description: "Organiser la seance et maitriser les parametres clefs.",
  },
  {
    id: "themes",
    title: "Themes",
    description: "Les trois projets: endurance, volume, puissance.",
  },
  {
    id: "methodes",
    title: "Methodes",
    description: "Techniques de travail et variantes d'intensite.",
  },
  {
    id: "performance",
    title: "Performance",
    description: "Qualites physiques et transfers terrain.",
  },
  {
    id: "ressources-prof",
    title: "Ressources prof",
    description: "Cadres pedagogiques et outils d'appui.",
  },
];

const PDF_BASE = "/bac/musculation/pdfs";

export const BAC_MUSCULATION_DOCS: BacMusculationDoc[] = [
  {
    slug: "musculation-au-bac",
    title: "Musculation au bac",
    sectionId: "epreuve",
    tags: ["epreuve", "evaluation", "criteres"],
    pdfPath: `${PDF_BASE}/musculation-au-bac.pdf`,
    summaryMd: summary(
      "- Objectif: comprendre le cadre de l'epreuve de musculation.",
      "- Ce qui est evalue: technique, projet annonce, securite.",
      "- Attendus: autonomie, regles de charge, respect du protocole.",
      "- A preparer: materiel, fiches, echauffement complet.",
      "- Vigilance: execution propre, respiration controlee.",
      "- Conseil terrain: clarifier la consigne avant la serie."
    ),
  },
  {
    slug: "construire-sa-seance",
    title: "Construire sa seance",
    sectionId: "se-preparer",
    tags: ["seance", "organisation", "progression"],
    pdfPath: `${PDF_BASE}/construire-sa-seance.pdf`,
    summaryMd: summary(
      "- Objectif: structurer une seance courte et efficace.",
      "- Etapes: echauffement, corps de seance, retour au calme.",
      "- Charge: partir modere puis ajuster selon la forme du jour.",
      "- Rythme: alterner groupes musculaires pour limiter la fatigue.",
      "- Vigilance: temps de repos respecte, hydratation reguliere.",
      "- Conseil terrain: noter charge, reps, ressenti a la fin."
    ),
  },
  {
    slug: "parametres-3-themes",
    title: "Parametres des 3 themes",
    sectionId: "se-preparer",
    tags: ["parametres", "themes", "planification"],
    pdfPath: `${PDF_BASE}/parametres-3-themes.pdf`,
    summaryMd: summary(
      "- Objectif: distinguer endurance, volume, puissance.",
      "- Variable cle: repetitions, charge, temps de repos.",
      "- Endurance: repetitions elevees, charge moderee.",
      "- Volume: zone 8-12 reps, tempo controle.",
      "- Puissance: repetitions courtes, repos long.",
      "- Vigilance: echauffement specifique avant effort lourd."
    ),
  },
  {
    slug: "projet-endurance-de-force",
    title: "Projet endurance de force",
    sectionId: "themes",
    tags: ["projet", "endurance", "tonification"],
    pdfPath: `${PDF_BASE}/projet-endurance-de-force.pdf`,
    summaryMd: summary(
      "- Objectif: maintenir l'effort sur plusieurs series.",
      "- Reps: 12-20 selon niveau, charge moderee.",
      "- Repos: court a moyen pour garder le rythme.",
      "- Indicateur: technique stable du debut a la fin.",
      "- Vigilance: eviter les compensations quand la fatigue monte.",
      "- Conseil terrain: prioriser amplitude et respiration."
    ),
  },
  {
    slug: "projet-volume",
    title: "Projet volume",
    sectionId: "themes",
    tags: ["projet", "volume", "hypertrophie"],
    pdfPath: `${PDF_BASE}/projet-volume.pdf`,
    summaryMd: summary(
      "- Objectif: stimuler la masse musculaire de facon progressive.",
      "- Reps: 8-12 avec tension continue.",
      "- Repos: 60-90 s pour recuperation partielle.",
      "- Indicateur: charge tenue sur plusieurs series.",
      "- Vigilance: tempo controle pour proteger les articulations.",
      "- Conseil terrain: noter la charge cible par exercice."
    ),
  },
  {
    slug: "projet-puissance",
    title: "Projet puissance",
    sectionId: "themes",
    tags: ["projet", "puissance", "explosivite"],
    pdfPath: `${PDF_BASE}/projet-puissance.pdf`,
    summaryMd: summary(
      "- Objectif: produire un effort rapide et explosif.",
      "- Reps: courtes series, charge moderee.",
      "- Repos: long pour garder la qualite d'execution.",
      "- Indicateur: vitesse d'execution stable.",
      "- Vigilance: arreter si la vitesse chute trop.",
      "- Conseil terrain: echauffement nerveux progressif."
    ),
  },
  {
    slug: "synthese-methodes",
    title: "Synthese des methodes",
    sectionId: "methodes",
    tags: ["methodes", "intensite", "organisation"],
    pdfPath: `${PDF_BASE}/synthese-methodes.pdf`,
    summaryMd: summary(
      "- Objectif: panorama rapide des methodes de travail.",
      "- Role: varier les stimuli sans changer tout le plan.",
      "- Usage: choisir selon l'objectif et la fatigue.",
      "- Indicateur: technique propre sur chaque bloc.",
      "- Vigilance: ne pas accumuler trop de methodes en meme temps.",
      "- Conseil terrain: planifier 1 methode cle par seance."
    ),
  },
  {
    slug: "super-set",
    title: "Super set",
    sectionId: "methodes",
    tags: ["methodes", "superset", "intensite"],
    pdfPath: `${PDF_BASE}/super-set.pdf`,
    summaryMd: summary(
      "- Objectif: enchainer deux exercices sans repos.",
      "- Usage: gagner du temps et augmenter l'intensite.",
      "- Variante: groupes opposés ou meme groupe.",
      "- Indicateur: rythme stable, execution controlee.",
      "- Vigilance: ajuster la charge pour garder la forme.",
      "- Conseil terrain: limiter a 2-3 supersets par seance."
    ),
  },
  {
    slug: "drop-set",
    title: "Drop set",
    sectionId: "methodes",
    tags: ["methodes", "drop-set", "volume"],
    pdfPath: `${PDF_BASE}/drop-set.pdf`,
    summaryMd: summary(
      "- Objectif: prolonger la serie en baissant la charge.",
      "- Usage: finir un exercice avec un stress metabolique.",
      "- Indicateur: dernier bloc encore propre.",
      "- Vigilance: eviter l'echec technique complet.",
      "- Repos: court, juste le temps d'ajuster la charge.",
      "- Conseil terrain: reserver a la derniere serie."
    ),
  },
  {
    slug: "rest-pause",
    title: "Rest-pause",
    sectionId: "methodes",
    tags: ["methodes", "rest-pause", "force"],
    pdfPath: `${PDF_BASE}/rest-pause.pdf`,
    summaryMd: summary(
      "- Objectif: fractionner une serie lourde en mini blocs.",
      "- Usage: recuperations tres courtes (10-20 s).",
      "- Indicateur: maintien de la technique sur chaque reprise.",
      "- Vigilance: ne pas allonger trop les pauses.",
      "- Repos long apres la serie pour repartir propre.",
      "- Conseil terrain: limiter a 1 exercice principal."
    ),
  },
  {
    slug: "serie-brulante",
    title: "Serie brulante",
    sectionId: "methodes",
    tags: ["methodes", "endurance", "intensite"],
    pdfPath: `${PDF_BASE}/serie-brulante.pdf`,
    summaryMd: summary(
      "- Objectif: tenir un effort continu jusqu'a la brulure.",
      "- Usage: charge legere, repetitions longues.",
      "- Indicateur: posture stable sur toute la serie.",
      "- Vigilance: arreter si douleur articulaire.",
      "- Repos: moyen pour relacher la tension.",
      "- Conseil terrain: garder un tempo regulier."
    ),
  },
  {
    slug: "triple-tri-set",
    title: "Triple / tri-set",
    sectionId: "methodes",
    tags: ["methodes", "tri-set", "intensite"],
    pdfPath: `${PDF_BASE}/triple-tri-set.pdf`,
    summaryMd: summary(
      "- Objectif: enchainer trois exercices sans repos.",
      "- Usage: volume eleve, effet cardio musculaire.",
      "- Indicateur: execution propre sur chaque bloc.",
      "- Vigilance: reduire la charge pour tenir la serie.",
      "- Repos: long apres le bloc complet.",
      "- Conseil terrain: choisir des exercices simples."
    ),
  },
  {
    slug: "centurion",
    title: "Centurion",
    sectionId: "methodes",
    tags: ["methodes", "endurance", "challenge"],
    pdfPath: `${PDF_BASE}/centurion.pdf`,
    summaryMd: summary(
      "- Objectif: atteindre un volume total eleve.",
      "- Format: 100 repetitions en plusieurs sets.",
      "- Indicateur: technique identique sur toutes les reps.",
      "- Vigilance: s'arreter si perte de posture.",
      "- Repos: fractionne selon le niveau.",
      "- Conseil terrain: choisir un exercice maitrise."
    ),
  },
  {
    slug: "circuit-training",
    title: "Circuit training",
    sectionId: "methodes",
    tags: ["methodes", "circuit", "cardio"],
    pdfPath: `${PDF_BASE}/circuit-training.pdf`,
    summaryMd: summary(
      "- Objectif: enchainer plusieurs ateliers sans arret long.",
      "- Usage: travail cardio et renforcement global.",
      "- Indicateur: rythme stable tout au long du circuit.",
      "- Vigilance: hydratation et temps de transition courts.",
      "- Repos: entre circuits, pas entre ateliers.",
      "- Conseil terrain: regler la duree par atelier."
    ),
  },
  {
    slug: "demarche-spiralaire",
    title: "Demarche spiralaire",
    sectionId: "ressources-prof",
    tags: ["pedagogie", "progression", "enseignant"],
    pdfPath: `${PDF_BASE}/demarche-spiralaire.pdf`,
    summaryMd: summary(
      "- Objectif: structurer la progression sur plusieurs seances.",
      "- Logique: revenir sur les acquis avec complexite croissante.",
      "- Usage: fixer des objectifs courts et mesurables.",
      "- Indicateur: autonomie croissante des eleves.",
      "- Vigilance: garder des consignes simples par etape.",
      "- Conseil terrain: documenter les paliers atteints."
    ),
  },
  {
    slug: "detente-verticale",
    title: "Detente verticale",
    sectionId: "performance",
    tags: ["performance", "puissance", "saut"],
    pdfPath: `${PDF_BASE}/detente-verticale.pdf`,
    summaryMd: summary(
      "- Objectif: ameliorer la puissance de saut vertical.",
      "- Usage: exercices plyo et force jambes.",
      "- Indicateur: qualite d'appui et reception controlee.",
      "- Vigilance: volume limite pour proteger les genoux.",
      "- Repos: complet entre les series explosives.",
      "- Conseil terrain: filmer pour corriger la technique."
    ),
  },
  {
    slug: "vitesse-agilite",
    title: "Vitesse et agilite",
    sectionId: "performance",
    tags: ["performance", "vitesse", "agilite"],
    pdfPath: `${PDF_BASE}/vitesse-agilite.pdf`,
    summaryMd: summary(
      "- Objectif: developper acceleration et changement de direction.",
      "- Usage: sprints courts et appuis rapides.",
      "- Indicateur: posture gainage, regard haut.",
      "- Vigilance: echauffement articulaire complet.",
      "- Repos: long pour conserver la qualite.",
      "- Conseil terrain: travailler la frequence d'appui."
    ),
  },
];

export const getMusculationDocBySlug = (slug: string) =>
  BAC_MUSCULATION_DOCS.find((doc) => doc.slug === slug);

const EMPTY_DOCS_BY_SECTION: Record<BacMusculationSectionId, BacMusculationDoc[]> = {
  epreuve: [],
  "se-preparer": [],
  themes: [],
  methodes: [],
  performance: [],
  "ressources-prof": [],
};

export const BAC_MUSCULATION_DOCS_BY_SECTION = BAC_MUSCULATION_DOCS.reduce(
  (acc, doc) => {
    const list = acc[doc.sectionId] ?? [];
    list.push(doc);
    acc[doc.sectionId] = list;
    return acc;
  },
  { ...EMPTY_DOCS_BY_SECTION }
);
