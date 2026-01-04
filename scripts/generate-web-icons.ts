import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "assets", "branding", "logo-eps.png");
const OUTPUT_DIR = path.join(ROOT, "public");

const TARGETS = [
  { name: "icon-512.png", size: 512 },
  { name: "icon-192.png", size: 192 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-16.png", size: 16 },
];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const ensureSource = async () => {
  try {
    await fs.access(SOURCE);
  } catch {
    throw new Error(`Source icon not found: ${SOURCE}`);
  }
};

const generate = async () => {
  await ensureSource();
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const base = sharp(SOURCE, { failOnError: true }).withMetadata();

  for (const target of TARGETS) {
    const outputPath = path.join(OUTPUT_DIR, target.name);
    await base
      .clone()
      .resize(target.size, target.size, {
        fit: "contain",
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    console.log(
      `Generated ${path.relative(ROOT, outputPath)} (${target.size}x${target.size}, ${formatBytes(
        stats.size
      )})`
    );
  }
};

generate().catch((error) => {
  console.error("Icon generation failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
