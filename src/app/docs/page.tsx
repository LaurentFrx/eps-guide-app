import { GlassCard } from "@/components/GlassCard";
import ReleaseCard from "@/components/ReleaseCard";
import { fetchLatestRelease, findAsset, listAssetNames } from "@/lib/github-releases";

export const revalidate = 60;

const docs = [
  { id: "eps-1", title: "EPS 1", description: "Fiche d'exercices EPS 1 au format Word.", assetName: "eps-1.docx" },
  { id: "eps-2", title: "EPS 2", description: "Fiche d'exercices EPS 2 au format Word.", assetName: "eps-2.docx" },
];

const OWNER = "LaurentFrx";
const REPO = "eps-guide-app";

export default async function DocsPage() {
  const fetchResult = await fetchLatestRelease(OWNER, REPO);

  const docsWithInfo = docs.map((d) => {
    const asset = fetchResult.release ? findAsset(fetchResult.release, d.assetName) : null;
    return {
      ...d,
      available: Boolean(asset),
      downloadUrl: asset ? asset.browser_download_url : null,
      assetSizeBytes: asset ? asset.size : null,
      releaseUrl: fetchResult.release ? fetchResult.release.html_url : `https://github.com/${OWNER}/${REPO}/releases/latest`,
      status: fetchResult.status,
      error: fetchResult.error,
    };
  });

  // Only show missing banner if assets are actually not resolved
  const missingDocs = docs.filter((d) => !findAsset(fetchResult.release, d.assetName));
  const availableNames = fetchResult.release ? listAssetNames(fetchResult.release) : [];

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-500">Documents</p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">Fiches EPS</h1>
        <p className="text-sm text-slate-600">Téléchargez les fiches EPS pour consultation hors ligne ou impression.</p>
      </div>

      {missingDocs.length > 0 ? (
        <GlassCard className="space-y-2 border-amber-200/70 bg-amber-50/70">
          <p className="text-sm font-medium text-amber-900">DOCX manquants sur GitHub Releases.</p>
          <p className="text-xs text-amber-900/80">Fichiers concernés: {missingDocs.map((m) => m.title).join(", ")}.</p>
          {availableNames.length > 0 ? (
            <p className="text-xs text-amber-900/80">Assets trouvés dans la Release: {availableNames.join(', ')}</p>
          ) : null}
        </GlassCard>
      ) : null}

      <GlassCard className="space-y-2">
        <p className="text-sm text-slate-700">Les fichiers Word sont hébergés dans GitHub Releases pour éviter la limite 100 MB sur Git. Les liens pointent vers la Release la plus récente.</p>
        <p className="text-xs text-slate-500">Si le téléchargement échoue, vérifier que la Release contient les fichiers indiqués.</p>
      </GlassCard>

      <div className="grid gap-3">
        {docsWithInfo.map((doc) => (
          <ReleaseCard
            key={doc.id}
            title={doc.title}
            description={doc.description}
            assetName={doc.assetName}
            releaseUrl={doc.releaseUrl}
            downloadUrl={doc.downloadUrl}
            available={doc.available}
          />
        ))}
      </div>
    </div>
  );
}
