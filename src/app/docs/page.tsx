import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

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

export default function DocsPage() {
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

      <div className="grid gap-3">
        {docs.map((doc) => (
          <GlassCard
            key={doc.id}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                {doc.title}
              </p>
              <p className="text-sm text-slate-600">{doc.description}</p>
            </div>
            <Button asChild variant="outline">
              <a href={doc.href} download>
                Télécharger {doc.title}
              </a>
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
