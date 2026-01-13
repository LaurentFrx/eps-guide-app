"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { PROJETS, type Projet } from "@/lib/muscu/types";
import { readStoredProject, writeStoredProject } from "@/lib/muscu/projectStorage";

const CLEAR_LABEL = "Sans projet";

const PROJECT_HINTS: Record<Projet, string[]> = {
  Tonification: [
    "Reps 12-20, charge moderee",
    "Repos 45-75 s, tempo stable",
    "Qualite d execution prioritaire",
  ],
  Volume: [
    "Reps 8-12, tension continue",
    "Repos 60-90 s",
    "Progression de charge par paliers",
  ],
  Puissance: [
    "Reps 3-6, vitesse d execution",
    "Repos long 2-3 min",
    "Arret si la vitesse chute",
  ],
};

type MuscuProjectPickerProps = {
  className?: string;
  onChange?: (value: Projet | null) => void;
};

export function MuscuProjectPicker({ className, onChange }: MuscuProjectPickerProps) {
  const [selected, setSelected] = useState<Projet | null>(() => readStoredProject());

  const handleSelect = (value: Projet | null) => {
    setSelected(value);
    writeStoredProject(value);
    onChange?.(value);
  };

  return (
    <GlassCard className={className}>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Choisir un projet
        </p>
        <p className="text-sm text-white/70">
          Selectionner un projet aide a filtrer les exercices et les conseils.
        </p>
        <div className="flex flex-wrap gap-2">
          {PROJETS.map((projet) => {
            const isActive = selected === projet;
            return (
              <Button
                key={projet}
                type="button"
                size="sm"
                variant={isActive ? "default" : "secondary"}
                data-active={isActive ? "true" : "false"}
                onClick={() => handleSelect(projet)}
                className="ui-chip"
              >
                {projet}
              </Button>
            );
          })}
          <Button
            type="button"
            size="sm"
            variant={selected ? "secondary" : "default"}
            data-active={selected ? "false" : "true"}
            onClick={() => handleSelect(null)}
            className="ui-chip"
          >
            {CLEAR_LABEL}
          </Button>
        </div>
        {selected ? (
          <div className="space-y-2">
            <p className="text-xs text-white/60">Projet actif: {selected}</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-white/70">
              {PROJECT_HINTS[selected].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-white/60">Aucun projet actif.</p>
        )}
      </div>
    </GlassCard>
  );
}
