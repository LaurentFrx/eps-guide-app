"use client";

import { useMemo, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { V3Header } from "@/components/v3/V3Header";
import { V3Badge } from "@/components/v3/ui/V3Badge";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3EmptyState } from "@/components/v3/ui/V3EmptyState";
import { useV3Store } from "@/lib/v3/store";
import type { CoachFeedback } from "@/lib/v3/types";

const checklistLabels = [
  "Dos droit",
  "Amplitude",
  "Respiration",
  "Sécurité",
  "Rythme",
  "Attitude",
];

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `feedback-${Date.now()}`;

export default function CoachPage() {
  const { coachFeedbacks, sessions, profile, addCoachFeedback } = useV3Store();
  const [showForm, setShowForm] = useState(coachFeedbacks.length > 0);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [comment, setComment] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(checklistLabels.map((label) => [label, false]))
  );

  const completedSessions = useMemo(
    () => sessions.filter((session) => session.status === "TERMINEE"),
    [sessions]
  );

  const received = profile?.pseudo
    ? coachFeedbacks.filter((feedback) => feedback.toUserPseudo === profile.pseudo)
    : coachFeedbacks;

  const handleSubmit = () => {
    if (!selectedSessionId) return;
    const feedback: CoachFeedback = {
      id: createId(),
      fromUserPseudo: profile?.pseudo ?? "Élève",
      toUserPseudo: profile?.pseudo ?? "Élève",
      sessionId: selectedSessionId,
      checklist: checklistLabels.map((label) => ({ label, value: checks[label] ?? false })),
      comment,
      createdAt: new Date().toISOString(),
    };
    addCoachFeedback(feedback);
    setShowForm(true);
    setSelectedSessionId("");
    setComment("");
    setChecks(Object.fromEntries(checklistLabels.map((label) => [label, false])));
  };

  return (
    <div className="space-y-6">
      <V3Header title="Coach" />

      {coachFeedbacks.length === 0 ? (
        <V3Card className="space-y-3">
          <p className="text-sm font-semibold text-[color:var(--v3-text)]">
            AFL3 : coaching et analyse
          </p>
          <p className="text-xs text-[color:var(--v3-text-muted)]">
            Utilise cette section pour analyser une séance et progresser ensemble.
          </p>
          <V3Button onClick={() => setShowForm(true)}>
            Créer un feedback
          </V3Button>
        </V3Card>
      ) : null}

      {received.length ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[color:var(--v3-text-muted)]">
            Feedbacks reçus
          </h2>
          {received.map((feedback) => (
            <V3Card key={feedback.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[color:var(--v3-text)]">
                  Séance {feedback.sessionId}
                </p>
                <V3Badge tone="neutral">{feedback.fromUserPseudo}</V3Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {feedback.checklist.map((item) => (
                  <V3Badge key={item.label} tone={item.value ? "volume" : "neutral"}>
                    {item.label}
                  </V3Badge>
                ))}
              </div>
              <p className="text-xs text-[color:var(--v3-text-muted)]">
                {feedback.comment}
              </p>
            </V3Card>
          ))}
        </div>
      ) : coachFeedbacks.length > 0 ? (
        <V3EmptyState
          title="Pas encore de feedback reçu"
          description="Demande à un partenaire de te coacher."
        />
      ) : null}

      {showForm ? (
        <V3Card className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-[color:var(--v3-accent-endurance)]" />
            <p className="text-sm font-semibold text-[color:var(--v3-text)]">
              Donner un feedback
            </p>
          </div>
          <select
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
            className="min-h-11 rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
          >
            <option value="">Choisir une séance</option>
            {completedSessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>

          <div className="grid gap-2 sm:grid-cols-2">
            {checklistLabels.map((label) => (
              <label key={label} className="flex items-center justify-between rounded-[12px] border border-[color:var(--v3-border)] px-3 py-2 text-xs text-[color:var(--v3-text)]">
                {label}
                <input
                  type="checkbox"
                  checked={checks[label] ?? false}
                  onChange={() =>
                    setChecks((prev) => ({ ...prev, [label]: !(prev[label] ?? false) }))
                  }
                  className="h-4 w-4 accent-[color:var(--v3-accent-endurance)]"
                />
              </label>
            ))}
          </div>

          <input
            type="text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Commentaire"
            className="min-h-11 w-full rounded-[var(--v3-radius-btn)] border border-[color:var(--v3-border)] bg-transparent px-3 text-sm text-[color:var(--v3-text)]"
          />
          <V3Button onClick={handleSubmit}>Enregistrer</V3Button>
        </V3Card>
      ) : null}
    </div>
  );
}
