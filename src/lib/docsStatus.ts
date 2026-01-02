import { docs, getDocDownloadUrl } from "@/lib/docsManifest";

export type DocsStatus = "ok" | "missing" | "unknown";

const REVALIDATE_SECONDS = 3600;
const TIMEOUT_MS = 6000;

async function probeUrl(url: string): Promise<DocsStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (res.status >= 200 && res.status < 300) return "ok";
    if (res.status === 404) return "missing";

    res = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      redirect: "follow",
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (res.status === 404) return "missing";
    if (res.status === 200 || res.status === 206 || res.status === 416) {
      const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
      const contentDisposition = res.headers.get("content-disposition")?.toLowerCase() ?? "";
      const hasAttachment =
        contentDisposition.includes("attachment") ||
        contentDisposition.includes("filename=");
      if (contentType.includes("text/html") && !hasAttachment) return "unknown";
      return "ok";
    }

    return "unknown";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

export async function getDocsStatus(): Promise<DocsStatus> {
  if (docs.length === 0) return "unknown";
  const results = await Promise.all(
    docs.map((doc) => probeUrl(getDocDownloadUrl(doc.assetName)))
  );

  if (results.includes("missing")) return "missing";
  if (results.every((r) => r === "ok")) return "ok";
  return "unknown";
}
