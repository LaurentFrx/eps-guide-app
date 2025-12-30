export type ReleaseAsset = {
  id: number;
  name: string;
  browser_download_url: string;
  size: number;
};

export type ReleaseInfo = {
  tag_name: string;
  html_url: string;
  name: string | null;
  assets: ReleaseAsset[];
};

export type FetchResult = {
  release: ReleaseInfo | null;
  status: number | null;
  error?: string | null;
};

export async function fetchLatestRelease(owner: string, repo: string): Promise<FetchResult> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_ACCESS_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { cache: "no-store", headers });
    if (!res.ok) {
      return { release: null, status: res.status, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const assets: ReleaseAsset[] = Array.isArray(data.assets)
      ? (data.assets as unknown[])
          .map((a) => {
            if (typeof a !== "object" || a === null) return null;
            const aa = a as Record<string, unknown>;
            return {
              id: Number(aa.id),
              name: String(aa.name ?? ""),
              browser_download_url: String(aa.browser_download_url ?? ""),
              size: Number(aa.size ?? 0),
            };
          })
          .filter((x): x is ReleaseAsset => x !== null)
      : [];

    const release: ReleaseInfo = {
      tag_name: data.tag_name,
      html_url: data.html_url,
      name: data.name ?? null,
      assets,
    };
    return { release, status: res.status, error: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { release: null, status: null, error: msg };
  }
}

export function findAsset(release: ReleaseInfo | null, assetName: string) {
  if (!release) return null;
  const target = assetName.toLowerCase();
  // match case-insensitively
  return release.assets.find((a) => a.name.toLowerCase() === target) ?? null;
}

export function listAssetNames(release: ReleaseInfo | null) {
  if (!release) return [] as string[];
  return release.assets.map((a) => a.name);
}
