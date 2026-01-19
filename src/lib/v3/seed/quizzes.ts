import type { Quiz } from "@/lib/v3/types";

export const quizzesSeed: Quiz[] = [
  {
    id: "q-quadri",
    cardId: "k-anat-quadri",
    questions: [
      {
        q: "Quel groupe est principalement sollicité lors du squat ?",
        choices: ["Quadriceps", "Biceps", "Deltoïdes"],
        answerIndex: 0,
        explanation: "Le squat met en jeu l’extension du genou, dominée par les quadriceps.",
      },
      {
        q: "Quel alignement est attendu pour le genou ?",
        choices: ["Dans l’axe des orteils", "Vers l’intérieur", "Vers l’extérieur"],
        answerIndex: 0,
        explanation: "L’axe genou-orteils limite les contraintes inutiles.",
      },
      {
        q: "Quel repère aide à mieux pousser au squat ?",
        choices: ["Pousser le sol avec les talons", "Lever les talons", "Serrer les genoux"],
        answerIndex: 0,
        explanation: "Les talons ancrés donnent une base stable et puissante.",
      },
    ],
  },
  {
    id: "q-prog",
    cardId: "k-meth-progress",
    questions: [
      {
        q: "Quand augmenter la charge ?",
        choices: [
          "Quand la technique reste stable",
          "Dès que la séance paraît facile",
          "À chaque série",
        ],
        answerIndex: 0,
        explanation: "La technique stable est le critère prioritaire.",
      },
      {
        q: "Quelle règle simple pour progresser ?",
        choices: ["Changer un paramètre à la fois", "Tout changer chaque semaine", "Ne rien noter"],
        answerIndex: 0,
        explanation: "Un seul paramètre à la fois permet de mesurer l’effet.",
      },
      {
        q: "Pourquoi noter ses charges ?",
        choices: ["Suivre la progression", "Pour aller plus vite", "Ce n’est pas utile"],
        answerIndex: 0,
        explanation: "Le carnet aide à objectiver les progrès.",
      },
    ],
  },
  {
    id: "q-tempo",
    cardId: "k-meth-tempo",
    questions: [
      {
        q: "Le tempo sert surtout à…",
        choices: ["Augmenter le temps sous tension", "Réduire l’effort", "Accélérer la séance"],
        answerIndex: 0,
        explanation: "Le tempo contrôle la descente et augmente le temps sous tension.",
      },
      {
        q: "Un tempo 3s concerne quelle phase ?",
        choices: ["La descente", "La montée", "La pause debout"],
        answerIndex: 0,
        explanation: "Les 3 secondes correspondent à l’excentrique.",
      },
      {
        q: "Le tempo est surtout utile pour…",
        choices: ["Le volume", "La puissance", "Le sprint"],
        answerIndex: 0,
        explanation: "Il renforce le contrôle et l’hypertrophie.",
      },
    ],
  },
  {
    id: "q-sleep",
    cardId: "k-rec-sleep",
    questions: [
      {
        q: "Le sommeil aide surtout à…",
        choices: ["Récupérer et progresser", "Se fatiguer", "Réduire la force"],
        answerIndex: 0,
        explanation: "La récupération musculaire dépend fortement du sommeil.",
      },
      {
        q: "Une séance intense nécessite…",
        choices: ["Plus de récupération", "Moins de récupération", "Aucune récupération"],
        answerIndex: 0,
        explanation: "Plus l’effort est intense, plus la récupération est importante.",
      },
      {
        q: "Quelle habitude avant de dormir ?",
        choices: ["Limiter les écrans", "S’entraîner tard", "Boire un soda sucré"],
        answerIndex: 0,
        explanation: "Limiter les écrans améliore l’endormissement.",
      },
    ],
  },
  {
    id: "q-breath",
    cardId: "k-sec-breath",
    questions: [
      {
        q: "À quel moment expirer ?",
        choices: ["En poussée", "En descente", "Sans respirer"],
        answerIndex: 0,
        explanation: "Expirer en poussée aide la stabilité.",
      },
      {
        q: "Le gainage sert à…",
        choices: ["Stabiliser le tronc", "Oublier la posture", "Se relâcher"],
        answerIndex: 0,
        explanation: "Un tronc stable protège la colonne.",
      },
      {
        q: "Quelle consigne est correcte ?",
        choices: ["Respiration contrôlée", "Blocage long", "Respiration au hasard"],
        answerIndex: 0,
        explanation: "Un rythme respiratoire contrôlé est plus sûr.",
      },
    ],
  },
];
