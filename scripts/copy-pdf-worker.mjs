import fs from "fs";
import path from "path";

const root = process.cwd();
const candidates = [
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
];
const destination = path.join(root, "public", "pdf.worker.min.mjs");

const resolveSource = () => {
  for (const candidate of candidates) {
    const fullPath = path.join(root, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
};

const source = resolveSource();
if (!source) {
  console.error("pdfjs worker not found in node_modules.");
  process.exit(1);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
console.log(`Copied pdf worker to ${destination}`);
