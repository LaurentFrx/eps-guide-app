"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";

type PdfSectionViewerProps = {
  fileUrl: string;
  startPage: number;
  endPage: number;
  title: string;
  onPageChange?: (page: number) => void;
};

type PdfHealthState = {
  state: "loading" | "ok" | "error";
  status?: number;
  contentType?: string;
  snippet?: string;
  message?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isPdfContentType = (value: string) =>
  value.toLowerCase().includes("application/pdf");

const formatSnippet = (value: string) =>
  value.replace(/\s+/g, " ").trim().slice(0, 80);

const buildHealthMessage = (status?: number, contentType?: string) => {
  if (status === 404) {
    return "PDF introuvable (404) : verifiez public/muscutazieff.pdf.";
  }
  if (status === 401 || status === 403) {
    return "Acces refuse (auth Vercel) : desactivez la protection preview ou autorisez les assets.";
  }
  if (contentType && !isPdfContentType(contentType)) {
    return `Reponse non-PDF (content-type=${contentType || "inconnu"}).`;
  }
  if (status && status >= 500) {
    return `Erreur serveur (status ${status}).`;
  }
  if (status && status !== 200 && status !== 206) {
    return `Erreur serveur (status ${status}).`;
  }
  return "Impossible de charger le PDF.";
};

export function PdfSectionViewer({
  fileUrl,
  startPage,
  endPage,
  title,
  onPageChange,
}: PdfSectionViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [health, setHealth] = useState<PdfHealthState>({ state: "loading" });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }, []);

  const range = useMemo(() => {
    const min = Math.min(startPage, endPage);
    const max = Math.max(startPage, endPage);
    return { min, max };
  }, [startPage, endPage]);

  const rangeKey = useMemo(
    () => `${fileUrl}:${range.min}:${range.max}`,
    [fileUrl, range.min, range.max]
  );
  const [pageState, setPageState] = useState(() => ({
    key: rangeKey,
    value: range.min,
  }));
  const pageNumber =
    pageState.key === rangeKey ? pageState.value : range.min;
  const maxPage = numPages ? Math.min(range.max, numPages) : range.max;
  const clampedPage = clamp(pageNumber, range.min, maxPage);
  const sectionCount = maxPage - range.min + 1;
  const sectionIndex = clampedPage - range.min + 1;
  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent ?? "";
    const isAppleMobile = /iPad|iPhone|iPod/i.test(ua);
    const isIpadOS =
      navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return isAppleMobile || isIpadOS;
  }, []);
  const fallbackUrl = useMemo(
    () => `${fileUrl}#page=${clampedPage}`,
    [fileUrl, clampedPage]
  );
  const shouldFallback = isIOS || Boolean(viewerError);
  const shouldShowDiagnostics = health.state === "error" || Boolean(viewerError);

  useEffect(() => {
    onPageChange?.(clampedPage);
  }, [clampedPage, onPageChange]);

  useEffect(() => {
    const target = containerRef.current;
    if (!target || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    let active = true;
    const setSafe = (next: PdfHealthState) => {
      if (active) setHealth(next);
    };

    const checkPdf = async () => {
      setSafe({ state: "loading" });
      setViewerError(null);
      try {
        const headRes = await fetch(fileUrl, {
          method: "HEAD",
          cache: "no-store",
          credentials: "include",
        });
        let status = headRes.status;
        let contentType = headRes.headers.get("content-type") ?? "";
        if (headRes.ok && isPdfContentType(contentType)) {
          setSafe({ state: "ok", status, contentType });
          return;
        }

        const rangeRes = await fetch(fileUrl, {
          method: "GET",
          headers: { Range: "bytes=0-255" },
          cache: "no-store",
          credentials: "include",
        });
        status = rangeRes.status;
        contentType = rangeRes.headers.get("content-type") ?? "";
        if ((status === 200 || status === 206) && isPdfContentType(contentType)) {
          setSafe({ state: "ok", status, contentType });
          return;
        }

        let snippet = "";
        if (!isPdfContentType(contentType)) {
          try {
            const text = await rangeRes.text();
            snippet = formatSnippet(text);
          } catch {
            snippet = "";
          }
        }

        setSafe({
          state: "error",
          status,
          contentType,
          snippet,
          message: buildHealthMessage(status, contentType),
        });
      } catch {
        setSafe({
          state: "error",
          message: "Erreur reseau : impossible de joindre le PDF.",
        });
      }
    };

    checkPdf();
    return () => {
      active = false;
    };
  }, [fileUrl]);

  const zoomIn = () => setScale((prev) => clamp(prev + 0.1, 0.8, 1.6));
  const zoomOut = () => setScale((prev) => clamp(prev - 0.1, 0.8, 1.6));

  const toggleFullscreen = async () => {
    const node = containerRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (node.requestFullscreen) {
      await node.requestFullscreen();
    }
  };

  const pageWidth = containerWidth
    ? Math.floor(containerWidth * scale)
    : undefined;

  return (
    <div ref={containerRef} className="ui-card space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/55">
            Lecture
          </p>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="ui-chip min-h-10 min-w-10"
            onClick={() =>
              setPageState({
                key: rangeKey,
                value: clamp(pageNumber - 1, range.min, maxPage),
              })
            }
            disabled={clampedPage <= range.min}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-white/70">
            {sectionIndex} / {sectionCount}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="ui-chip min-h-10 min-w-10"
            onClick={() =>
              setPageState({
                key: rangeKey,
                value: clamp(pageNumber + 1, range.min, maxPage),
              })
            }
            disabled={clampedPage >= maxPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="ui-chip min-h-10 min-w-10"
            onClick={zoomOut}
            aria-label="Zoom moins"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="ui-chip min-h-10 min-w-10"
            onClick={zoomIn}
            aria-label="Zoom plus"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="ui-chip min-h-10 min-w-10"
            onClick={toggleFullscreen}
            aria-label="Plein ecran"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        {health.state === "loading" ? (
          <div className="p-6 text-sm text-white/70">
            Verification du PDF...
          </div>
        ) : health.state === "error" ? (
          <div className="space-y-3 p-6 text-sm text-amber-200/90">
            <p>{health.message ?? "Impossible de charger le PDF."}</p>
            <Button asChild className="ui-btn-primary ui-pressable">
              <a href={fallbackUrl} target="_blank" rel="noreferrer">
                Ouvrir le PDF
              </a>
            </Button>
          </div>
        ) : shouldFallback ? (
          <div className="space-y-3 p-4">
            <p className="text-sm text-white/70">
              Affichage natif du PDF pour iOS ou en cas d erreur.
            </p>
            <Button asChild className="ui-btn-primary ui-pressable">
              <a href={fallbackUrl} target="_blank" rel="noreferrer">
                Ouvrir le PDF
              </a>
            </Button>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <iframe
                title="muscutazieff-pdf"
                src={fallbackUrl}
                className="h-[70vh] w-full"
              />
            </div>
          </div>
        ) : (
          <Document
            file={fileUrl}
            loading={<div className="p-6 text-sm text-white/70">Chargement...</div>}
            error={
              <div className="p-6 text-sm text-amber-200/90">
                Impossible de charger le PDF.
              </div>
            }
            options={{ withCredentials: true }}
            onLoadSuccess={(data) => {
              setNumPages(data.numPages);
              setViewerError(null);
            }}
            onLoadError={(error) => setViewerError(error.message)}
            onSourceError={(error) => setViewerError(error.message)}
          >
            <Page
              pageNumber={clampedPage}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>

      {shouldShowDiagnostics ? (
        <div className="space-y-1 text-xs text-amber-200/80">
          <p>URL: {fileUrl}</p>
          <p>Status: {health.status ?? "n/a"}</p>
          <p>Content-Type: {health.contentType ?? "n/a"}</p>
          {health.snippet ? <p>Extrait: {health.snippet}</p> : null}
          {viewerError ? <p>Erreur viewer: {viewerError}</p> : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between text-xs text-white/60">
        <span>
          Page {sectionIndex} / {sectionCount} (PDF {clampedPage})
        </span>
        <span>Zoom {Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
}
