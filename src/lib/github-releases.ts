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

export async function fetchLatestRelease(owner: string, repo: string): Promise<ReleaseInfo | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      tag_name: data.tag_name,
      html_url: data.html_url,
      name: data.name ?? null,
      assets: Array.isArray(data.assets) ? data.assets.map((a: any) => ({
        id: a.id,
        name: a.name,
        browser_download_url: a.browser_download_url,
        size: a.size,
      })) : [],
    };
  } catch (e) {
    return null;
  }
}

export function findAsset(release: ReleaseInfo | null, assetName: string) {
  if (!release) return null;
  return release.assets.find((a) => a.name === assetName) ?? null;
}
