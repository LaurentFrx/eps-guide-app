#!/usr/bin/env node
/* tools/generate-icons.js - Generate icon variants from source PNG */
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

const sourceIcon = path.join(process.cwd(), 'assets', 'branding', 'app-icon-fp-1024.png');
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(sourceIcon)) {
  console.error(`Source icon not found: ${sourceIcon}`);
  process.exit(1);
}

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icons/icon-192.png', size: 192 },
  { name: 'icons/icon-512.png', size: 512 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

(async () => {
  let generated = 0;
  let errors = 0;

  for (const { name, size } of sizes) {
    const outPath = path.join(publicDir, name);
    const outDir = path.dirname(outPath);

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    try {
      await sharp(sourceIcon)
        .resize(size, size, { fit: 'cover' })
        .toFile(outPath);
      console.log(`✓ Generated: ${name} (${size}x${size})`);
      generated++;
    } catch (e) {
      console.error(`✗ Error generating ${name}:`, e instanceof Error ? e.message : String(e));
      errors++;
    }
  }

  console.log(`\nSummary: Generated ${generated}, Errors ${errors}`);
  process.exit(errors ? 1 : 0);
})();
