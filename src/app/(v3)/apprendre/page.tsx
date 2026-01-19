"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, ChevronLeft, CheckCircle2 } from "lucide-react";
import { V3Header } from "@/components/v3/V3Header";
import { V3Badge } from "@/components/v3/ui/V3Badge";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3EmptyState } from "@/components/v3/ui/V3EmptyState";
import { V3Markdown } from "@/components/v3/V3Markdown";
import { useV3Store } from "@/lib/v3/store";
import type { KnowledgeCard } from "@/lib/v3/types";

export default function ApprendrePage() {
  const { knowledge, quizzes, awardXP, addBadge, profile } = useV3Store();
  const categories = useMemo(
    () => Array.from(new Set(knowledge.map((card) => card.category))),
    [knowledge]
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const cardsInCategory = useMemo(
    () => knowledge.filter((card) => card.category === selectedCategory),
    [knowledge, selectedCategory]
  );

  const activeQuiz = useMemo(
    () => quizzes.find((quiz) => quiz.cardId === selectedCard?.id),
    [quizzes, selectedCard]
  );

  const score = useMemo(() => {
    if (!activeQuiz) return 0;
    return activeQuiz.questions.reduce((acc, question, index) => {
      return acc + (quizAnswers[index] === question.answerIndex ? 1 : 0);
    }, 0);
  }, [activeQuiz, quizAnswers]);

  const handleQuizSubmit = () => {
    if (!activeQuiz) return;
    setQuizSubmitted(true);
    if (score === activeQuiz.questions.length) {
      const badgeName = `Quiz ${selectedCard?.title ?? "Apprendre"}`;
      if (!profile?.badges.includes(badgeName)) {
        awardXP(20);
        addBadge(badgeName);
      }
    }
  };

  return (
    <div className="space-y-6">
      <V3Header title="Apprendre" />

      {!selectedCategory ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <V3Card key={category} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                  {category}
                </p>
                <p className="text-xs text-[color:var(--v3-text-muted)]">
                  {knowledge.filter((card) => card.category === category).length} fiches
                </p>
              </div>
              <V3Button variant="secondary" onClick={() => setSelectedCategory(category)}>
                Ouvrir
              </V3Button>
            </V3Card>
          ))}
        </div>
      ) : null}

      {selectedCategory && !selectedCard ? (
        <div className="space-y-4">
          <V3Button variant="ghost" onClick={() => setSelectedCategory(null)}>
            <ChevronLeft className="h-4 w-4" />
            Catégories
          </V3Button>
          {cardsInCategory.map((card) => (
            <V3Card key={card.id} className="space-y-2">
              <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                {card.title}
              </p>
              <p className="text-xs text-[color:var(--v3-text-muted)]">
                {card.contentMd.split("\n")[0]}
              </p>
              <V3Button variant="secondary" onClick={() => setSelectedCard(card)}>
                Lire la fiche
              </V3Button>
            </V3Card>
          ))}
        </div>
      ) : null}

      {selectedCard ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <V3Button
              variant="ghost"
              onClick={() => {
                setSelectedCard(null);
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Fiches
            </V3Button>
            <V3Badge tone="neutral">{selectedCard.category}</V3Badge>
          </div>

          <V3Card className="space-y-3">
            <p className="text-base font-semibold text-[color:var(--v3-text)]">
              {selectedCard.title}
            </p>
            <V3Markdown text={selectedCard.contentMd} />
          </V3Card>

          {activeQuiz ? (
            <div className="space-y-3">
              <V3Card className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-[color:var(--v3-accent-endurance)]" />
                  <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                    Quiz associé
                  </p>
                </div>
                <V3Button
                  variant="secondary"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                >
                  Faire le quiz
                </V3Button>
              </V3Card>

              {activeQuiz.questions.map((question, index) => (
                <V3Card key={`${activeQuiz.id}-${index}`} className="space-y-3">
                  <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                    {question.q}
                  </p>
                  <div className="space-y-2">
                    {question.choices.map((choice, choiceIndex) => {
                      const selected = quizAnswers[index] === choiceIndex;
                      const correct = quizSubmitted && choiceIndex === question.answerIndex;
                      return (
                        <button
                          key={`${activeQuiz.id}-${index}-${choiceIndex}`}
                          type="button"
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [index]: choiceIndex }))
                          }
                          className={`flex w-full items-center justify-between rounded-[12px] border px-3 py-2 text-left text-xs ${
                            selected
                              ? "border-[color:var(--v3-accent-endurance)] text-[color:var(--v3-text)]"
                              : "border-[color:var(--v3-border)] text-[color:var(--v3-text-muted)]"
                          }`}
                        >
                          {choice}
                          {correct ? <CheckCircle2 className="h-4 w-4 text-[color:var(--v3-accent-volume)]" /> : null}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted ? (
                    <p className="text-xs text-[color:var(--v3-text-muted)]">
                      {question.explanation}
                    </p>
                  ) : null}
                </V3Card>
              ))}

              <V3Button onClick={handleQuizSubmit}>
                Valider le quiz ({score}/{activeQuiz.questions.length})
              </V3Button>
            </div>
          ) : (
            <V3EmptyState
              title="Pas de quiz"
              description="Cette fiche ne possède pas encore de quiz."
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
