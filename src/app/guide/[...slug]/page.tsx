import { notFound } from "next/navigation";
import { GuideSectionClient } from "@/components/GuideSectionClient";
import { getMuscutazieffSection } from "@/content/muscutazieffMap";

const PDF_URL = "/muscutazieff.pdf";

export default async function GuideSectionPage(props: unknown) {
  const { params } = props as {
    params: { slug?: string[] } | Promise<{ slug?: string[] }>;
  };
  const resolvedParams = await Promise.resolve(params);
  const slug = (resolvedParams.slug ?? []).join("/");
  const section = getMuscutazieffSection(slug);
  if (!section) {
    notFound();
  }

  return <GuideSectionClient section={section} fileUrl={PDF_URL} />;
}
