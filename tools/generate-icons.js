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

const sourceIconCandidates = [
  {
    path: path.join(process.cwd(), 'assets', 'branding', 'EPS-AppIcon-Master-1024.png'),
    isMaster: true,
  },
  {
    path: path.join(process.cwd(), 'assets', 'branding', 'EPS-AppIcon-Master-1024_RGB.png'),
    isMaster: true,
  },
  {
    path: path.join(process.cwd(), 'assets', 'branding', 'logo-eps.png'),
    isMaster: false,
  },
  {
    path: path.join(process.cwd(), 'assets', 'branding', 'icon-512.png'),
    isMaster: false,
  },
  {
    path: path.join(process.cwd(), 'public', 'logo-eps.png'),
    isMaster: false,
  },
  {
    path: path.join(process.cwd(), 'public', 'icon-512.png'),
    isMaster: false,
  },
];
const sourceIconEntry = sourceIconCandidates.find((candidate) => fs.existsSync(candidate.path));
const publicDir = path.join(process.cwd(), 'public');

if (!sourceIconEntry) {
  console.error(
    `Source icon not found. Checked: ${sourceIconCandidates
      .map((candidate) => candidate.path)
      .join(", ")}`
  );
  process.exit(1);
}

const sourceIcon = sourceIconEntry.path;
if (!sourceIconEntry.isMaster) {
  console.warn(
    `WARNING: Using fallback source icon (${sourceIcon}). Quality may be lower than master 1024.`
  );
}

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
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

  const logoSourceCandidates = [
    path.join(process.cwd(), 'assets', 'branding', 'logo-eps.png'),
    path.join(process.cwd(), 'public', 'logo-eps.png'),
  ];
  const logoSource = logoSourceCandidates.find((candidate) => fs.existsSync(candidate));
  if (logoSource) {
    const logoDest = path.join(publicDir, 'logo-eps.png');
    if (path.resolve(logoSource) !== path.resolve(logoDest)) {
      try {
        fs.copyFileSync(logoSource, logoDest);
        console.log('V Copied: logo-eps.png');
      } catch (e) {
        console.error(
          '? Error copying logo-eps.png:',
          e instanceof Error ? e.message : String(e)
        );
        errors++;
      }
    }
  }

  console.log(`\nSummary: Generated ${generated}, Errors ${errors}`);
  process.exit(errors ? 1 : 0);
})();
