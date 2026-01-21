"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { BookmarkCheck, BookmarkPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MuscuSection } from "@/content/muscutazieffMap";
import { useGuideBookmarks } from "@/lib/guideBookmarks";

const PdfSectionViewer = dynamic(
  () => import("@/ui/PdfSectionViewer").then((mod) => mod.PdfSectionViewer),
  {
    ssr: false,
    loading: () => (
      <div className="ui-card p-4 text-sm text-white/70">
        Chargement du PDF...
      </div>
    ),
  }
);

type GuideSectionClientProps = {
  section: MuscuSection;
  fileUrl: string;
};

export function GuideSectionClient({ section, fileUrl }: GuideSectionClientProps) {
  const [page, setPage] = useState(section.startPage);
  const { saveBookmark, removeBookmark, isBookmarked } = useGuideBookmarks();
  const bookmarked = isBookmarked(section.route);

  const handleSave = () => {
    saveBookmark({
      route: section.route,
      page,
      title: section.title,
      accent: section.accent,
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <Link href="/guide" className="ui-link text-sm font-medium">
        Retour au guide
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/55">
            Muscu&apos;Tazieff
          </p>
          <h1 className="font-display text-3xl font-semibold text-white">
            {section.title}
          </h1>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="ui-chip px-3 py-1">
              Pages {section.startPage}-{section.endPage}
            </span>
            {section.subtitle ? (
              <span className="ui-chip px-3 py-1">{section.subtitle}</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="ui-btn-primary"
            onClick={handleSave}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <BookmarkPlus className="h-4 w-4" />
            )}
            {bookmarked ? "Mis à jour" : "Enregistrer"}
          </Button>
          {bookmarked ? (
            <Button
              type="button"
              variant="secondary"
              className="ui-chip"
              onClick={() => removeBookmark(section.route)}
            >
              <Trash2 className="h-4 w-4" />
              Retirer
            </Button>
          ) : null}
        </div>
      </div>

      <PdfSectionViewer
        fileUrl={fileUrl}
        startPage={section.startPage}
        endPage={section.endPage}
        title={section.title}
        onPageChange={setPage}
      />
    </div>
  );
}
