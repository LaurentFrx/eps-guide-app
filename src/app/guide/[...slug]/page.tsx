import { notFound } from "next/navigation";
import { GuideSectionClient } from "@/components/GuideSectionClient";
import { getMuscutazieffSection } from "@/content/muscutazieffMap";

const PDF_URL = "/muscutazieff.pdf";

type GuideSectionParams = { slug?: string[] };

const decodeSlug = (parts: string[]) =>
  parts
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        return part;
      }
    })
    .join("/");

export default async function GuideSectionPage(props: unknown) {
  const { params } = props as {
    params?: GuideSectionParams | Promise<GuideSectionParams>;
  };
  const resolvedParams = await Promise.resolve(params ?? {});
  const slugParts = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug
    : [];
  const slug = decodeSlug(slugParts);
  const section = slug ? getMuscutazieffSection(slug) : undefined;
  if (!section) {
    notFound();
  }

  return <GuideSectionClient section={section} fileUrl={PDF_URL} />;
}
