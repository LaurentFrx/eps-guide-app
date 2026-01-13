import { BAC_MUSCULATION_DOCS } from "../src/lib/bac/musculationDocs";

const EXPECTED_COUNT = 17;

const uniqueSlugs = new Set(BAC_MUSCULATION_DOCS.map((doc) => doc.slug));

if (BAC_MUSCULATION_DOCS.length !== EXPECTED_COUNT) {
  console.error(
    `Expected ${EXPECTED_COUNT} musculation docs, got ${BAC_MUSCULATION_DOCS.length}.`
  );
  process.exit(1);
}

if (uniqueSlugs.size !== BAC_MUSCULATION_DOCS.length) {
  console.error("Duplicate musculation doc slugs detected.");
  process.exit(1);
}

console.log("Bac musculation docs check passed.");
