import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

const docs = [
  {
    id: "eps-1",
    title: "EPS 1",
    description: "Fiche d'exercices EPS 1 au format Word.",
    href: "https://github.com/LaurentFrx/eps-guide-app/releases/latest/download/eps-1.docx",
  },
  {
    id: "eps-2",
    title: "EPS 2",
    description: "Fiche d'exercices EPS 2 au format Word.",
    href: "https://github.com/LaurentFrx/eps-guide-app/releases/latest/download/eps-2.docx",
  },
];

const releasePage =
  "https://github.com/LaurentFrx/eps-guide-app/releases/latest";

const checkAvailability = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
    });
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
};

export default async function DocsPage() {
  const docsWithAvailability = await Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      available: await checkAvailability(doc.href),
    }))
  );
  const missingDocs = docsWithAvailability.filter((doc) => !doc.available);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Documents
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Fiches EPS
        </h1>
        <p className="text-sm text-slate-600">
          Téléchargez les fiches EPS pour consultation hors ligne ou impression.
        </p>
      </div>

      {missingDocs.length > 0 ? (
        <GlassCard className="space-y-2 border-amber-200/70 bg-amber-50/70">
          <p className="text-sm font-medium text-amber-900">
            DOCX manquants sur GitHub Releases.
          </p>
          <p className="text-xs text-amber-900/80">
            Fichiers concernés:{" "}
            {missingDocs.map((doc) => doc.title).join(", ")}.
          </p>
        </GlassCard>
      ) : null}

      <GlassCard className="space-y-2">
        <p className="text-sm text-slate-700">
          Les fichiers Word sont hébergés dans GitHub Releases pour éviter la
          limite 100 MB sur Git. Les liens utilisent
          /releases/latest/download/…
        </p>
        <p className="text-xs text-slate-500">
          Si le téléchargement échoue, vérifier que la Release contient
          eps-1.docx et eps-2.docx.
        </p>
      </GlassCard>

      <div className="grid gap-3">
        {docsWithAvailability.map((doc) => (
          <GlassCard
            key={doc.id}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                {doc.title}
              </p>
              <p className="text-sm text-slate-600">{doc.description}</p>
              <p className="text-xs text-slate-500">
                Taille: Téléchargement via GitHub Releases
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button asChild variant="outline">
                <a href={doc.href} download>
                  Télécharger {doc.title}
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href={releasePage} target="_blank" rel="noreferrer">
                  Voir sur GitHub
                </a>
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
