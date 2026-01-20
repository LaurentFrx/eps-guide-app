import Link from "next/link";

export default function GuideSectionNotFound() {
  return (
    <div className="space-y-4 pb-8">
      <p className="text-xs uppercase tracking-widest text-white/55">Guide</p>
      <h1 className="font-display text-3xl font-semibold text-white">
        Section introuvable
      </h1>
      <p className="text-sm text-white/70">
        Cette section n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/guide" className="ui-link text-sm font-medium">
        Retour au sommaire
      </Link>
    </div>
  );
}
