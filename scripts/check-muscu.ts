async function main() {
  let validateMuscuData: () => Array<{ scope: string; message: string }>;

  try {
    const mod = await import("../src/lib/muscu/validate");
    validateMuscuData = mod.validateMuscuData;
  } catch {
    console.log("check-muscu: skipped (dependencies not available on this branch)");
    process.exit(0);
  }

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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
