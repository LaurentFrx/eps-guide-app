import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  assetName: string;
  releaseUrl: string | null;
  downloadUrl: string | null;
  assetSizeBytes?: number | null;
  available: boolean;
  status?: number | null;
  error?: string | null;
};

function formatSize(bytes: number) {
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} Mo`;
}

export default function ReleaseCard({
  title,
  description,
  assetName,
  releaseUrl,
  downloadUrl,
  assetSizeBytes = null,
  available,
  status = null,
  error = null,
}: Props) {
  let message = null;
  if (!available) {
    if (status === 404) message = 'Aucune release / aucun asset trouvé.';
    else if (status === 403) message = 'Rate-limit GitHub atteint (ajoutez un token serveur).';
    else if (error) message = 'Erreur réseau / API.';
    else message = 'Fichier manquant sur la Release.';
  }

  return (
    <GlassCard className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/60">{title}</p>
          <p className="text-base text-white">{description}</p>
        </div>
        {assetSizeBytes ? <p className="text-xs text-white/60">{formatSize(assetSizeBytes)}</p> : null}
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="ui-chip">
          <a href={releaseUrl ?? "#"} target="_blank" rel="noreferrer">Voir la release</a>
        </Button>

        <Button asChild size="sm" className="ui-btn-primary" disabled={!available}>
          <a href={downloadUrl ?? "#"} download={available} target={available ? "_blank" : undefined} rel="noreferrer">
            Télécharger ({assetName})
          </a>
        </Button>
      </div>

      {message ? (
        <p className="text-xs text-amber-200/90">{message}</p>
      ) : null}
    </GlassCard>
  );
}
