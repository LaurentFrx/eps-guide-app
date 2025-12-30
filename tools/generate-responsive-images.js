/* tools/generate-responsive-images.js */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('sharp is not installed. Run `npm ci` or `npm install --save-dev sharp`.');
  process.exit(1);
}

const cfgPath = path.join(process.cwd(), 'tools', 'image-config.json');
if (!fs.existsSync(cfgPath)) {
  console.error('Missing tools/image-config.json');
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const inputDir = path.join(process.cwd(), cfg.inputDir);
const outputDir = path.join(process.cwd(), cfg.outputDir);
const widths = cfg.widths || [480,768,1080,1440];
const formats = cfg.formats || ['webp','avif'];
const quality = cfg.quality || { webp:75, avif:50 };

const SUPPORTED = new Set(['.jpg','.jpeg','.png','.webp']);

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function* walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* walk(full);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (SUPPORTED.has(ext)) yield full;
    }
  }
}

(async () => {
  if (!fs.existsSync(inputDir)) {
    console.log(`Input dir ${cfg.inputDir} does not exist — nothing to do.`);
    process.exit(0);
  }

  ensureDir(outputDir);

  let sources = 0;
  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for await (const filePath of walk(inputDir)) {
    sources++;
    const rel = path.relative(inputDir, filePath);
    const parsed = path.parse(rel);
    const srcFull = filePath;
    let meta;
    try {
      meta = await sharp(srcFull).metadata();
    } catch (e) {
      console.error('Error reading metadata for', srcFull, e.message);
      errors++;
      continue;
    }
    const srcWidth = meta.width || Math.max(...widths);

    for (const w of widths) {
      if (w > srcWidth) continue;
      for (const fmt of formats) {
        const outRelDir = path.join(outputDir, parsed.dir);
        ensureDir(outRelDir);
        const outName = `${parsed.name}.${w}.${fmt}`;
        const outPath = path.join(outRelDir, outName);
        if (fs.existsSync(outPath)) {
          skipped++;
          continue;
        }
        try {
          let p = sharp(srcFull).resize(w);
          if (fmt === 'webp') p = p.webp({ quality: quality.webp || 75 });
          else if (fmt === 'avif') p = p.avif({ quality: quality.avif || 50 });
          await p.toFile(outPath);
          generated++;
        } catch (e) {
          console.error('Error generating', outPath, e.message);
          errors++;
        }
      }
    }
  }

  console.log(`Sources: ${sources}, Generated: ${generated}, Skipped: ${skipped}, Errors: ${errors}`);
  process.exit(errors ? 2 : 0);
})();
