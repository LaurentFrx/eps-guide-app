"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import { normalizeExerciseRecord, type ExerciseRecord } from "@/lib/exercises/schema";

type ExerciseFormProps = {
  initial: ExerciseRecord;
  mode: "new" | "edit";
  source?: "base" | "custom";
};

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const joinLines = (values: string[]) => values.join("\n");

export default function ExerciseForm({ initial, mode, source }: ExerciseFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [code, setCode] = useState(initial.code);
  const [level, setLevel] = useState(initial.level);
  const [equipment, setEquipment] = useState(initial.equipment);
  const [muscles, setMuscles] = useState(initial.muscles);
  const [objective, setObjective] = useState(initial.objective);
  const [anatomy, setAnatomy] = useState(initial.anatomy);
  const [biomechanics, setBiomechanics] = useState(initial.biomechanics);
  const [benefits, setBenefits] = useState(initial.benefits);
  const [contraindications, setContraindications] = useState(initial.contraindications);
  const [regress, setRegress] = useState(initial.regress);
  const [progress, setProgress] = useState(initial.progress);
  const [dosage, setDosage] = useState(initial.dosage);
  const [image, setImage] = useState(initial.image ?? "");
  const [keyPoints, setKeyPoints] = useState(joinLines(initial.key_points));
  const [safety, setSafety] = useState(joinLines(initial.safety));
  const [cues, setCues] = useState(joinLines(initial.cues));
  const [sources, setSources] = useState(joinLines(initial.sources));
  const [materielMd, setMaterielMd] = useState(initial.materielMd ?? "");
  const [consignesMd, setConsignesMd] = useState(initial.consignesMd ?? "");
  const [dosageMd, setDosageMd] = useState(initial.dosageMd ?? "");
  const [securiteMd, setSecuriteMd] = useState(initial.securiteMd ?? "");
  const [detailMd, setDetailMd] = useState(initial.detailMd ?? "");
  const [fullMdRaw, setFullMdRaw] = useState(initial.fullMdRaw ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const payload = useMemo(
    () => ({
      code,
      title,
      level,
      equipment,
      muscles,
      objective,
      anatomy,
      biomechanics,
      benefits,
      contraindications,
      regress,
      progress,
      dosage,
      image,
      key_points: splitLines(keyPoints),
      safety: splitLines(safety),
      cues: splitLines(cues),
      sources: splitLines(sources),
      materielMd,
      consignesMd,
      dosageMd,
      securiteMd,
      detailMd,
      fullMdRaw,
    }),
    [
      anatomy,
      benefits,
      biomechanics,
      code,
      contraindications,
      cues,
      detailMd,
      dosage,
      dosageMd,
      equipment,
      fullMdRaw,
      image,
      keyPoints,
      level,
      materielMd,
      muscles,
      objective,
      progress,
      regress,
      safety,
      sources,
      title,
      consignesMd,
      securiteMd,
    ]
  );

  const previewRecord = useMemo(
    () => normalizeExerciseRecord(payload),
    [payload]
  );

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const endpoint =
      mode === "new" ? "/api/admin/exercises" : `/api/admin/exercises/${code}`;
    const method = mode === "new" ? "POST" : "PUT";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Impossible d’enregistrer.");
      setSaving(false);
      return;
    }

    if (mode === "new") {
      const data = await response.json().catch(() => ({}));
      const nextCode = data.exercise?.code ?? code;
      window.location.href = `/admin/exercises/${nextCode}`;
      return;
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (source !== "custom") return;
    if (!window.confirm("Supprimer cette fiche personnalisée ?")) return;
    const response = await fetch(`/api/admin/exercises/${code}`, {
      method: "DELETE",
    });
    if (response.ok) {
      window.location.href = "/admin";
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              {mode === "new" ? "Nouvelle fiche" : "Édition"}
            </p>
            <h1 className="font-display text-2xl font-semibold text-white">
              {mode === "new" ? "Créer un exercice" : `${code} · ${title || "Sans titre"}`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="ui-chip"
              onClick={() => setShowPreview((prev) => !prev)}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Masquer l’aperçu" : "Prévisualiser"}
            </Button>
            <Button
              className="ui-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            {mode === "edit" && source === "custom" ? (
              <Button variant="ghost" className="ui-chip" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            ) : null}
            <Button asChild variant="ghost" className="ui-chip">
              <Link href="/admin">Annuler</Link>
            </Button>
          </div>
        </div>
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <GlassCard className="space-y-3">
          <h2 className="text-sm font-semibold text-white/80">Infos principales</h2>
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-widest text-white/60">
              Code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                disabled={mode === "edit"}
                className={cn(
                  "mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90",
                  mode === "edit" ? "opacity-70" : ""
                )}
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-white/60">
              Titre
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-white/60">
              Niveau
              <input
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-white/60">
              Image (chemin public)
              <input
                value={image}
                onChange={(event) => setImage(event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
              />
            </label>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3">
          <h2 className="text-sm font-semibold text-white/80">Données rapides</h2>
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-widest text-white/60">
              Matériel
              <input
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-white/60">
              Muscles
              <input
                value={muscles}
                onChange={(event) => setMuscles(event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-white/60">
              Objectif
              <textarea
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
              />
            </label>
            <label className="text-xs uppercase tracking-widest text-white/60">
              Anatomie
              <textarea
                value={anatomy}
                onChange={(event) => setAnatomy(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
              />
            </label>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3">
          <h2 className="text-sm font-semibold text-white/80">Consignes</h2>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Points clés (1 par ligne)
            <textarea
              value={keyPoints}
              onChange={(event) => setKeyPoints(event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Sécurité (1 par ligne)
            <textarea
              value={safety}
              onChange={(event) => setSafety(event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Dosage
            <textarea
              value={dosage}
              onChange={(event) => setDosage(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
        </GlassCard>

        <GlassCard className="space-y-3">
          <h2 className="text-sm font-semibold text-white/80">Compléments</h2>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Biomecanique
            <textarea
              value={biomechanics}
              onChange={(event) => setBiomechanics(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Bénéfices
            <textarea
              value={benefits}
              onChange={(event) => setBenefits(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Contre-indications
            <textarea
              value={contraindications}
              onChange={(event) => setContraindications(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Régressions
            <textarea
              value={regress}
              onChange={(event) => setRegress(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Progressions
            <textarea
              value={progress}
              onChange={(event) => setProgress(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
        </GlassCard>

        <GlassCard className="space-y-3">
          <h2 className="text-sm font-semibold text-white/80">Editorial (Markdown)</h2>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Matériel (md)
            <textarea
              value={materielMd}
              onChange={(event) => setMaterielMd(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Consignes (md)
            <textarea
              value={consignesMd}
              onChange={(event) => setConsignesMd(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Dosage (md)
            <textarea
              value={dosageMd}
              onChange={(event) => setDosageMd(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Sécurité (md)
            <textarea
              value={securiteMd}
              onChange={(event) => setSecuriteMd(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Détail (md)
            <textarea
              value={detailMd}
              onChange={(event) => setDetailMd(event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Full raw (md)
            <textarea
              value={fullMdRaw}
              onChange={(event) => setFullMdRaw(event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Cues (1 par ligne)
            <textarea
              value={cues}
              onChange={(event) => setCues(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
          <label className="text-xs uppercase tracking-widest text-white/60">
            Sources (1 par ligne)
            <textarea
              value={sources}
              onChange={(event) => setSources(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            />
          </label>
        </GlassCard>
      </div>

      {showPreview ? (
        <GlassCard className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Aperçu
          </p>
          <ExerciseDetail exercise={previewRecord} heroSrc={image || undefined} />
        </GlassCard>
      ) : null}
    </div>
  );
}
