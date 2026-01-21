const PDF_URL = "/muscutazieff.pdf";

export default function DebugPdfPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-white/55">
          Debug
        </p>
        <h1 className="text-2xl font-semibold text-white">PDF check</h1>
        <p className="text-sm text-white/70">URL: {PDF_URL}</p>
      </div>
      <a
        className="ui-link text-sm font-medium"
        href={PDF_URL}
        target="_blank"
        rel="noreferrer"
      >
        Ouvrir le PDF
      </a>
      <div className="ui-card overflow-hidden">
        <iframe
          title="muscutazieff-pdf"
          src={PDF_URL}
          className="h-[70vh] w-full"
        />
      </div>
    </div>
  );
}
