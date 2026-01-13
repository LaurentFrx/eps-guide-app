import { validateMuscuData } from "../src/lib/muscu/validate";

const issues = validateMuscuData();

if (!issues.length) {
  console.log("Muscu data check passed.");
  process.exit(0);
}

console.error(`Muscu data check failed (${issues.length}).`);
issues.forEach((issue) => {
  console.error(`- ${issue.scope}: ${issue.message}`);
});
process.exit(1);
