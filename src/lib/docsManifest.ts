export type DocAsset = {
  id: string;
  title: string;
  description: string;
  assetName: string;
};

export const DOCS_OWNER = "LaurentFrx";
export const DOCS_REPO = "eps-guide-app";

export const docs: DocAsset[] = [
  {
    id: "eps-1",
    title: "EPS 1",
    description: "Fiche d'exercices EPS 1 au format Word.",
    assetName: "eps-1.docx",
  },
  {
    id: "eps-2",
    title: "EPS 2",
    description: "Fiche d'exercices EPS 2 au format Word.",
    assetName: "eps-2.docx",
  },
];

export function getDocDownloadUrl(assetName: string) {
  return `https://github.com/${DOCS_OWNER}/${DOCS_REPO}/releases/latest/download/${assetName}`;
}
