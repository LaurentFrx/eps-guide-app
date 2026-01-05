import { normalizeExerciseCode } from "@/lib/exerciseCode";

export type ExercisePatch = {
  title?: string;
  level?: string;
  equipment?: string;
  muscles?: string;
  key_points?: string[];
  dosage?: string[];
  safety?: string[];
};

const BULLET = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

const RAW_PATCHES: Record<string, ExercisePatch> = {
  "S1-01": { level: "Débutant" },
  "S1-02": { level: "Débutant" },
  "S1-03": { level: "Intermédiaire" },
  "S1-04": { level: "Intermédiaire" },
  "S1-05": { level: "Intermédiaire" },
  "S1-06": { level: "Intermédiaire" },
  "S1-07": { level: "Intermédiaire" },
  "S1-08": { level: "Avancé" },
  "S1-09": { level: "Avancé" },
  "S1-10": { level: "Débutant" },
  "S3-10": {
    title: "Développé haltères couché sur banc",
    level: "Intermédiaire",
    equipment: "Banc plat + haltères (6–12 kg)",
    muscles: "Pectoraux, deltoïdes antérieurs, triceps, gainage (stabilisation)",
    key_points: [
      "Banc stable, pieds au sol, omoplates serrées et épaules basses.",
      "Poignets neutres, haltères au-dessus de la ligne d’épaules, avant-bras verticaux.",
      "Descendre contrôlé jusqu’à coudes ~45° du buste (amplitude selon confort).",
      "Pousser en expirant, sans verrouiller brutalement les coudes.",
      "Garder le bas du dos neutre (éviter la cambrure excessive).",
    ],
    dosage: [
      "3–5 séries de 8–12 reps (repos 90 s) pour hypertrophie/endurance.",
      "Ou 3–4 séries de 6–8 reps plus lourd (repos 2 min) pour force.",
    ],
    safety: [
      "Si douleur d’épaule : réduire amplitude, prise neutre, charge plus légère.",
      "Si poignets sensibles : garder neutre, éviter l’hyperextension.",
      "Progression : tempo lent / charge + ; Régression : floor press (au sol).",
    ],
  },
  "S3-20": {
    title: "Face pulls à l’élastique",
    level: "Intermédiaire",
    equipment: "Élastique fixé à hauteur du visage",
    muscles:
      "Deltoïdes postérieurs, trapèzes moyens/inférieurs, rhomboïdes, coiffe (rotation externe)",
    key_points: [
      "Point d’ancrage stable, position gainée, coudes hauts.",
      "Tirer vers le visage en ouvrant (rotation externe) sans hausser les épaules.",
      "Finir avec omoplates serrées, poitrine ouverte.",
      "Retour contrôlé (pas d’à-coups), tension constante.",
      "Choisir une résistance permettant une exécution propre.",
    ],
    dosage: ["3–4 séries de 12–20 reps, repos 45–75 s.", "Option posture: 2–3 séries légères en fin de séance."],
    safety: [
      "Éviter si douleur aiguë à l’épaule; réduire charge/amplitude.",
      "Ne pas cambrer; garder côtes “rentrées” et cou neutre.",
      "Priorité à la forme: mouvement lent et contrôlé.",
    ],
  },
  "S4-07": {
    title: "Soulevé de terre roumain aux haltères (RDL)",
    level: "Intermédiaire",
    equipment: "Haltères (10–15 kg) ou charge adaptée",
    muscles: "Ischio-jambiers, grand fessier, érecteurs du rachis (gainage), adducteurs",
    key_points: [
      "Charnière de hanche: reculer les hanches, genoux légèrement fléchis.",
      "Dos neutre, colonne longue, regard au sol à 2–3 m.",
      "Descendre la charge le long des cuisses/tibias sans arrondir le dos.",
      "Remonter en contractant fessiers/ischios, sans “tirer” avec le bas du dos.",
      "Amplitude selon mobilité: stop si rétroversion/arrondi.",
    ],
    dosage: [
      "3–4 séries de 8–12 reps, repos 90–120 s.",
      "Option technique: 2–3 séries légères tempo 3 s en descente.",
    ],
    safety: [
      "Interrompre si douleur lombaire: réduire amplitude/charge, revoir la charnière.",
      "Garder la charge proche du corps; éviter l’élan.",
      "Régression: hip hinge au bâton; Progression: charge + / tempo.",
    ],
  },
  "S4-15": {
    title: "Jump squats",
    level: "Intermédiaire",
    equipment: "Aucun",
    muscles: "Quadriceps, fessiers, mollets, gainage (stabilisation)",
    key_points: [
      "Squat préparatoire propre (genoux dans l’axe, talons au sol).",
      "Saut vertical explosif, gainage serré.",
      "Réception silencieuse: amortir, genoux souples, genoux alignés pieds.",
      "Rebond contrôlé (ou reset entre reps si besoin).",
      "Volume bas: la qualité prime sur la quantité.",
    ],
    dosage: [
      "3–5 séries de 3–6 sauts, repos 90–150 s.",
      "Arrêter dès perte de technique/hauteur.",
    ],
    safety: [
      "Prudence genoux/chevilles; éviter en douleur aiguë ou reprise post-blessure.",
      "Surface stable et non glissante; chaussures adaptées.",
      "Régression: squat rapide sans saut; Progression: box jump (si maîtrisé).",
    ],
  },
  "S5-01": {
    title: "Burpees complets (Full Burpees)",
    level: "Avancé",
    equipment: "Aucun",
    muscles:
      "Quadriceps, fessiers, ischios, pectoraux, triceps, deltoïdes, sangle abdominale, mollets",
    key_points: [
      "Depuis debout: descendre en squat, mains au sol.",
      "Jeter les pieds en arrière en planche, gainage serré.",
      "Faire une pompe stricte (poitrine proche du sol), coudes ~45°.",
      "Ramener les pieds sous le buste, se redresser et sauter bras au-dessus.",
      "Rythme régulier: technique d’abord, vitesse ensuite.",
    ],
    dosage: [
      "Début: 3×6–10 reps, repos 60–90 s.",
      "Conditionnement: intervalles 20–40 s effort / 20–60 s repos (6–10 rounds).",
    ],
    safety: [
      "Réduire l’amplitude si lombaires/épaules sensibles (burpee sans pompe / sans saut).",
      "Garder le gainage: éviter de creuser le bas du dos en planche.",
      "Surface stable; prudence poignets (poignées si besoin).",
    ],
  },
  "S5-02": {
    title: "Burpees sans pompe",
    level: "Intermédiaire",
    equipment: "Aucun",
    muscles: "Quadriceps, fessiers, ischios, gainage, épaules (stabilisation), mollets",
    key_points: [
      "Squat → mains au sol → pieds en arrière en planche (sans descendre en pompe).",
      "Planche stable: abdos/fessiers serrés.",
      "Ramener les pieds sous le buste sans arrondir excessivement.",
      "Se relever + petit saut (option) ou montée sur pointes (régression).",
      "Respiration rythmée, mouvement fluide.",
    ],
    dosage: [
      "3×8–12 reps, repos 60–90 s.",
      "Intervalles: 20–30 s effort / 30–60 s repos (6–10 rounds).",
    ],
    safety: [
      "Si poignets: utiliser poignées/haltères hex, ou faire sur support surélevé.",
      "Si lombaires: réduire vitesse, renforcer le gainage en planche.",
      "Régression: step-back (un pied après l’autre) au lieu de sauter.",
    ],
  },
  "S5-03": {
    title: "Demi-burpees (Half Burpees)",
    level: "Intermédiaire",
    equipment: "Aucun",
    muscles: "Quadriceps, fessiers, gainage, cardio",
    key_points: [
      "Squat → mains au sol → extension des jambes en arrière (option step-back).",
      "Pas de pompe; retour contrôlé en squat.",
      "Option: pas de saut final (juste se redresser).",
      "Garder le dos neutre, éviter l’arrondi excessif.",
      "Cadence modérée, priorité à la stabilité.",
    ],
    dosage: ["3×10–15 reps, repos 60 s.", "Intervalles: 20 s effort / 40 s repos (8–12 rounds)."],
    safety: [
      "Adapter sans saut si genoux/chevilles sensibles.",
      "Adapter step-back si impact trop élevé.",
      "Stop si perte de gainage (lombaires).",
    ],
  },
  "S5-04": {
    title: "Thrusters (squat + développé)",
    level: "Intermédiaire",
    equipment: "Haltères (6–12 kg) ou kettlebell",
    muscles: "Quadriceps, fessiers, deltoïdes, triceps, gainage",
    key_points: [
      "Haltères en rack (épaules), coudes légèrement devant.",
      "Squat propre: genoux suivent les pieds, talons au sol.",
      "Remontée explosive et enchaîner le développé au-dessus de la tête.",
      "Verrouillage contrôlé, côtes “rentrées” (pas d’hyperlordose).",
      "Revenir en rack et enchaîner sans s’effondrer.",
    ],
    dosage: [
      "3–5×6–10 reps, repos 90–120 s.",
      "Intervalles: 30 s effort / 60 s repos (6–8 rounds).",
    ],
    safety: [
      "Si épaules: limiter amplitude au-dessus de la tête, charge légère.",
      "Si lombaires: gainage strict, éviter la cambrure au développé.",
      "Régression: front squat seul + développé séparé.",
    ],
  },
  "S5-05": {
    title: "Kettlebell swing",
    level: "Intermédiaire",
    equipment: "Kettlebell",
    muscles:
      "Ischio-jambiers, fessiers, lombaires (gainage), trapèzes/avant-bras (prise)",
    key_points: [
      "Mouvement de hanche (hip hinge), pas un squat.",
      "Dos neutre, KB proche, bras “crochets” (ne pas tirer avec les bras).",
      "Extension explosive des hanches, gainage serré en haut.",
      "KB monte par l’impulsion, redescendre contrôlé entre les jambes.",
      "Rythme régulier, respiration synchronisée.",
    ],
    dosage: ["3–5×10–20 reps, repos 60–90 s.", "Ou EMOM 10 min: 10 swings / minute."],
    safety: [
      "Stop si arrondi lombaire: réduire charge/amplitude.",
      "Ne pas hyper-étendre en haut (côtes basses).",
      "Régression: hip hinge au bâton / deadlift KB.",
    ],
  },
  "S5-06": {
    title: "Turkish get-up (relevé turc)",
    level: "Avancé",
    equipment: "Kettlebell (ou haltère) léger",
    muscles: "Épaule (stabilité), sangle abdominale, fessiers, quadriceps, obliques",
    key_points: [
      "Bras chargé vertical, poignet neutre, regard sur la charge.",
      "Monter par étapes: coude → main → pont → passage de jambe → fente → debout.",
      "Hanches hautes au pont, épaule “packée” (basse et stable).",
      "Redescendre en sens inverse, contrôlé.",
      "Privilégier la stabilité à la vitesse.",
    ],
    dosage: [
      "2–4 séries de 1–3 reps par côté, repos 60–120 s.",
      "Travail technique: séries très légères, tempo lent.",
    ],
    safety: [
      "Charge légère au début; priorité au contrôle de l’épaule.",
      "Éviter si douleur épaule aiguë; réduire amplitude/charger moins.",
      "Dégager l’espace au sol (sécurité).",
    ],
  },
  "S5-07": {
    title: "Soulevé de terre roumain (RDL)",
    level: "Intermédiaire",
    equipment: "Barre ou haltères",
    muscles: "Ischio-jambiers, fessiers, érecteurs du rachis (gainage), adducteurs",
    key_points: [
      "Charnière de hanche, genoux souples.",
      "Dos neutre, charge proche du corps.",
      "Descente contrôlée, stop avant arrondi.",
      "Remontée par contraction fessiers/ischios.",
      "Respiration: inspirer en bas, expirer en montant.",
    ],
    dosage: [
      "3–4×8–12 reps, repos 90–120 s.",
      "Option force: 4×6–8 reps, repos 2 min.",
    ],
    safety: [
      "Réduire charge si lombaires sensibles; vérifier technique.",
      "Éviter l’élan; tempo contrôlé.",
      "Régression: hip hinge / good morning léger.",
    ],
  },
  "S5-08": {
    title: "Wall balls",
    level: "Intermédiaire",
    equipment: "Med-ball + mur/cible",
    muscles: "Quadriceps, fessiers, épaules, triceps, gainage, cardio",
    key_points: [
      "Squat → lancer la balle vers une cible (hauteur définie).",
      "Recevoir la balle en amortissant, enchaîner en squat.",
      "Genoux alignés, talons au sol autant que possible.",
      "Lancer avec coordination jambes + bras (pas uniquement bras).",
      "Cadence régulière, respiration.",
    ],
    dosage: [
      "3×10–20 reps, repos 60–90 s.",
      "Intervalles: 30 s effort / 30–60 s repos (6–10 rounds).",
    ],
    safety: [
      "Choisir un poids adapté (technique propre).",
      "Éviter en douleur épaule; réduire charge/hauteur.",
      "Surface stable, attention aux rebonds.",
    ],
  },
  "S5-09": {
    title: "Farmer’s walk",
    level: "Intermédiaire",
    equipment: "2 haltères (ou KB) lourds",
    muscles: "Avant-bras/prise, trapèzes, gainage, fessiers",
    key_points: [
      "Posture haute: épaules basses, poitrine ouverte.",
      "Marcher lentement, pas courts, tronc gainé.",
      "Ne pas se pencher; garder la charge stable.",
      "Regard loin, respiration contrôlée.",
      "Poser/reprendre proprement (charnière de hanche).",
    ],
    dosage: ["4–8 allers de 20–40 m, repos 60–120 s.", "Ou 4×30–45 s de marche."],
    safety: [
      "Éviter si lombalgie aiguë; réduire charge.",
      "Poignets/prise: progresser graduellement.",
      "Surface dégagée (sécurité).",
    ],
  },
  "S5-10": {
    title: "Box jumps",
    level: "Intermédiaire",
    equipment: "Box/step stable",
    muscles: "Quadriceps, fessiers, mollets, gainage",
    key_points: [
      "Choisir une hauteur maîtrisable (qualité).",
      "Saut explosif, atterrissage pieds entiers sur la box.",
      "Réception douce, genoux alignés, tronc stable.",
      "Descendre en marchant (réduire impact) si nécessaire.",
      "Stop si perte de hauteur/technique.",
    ],
    dosage: ["3–5×3–6 sauts, repos 90–150 s.", "Option: EMOM 8 min: 3–5 sauts."],
    safety: [
      "Box stable, surface non glissante.",
      "Prudence genoux/chevilles; éviter si douleur aiguë.",
      "Régression: step-ups rapides / jump squat.",
    ],
  },
};

export const EXERCISE_PATCHES: Record<string, ExercisePatch> = Object.fromEntries(
  Object.entries(RAW_PATCHES).map(([code, patch]) => [
    normalizeExerciseCode(code),
    patch,
  ])
);

export const getExercisePatch = (code: string) =>
  EXERCISE_PATCHES[normalizeExerciseCode(code)];

export const applyExercisePatch = <T extends { code: string }>(exercise: T): T => {
  const patch = getExercisePatch(exercise.code);
  if (!patch) return exercise;
  const next = { ...exercise } as Record<string, unknown>;

  if (patch.title) next.title = patch.title;
  if (patch.level) next.level = patch.level;
  if (patch.equipment) next.equipment = patch.equipment;
  if (patch.muscles) next.muscles = patch.muscles;
  if (patch.key_points) next.key_points = patch.key_points;
  if (patch.safety) next.safety = patch.safety;
  if (patch.dosage) next.dosage = BULLET(patch.dosage);

  return next as T;
};
