/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const REQUIRED_TYPES = ["react", "react-dom", "next", "node"];
const TS_CONFIG = path.join(process.cwd(), "tsconfig.json");

const readJson = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
};

const main = () => {
  if (!fs.existsSync(TS_CONFIG)) {
    console.error("tsconfig.json not found.");
    process.exit(1);
  }

  const config = readJson(TS_CONFIG);
  const types = config?.compilerOptions?.types;

  if (types === undefined) {
    console.log("✓ tsconfig types ok (types not specified)");
    return;
  }

  if (!Array.isArray(types)) {
    console.error(
      `tsconfig compilerOptions.types must be an array. Found: ${typeof types}`
    );
    process.exit(1);
  }

  const missing = REQUIRED_TYPES.filter((value) => !types.includes(value));
  if (missing.length) {
    console.error(
      [
        "tsconfig compilerOptions.types is missing required entries.",
        `Found: ${JSON.stringify(types)}`,
        `Required: ${JSON.stringify(REQUIRED_TYPES)}`,
      ].join("\n")
    );
    process.exit(1);
  }

  console.log("✓ tsconfig types ok");
};

main();
