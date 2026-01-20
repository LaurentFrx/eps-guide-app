import fs from "node:fs";
import path from "node:path";

const PDF_PATH = path.join(process.cwd(), "public", "muscutazieff.pdf");
const HEADER_BYTES = 5;
const EXPECTED_HEADER = "%PDF-";

const fail = (message: string) => {
  console.error(message);
  process.exit(1);
};

if (!fs.existsSync(PDF_PATH)) {
  fail(`Missing PDF: ${PDF_PATH}`);
}

const fd = fs.openSync(PDF_PATH, "r");
const buffer = Buffer.alloc(HEADER_BYTES);
const bytesRead = fs.readSync(fd, buffer, 0, HEADER_BYTES, 0);
fs.closeSync(fd);

if (bytesRead < HEADER_BYTES) {
  fail(`PDF too short: ${PDF_PATH} (${bytesRead} bytes read)`);
}

const header = buffer.toString("utf8");
if (header !== EXPECTED_HEADER) {
  fail(
    `Invalid PDF header for ${PDF_PATH}. Expected "${EXPECTED_HEADER}", got "${header}".` +
      " If this is a Git LFS pointer, enable LFS in CI/Vercel."
  );
}

console.log(`PDF header OK: ${PDF_PATH}`);
