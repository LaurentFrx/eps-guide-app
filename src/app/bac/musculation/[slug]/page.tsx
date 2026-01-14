import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { GlassCard } from "@/components/GlassCard";
import { MarkdownText } from "@/components/MarkdownText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BacCopyLinkButton } from "@/components/bac/BacCopyLinkButton";
import {
  BAC_MUSCULATION_SECTIONS,
  getMusculationDocBySlug,
} from "@/lib/bac/muscuDocs";

const BAC_BASE = "/bac";
const MUSCULATION_SLUG = "musculation";
const BAC_MUSCULATION_PATH = `${BAC_BASE}/${MUSCULATION_SLUG}`;

export default async function BacMusculationDocPage(props: unknown) {
  const { params } = props as { params: { slug: string } | Promise<{ slug: string }> };
  const resolvedParams = await Promise.resolve(params);
  const doc = getMusculationDocBySlug(resolvedParams.slug);
  if (!doc) {
    notFound();
  }

  const section = BAC_MUSCULATION_SECTIONS.find((item) => item.id === doc.sectionId);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="sticky top-0 z-30 -mx-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-[#0b0f1a]/85 px-5 py-3 backdrop-blur">
        <BackButton fallbackHref={BAC_MUSCULATION_PATH} label="Retour Musculation" />
        <Button asChild className="ui-btn-primary">
          <Link href={doc.pdfPath} target="_blank" rel="noreferrer">
            Ouvrir le PDF
          </Link>
        </Button>
      </div>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          {section?.title ?? "Musculation"}
        </p>
        <h1 className="font-display text-3xl font-semibold text-white">
          {doc.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          {doc.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="ui-chip">
              {tag}
            </Badge>
          ))}
        </div>
      </header>

      <GlassCard className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">Résumé</p>
          <BacCopyLinkButton />
        </div>
        <MarkdownText text={doc.summaryMd} />
      </GlassCard>

      <GlassCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">PDF</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" className="ui-chip gap-2">
              <Link href={doc.pdfPath} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Ouvrir le PDF
              </Link>
            </Button>
            <Button asChild variant="outline" className="ui-chip">
              <Link href={BAC_MUSCULATION_PATH}>Retour liste</Link>
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <iframe
            title={`PDF ${doc.title}`}
            src={doc.pdfPath}
            className="h-[70vh] w-full"
          />
        </div>
        <p className="text-sm text-white/60">
          Si le PDF ne s&apos;affiche pas (iOS), utilisez le bouton d&apos;ouverture.
        </p>
      </GlassCard>
    </div>
  );
}
