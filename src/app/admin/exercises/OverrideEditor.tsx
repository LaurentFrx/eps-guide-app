"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { hasCrossReference, isBlank } from "@/lib/admin/editorialRules";

type OverrideEditorProps = {
  code: string;
  title: string;
  initial: {
    consignesMd: string;
    dosageMd: string;
    securiteMd: string;
  };
  updatedAt?: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function OverrideEditor({
  code,
  title,
  initial,
  updatedAt,
}: OverrideEditorProps) {
  const [consignesMd, setConsignesMd] = useState(initial.consignesMd);
  const [dosageMd, setDosageMd] = useState(initial.dosageMd);
  const [securiteMd, setSecuriteMd] = useState(initial.securiteMd);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (isBlank(consignesMd) || isBlank(dosageMd) || isBlank(securiteMd)) {
      return "Tous les champs sont requis.";
    }
    if (
      hasCrossReference(consignesMd) ||
      hasCrossReference(dosageMd) ||
      hasCrossReference(securiteMd)
    ) {
      return "Les renvois “idem exercice” sont interdits.";
    }
    return "";
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/exercises/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consignesMd, dosageMd, securiteMd }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? "Impossible d’enregistrer.");
        return;
      }

      setSuccess("Enregistré.");
    } catch {
      setError("Impossible d’enregistrer.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setError("");
    setSuccess("");
    if (!window.confirm("Réinitialiser l’override ?")) return;
    const response = await fetch(`/api/admin/exercises/${code}`, {
      method: "DELETE",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error ?? "Impossible de réinitialiser.");
      return;
    }
    window.location.assign("/admin");
  };

  return (
    <div className="space-y-6 pb-8">
      <GlassCard className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Override éditorial
            </p>
            <h1 className="font-display text-2xl font-semibold text-white">
              {code} — {title || "Sans titre"}
            </h1>
            <p className="text-sm text-white/70">
              Dernière modif : {formatDate(updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" className="ui-chip">
              <Link
                href={`/exercises/detail/${code}`}
                target="_blank"
                rel="noreferrer"
              >
                Aperçu
              </Link>
            </Button>
            <Button className="ui-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : "Sauvegarder"}
            </Button>
            <Button variant="ghost" className="ui-chip" onClick={handleReset}>
              Réinitialiser
            </Button>
          </div>
        </div>
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-200">{success}</p> : null}
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Consignes
          </p>
          <textarea
            value={consignesMd}
            onChange={(event) => setConsignesMd(event.target.value)}
            rows={10}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
          />
        </GlassCard>
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Dosage
          </p>
          <textarea
            value={dosageMd}
            onChange={(event) => setDosageMd(event.target.value)}
            rows={10}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
          />
        </GlassCard>
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Sécurité
          </p>
          <textarea
            value={securiteMd}
            onChange={(event) => setSecuriteMd(event.target.value)}
            rows={10}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
          />
        </GlassCard>
      </div>
    </div>
  );
}
