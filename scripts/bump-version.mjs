import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src", "lib", "version.ts");
const source = fs.readFileSync(filePath, "utf8");

const versionRegex = /APP_VERSION\s*=\s*"(\d+)\.(\d+)\.(\d+)"/;
const match = source.match(versionRegex);

if (!match) {
  console.error("APP_VERSION not found in src/lib/version.ts");
  process.exit(1);
}

const major = Number(match[1]);
const minor = Number(match[2]);
const patch = Number(match[3]);

if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
  console.error("Invalid APP_VERSION format in src/lib/version.ts");
  process.exit(1);
}

const nextVersion = `${major}.${minor}.${patch + 1}`;
const updated = source.replace(versionRegex, `APP_VERSION = \"${nextVersion}\"`);

fs.writeFileSync(filePath, updated);
console.log(`APP_VERSION bumped to ${nextVersion}`);
