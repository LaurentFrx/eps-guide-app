import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  assetName: string;
  releaseUrl: string | null;
  downloadUrl: string | null;
  available: boolean;
};

export default function ReleaseCard({
  title,
  description,
  assetName,
  releaseUrl,
  downloadUrl,
  available,
}: Props) {
  return (
    <GlassCard className="space-y-2">
      <p className="text-sm uppercase tracking-widest text-slate-500">{title}</p>
      <p className="text-base text-slate-900">{description}</p>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={releaseUrl ?? "#"} target="_blank" rel="noreferrer">Voir la release</a>
        </Button>
        <Button asChild size="sm" disabled={!available}>
          <a href={downloadUrl ?? "#"} download={available} target={available ? "_blank" : undefined} rel="noreferrer">
            Télécharger ({assetName})
          </a>
        </Button>
      </div>
      {!available ? (
        <p className="text-xs text-amber-900/80">Fichier manquant sur la Release.</p>
      ) : null}
    </GlassCard>
  );
}
