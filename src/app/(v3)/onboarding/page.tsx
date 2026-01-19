"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3Badge } from "@/components/v3/ui/V3Badge";
import { V3ProgressBar } from "@/components/v3/ui/V3ProgressBar";
import { V3SegmentedControl } from "@/components/v3/ui/V3SegmentedControl";
import { useV3Store } from "@/lib/v3/store";
import type { Equipment, Level, TrainingTheme, UserProfile } from "@/lib/v3/types";

const themeCards: Array<{
  id: TrainingTheme;
  title: string;
  hint: string;
  tone: "power" | "endurance" | "volume";
}> = [
  {
    id: "PUISSANCE",
    title: "Puissance",
    hint: "Charges lourdes, mouvements explosifs, priorité force.",
    tone: "power",
  },
  {
    id: "ENDURANCE_FORCE",
    title: "Endurance de force (Santé)",
    hint: "Répétitions longues, rythme maîtrisé, effort durable.",
    tone: "endurance",
  },
  {
    id: "VOLUME",
    title: "Volume",
    hint: "Hypertrophie, contrôle technique, progression régulière.",
    tone: "volume",
  },
];

const levelOptions = [
  { value: "DEBUTANT", label: "Débutant" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire" },
  { value: "AVANCE", label: "Avancé" },
];

const equipmentOptions: Array<{ id: Equipment; label: string }> = [
  { id: "AUCUN", label: "Aucun" },
  { id: "HALTERES", label: "Haltères" },
  { id: "BARRE", label: "Barre" },
  { id: "MACHINES", label: "Machines" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useV3Store();
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<TrainingTheme | null>(null);
  const [level, setLevel] = useState<Level>("DEBUTANT");
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const stepLabel = useMemo(() => `Étape ${step}/5`, [step]);

  const next = () => setStep((prev) => Math.min(5, prev + 1));
  const prev = () => setStep((prev) => Math.max(1, prev - 1));

  const toggleEquipment = (id: Equipment) => {
    setEquipment((prev) => {
      if (id === "AUCUN") {
        return prev.includes("AUCUN") ? [] : ["AUCUN"];
      }
      const withoutNone = prev.filter((item) => item !== "AUCUN");
      if (withoutNone.includes(id)) {
        return withoutNone.filter((item) => item !== id);
      }
      return [...withoutNone, id];
    });
  };

  const handleSubmit = () => {
    if (!theme) return;
    const profile: UserProfile = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `user-${Date.now()}`,
      pseudo: "Élève",
      theme,
      level,
      equipment: equipment.length ? equipment : ["AUCUN"],
      createdAt: new Date().toISOString(),
      onboardingDone: true,
      xp: 0,
      badges: [],
      streak: { current: 0, best: 0 },
    };
    completeOnboarding(profile);
    router.replace("/accueil");
  };

  return (
    <div className="space-y-6">
      <V3ProgressBar value={step} max={5} tone="endurance" label={stepLabel} />

      {step === 1 ? (
        <V3Card className="space-y-4">
          <h1 className="text-xl font-semibold text-[color:var(--v3-text)]">
            EPS Musculation
          </h1>
          <p className="text-sm text-[color:var(--v3-text-muted)]">
            Prépare l’épreuve en musculation (AFL1 • AFL2 • AFL3).
          </p>
          <V3Button onClick={next} className="w-full">
            Commencer
          </V3Button>
        </V3Card>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-[color:var(--v3-text)]">
            Choix du thème
          </h1>
          <div className="space-y-3">
            {themeCards.map((card) => {
              const active = theme === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setTheme(card.id)}
                  className="w-full text-left"
                >
                  <V3Card
                    className={`space-y-2 border ${
                      active ? "border-[color:var(--v3-text)]" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-[color:var(--v3-text)]">
                        {card.title}
                      </h2>
                      <V3Badge tone={card.tone}>Thème</V3Badge>
                    </div>
                    <p className="text-sm text-[color:var(--v3-text-muted)]">
                      {card.hint}
                    </p>
                  </V3Card>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <V3Button variant="ghost" onClick={prev} className="w-full">
              Retour
            </V3Button>
            <V3Button onClick={next} className="w-full" disabled={!theme}>
              Continuer
            </V3Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-[color:var(--v3-text)]">
            Niveau
          </h1>
          <V3SegmentedControl
            value={level}
            options={levelOptions}
            onChange={(value) => setLevel(value as Level)}
          />
          <div className="flex gap-2">
            <V3Button variant="ghost" onClick={prev} className="w-full">
              Retour
            </V3Button>
            <V3Button onClick={next} className="w-full">
              Continuer
            </V3Button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-[color:var(--v3-text)]">
            Matériel disponible
          </h1>
          <div className="space-y-2">
            {equipmentOptions.map((option) => {
              const checked = equipment.includes(option.id);
              return (
                <V3Card key={option.id} className="flex items-center justify-between">
                  <span className="text-sm text-[color:var(--v3-text)]">
                    {option.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEquipment(option.id)}
                    className="h-5 w-5 accent-[color:var(--v3-accent-endurance)]"
                  />
                </V3Card>
              );
            })}
          </div>
          <div className="flex gap-2">
            <V3Button variant="ghost" onClick={prev} className="w-full">
              Retour
            </V3Button>
            <V3Button onClick={next} className="w-full">
              Continuer
            </V3Button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-[color:var(--v3-text)]">
            Récapitulatif
          </h1>
          <V3Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--v3-text-muted)]">Thème</span>
              <span className="text-sm font-semibold text-[color:var(--v3-text)]">
                {themeCards.find((item) => item.id === theme)?.title ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--v3-text-muted)]">Niveau</span>
              <span className="text-sm font-semibold text-[color:var(--v3-text)]">
                {levelOptions.find((item) => item.value === level)?.label}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-[color:var(--v3-text-muted)]">Matériel</span>
              <div className="flex flex-wrap gap-2">
                {(equipment.length ? equipment : ["AUCUN"]).map((item) => (
                  <V3Badge key={item} tone="neutral">
                    {equipmentOptions.find((opt) => opt.id === item)?.label ?? item}
                  </V3Badge>
                ))}
              </div>
            </div>
          </V3Card>
          <div className="flex gap-2">
            <V3Button variant="ghost" onClick={prev} className="w-full">
              Retour
            </V3Button>
            <V3Button onClick={handleSubmit} className="w-full" disabled={!theme}>
              Valider mon profil
            </V3Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
