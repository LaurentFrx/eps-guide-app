import fs from "fs";
import path from "path";
import { exerciseTagsByCode } from "@/lib/exercises/exerciseTags";

type PdfIndexItem = { code: string };

const pdfIndexPath = path.join(process.cwd(), "src/data/pdfIndex.json");
const raw = fs.readFileSync(pdfIndexPath, "utf8");
const pdfIndex = JSON.parse(raw) as PdfIndexItem[];

const codes = pdfIndex.map((item) => item.code).sort();
const missing = codes.filter((code) => !exerciseTagsByCode[code]);

if (missing.length === 0) {
  console.log("EPS tags check passed.");
  process.exit(0);
}

console.error(`EPS tags missing for ${missing.length} codes.`);
missing.forEach((code) => console.error(`- ${code}`));
process.exit(1);
