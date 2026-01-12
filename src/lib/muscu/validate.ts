import {
  EVALUATION_PROFILES,
  KNOWLEDGE_SECTIONS,
  MUSCU_ZONES,
  PROJETS,
  evaluationInfographics,
  evaluationProfiles,
  knowledgeInfographics,
  knowledgeThemes,
  muscuExercises,
  stretches,
} from "@/lib/muscu";
import { PDF_INDEX } from "@/data/pdfIndex";
import { exerciseTagsByCode } from "@/lib/exercises/exerciseTags";

export type ValidationIssue = { scope: string; message: string };

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}/.test(value);

const uniqueIds = (items: { id: string }[]) => {
  const seen = new Set<string>();
  const dupes: string[] = [];
  items.forEach((item) => {
    if (seen.has(item.id)) dupes.push(item.id);
    seen.add(item.id);
  });
  return dupes;
};

const ensureBase = (items: { id: string; title: string; updatedAtISO: string }[]) =>
  items.flatMap((item) => {
    const issues: ValidationIssue[] = [];
    if (!item.id) issues.push({ scope: item.title, message: "missing id" });
    if (!item.title) issues.push({ scope: item.id, message: "missing title" });
    if (!isIsoDate(item.updatedAtISO)) {
      issues.push({ scope: item.id, message: "invalid updatedAtISO" });
    }
    return issues;
  });

export const validateMuscuData = () => {
  const issues: ValidationIssue[] = [];

  uniqueIds(muscuExercises).forEach((id) =>
    issues.push({ scope: "muscuExercises", message: `duplicate id ${id}` })
  );
  uniqueIds(stretches).forEach((id) =>
    issues.push({ scope: "stretches", message: `duplicate id ${id}` })
  );
  uniqueIds(knowledgeThemes).forEach((id) =>
    issues.push({ scope: "knowledgeThemes", message: `duplicate id ${id}` })
  );
  uniqueIds(evaluationProfiles).forEach((id) =>
    issues.push({ scope: "evaluationProfiles", message: `duplicate id ${id}` })
  );
  uniqueIds(knowledgeInfographics).forEach((id) =>
    issues.push({ scope: "knowledgeInfographics", message: `duplicate id ${id}` })
  );
  uniqueIds(evaluationInfographics).forEach((id) =>
    issues.push({
      scope: "evaluationInfographics",
      message: `duplicate id ${id}`,
    })
  );

  issues.push(...ensureBase(muscuExercises));
  issues.push(...ensureBase(stretches));
  issues.push(...ensureBase(knowledgeThemes));
  issues.push(...ensureBase(evaluationProfiles));

  muscuExercises.forEach((item) => {
    if (!MUSCU_ZONES.includes(item.zone)) {
      issues.push({ scope: item.id, message: `invalid zone ${item.zone}` });
    }
    if (!item.projets.length) {
      issues.push({ scope: item.id, message: "missing projets" });
    }
    item.projets.forEach((projet) => {
      if (!PROJETS.includes(projet)) {
        issues.push({ scope: item.id, message: `invalid projet ${projet}` });
      }
    });
    if (!item.targetMuscles.length)
      issues.push({ scope: item.id, message: "missing targetMuscles" });
    if (!item.setup.length) issues.push({ scope: item.id, message: "missing setup" });
    if (!item.cues.length) issues.push({ scope: item.id, message: "missing cues" });
    if (!item.breathing.length)
      issues.push({ scope: item.id, message: "missing breathing" });
    if (!item.mistakes.length)
      issues.push({ scope: item.id, message: "missing mistakes" });
    if (!item.safety.length)
      issues.push({ scope: item.id, message: "missing safety" });
  });

  stretches.forEach((item) => {
    if (!item.target.length)
      issues.push({ scope: item.id, message: "missing target" });
    if (!item.cues.length) issues.push({ scope: item.id, message: "missing cues" });
    if (!item.safety.length)
      issues.push({ scope: item.id, message: "missing safety" });
  });

  knowledgeThemes.forEach((item) => {
    if (!KNOWLEDGE_SECTIONS.includes(item.section)) {
      issues.push({ scope: item.id, message: `invalid section ${item.section}` });
    }
    if (!item.summary)
      issues.push({ scope: item.id, message: "missing summary" });
    if (!item.bullets.length)
      issues.push({ scope: item.id, message: "missing bullets" });
    if (item.imageSrc && !item.alt) {
      issues.push({ scope: item.id, message: "missing alt for imageSrc" });
    }
  });

  evaluationProfiles.forEach((item) => {
    if (!EVALUATION_PROFILES.includes(item.profile)) {
      issues.push({ scope: item.id, message: `invalid profile ${item.profile}` });
    }
    if (!item.sections.length) {
      issues.push({ scope: item.id, message: "missing sections" });
    }
    item.sections.forEach((section, index) => {
      if (!section.title) {
        issues.push({
          scope: item.id,
          message: `missing section title at ${index}`,
        });
      }
      if (!section.bullets.length) {
        issues.push({
          scope: item.id,
          message: `missing section bullets at ${index}`,
        });
      }
    });
  });

  const allInfographics = [...knowledgeInfographics, ...evaluationInfographics];
  allInfographics.forEach((item) => {
    if (!item.src) {
      issues.push({ scope: item.id, message: "missing src" });
    }
    if (!item.alt) {
      issues.push({ scope: item.id, message: "missing alt" });
    }
  });

  return issues;
};

export const validateExerciseTags = () => {
  const issues: ValidationIssue[] = [];
  const exerciseIds = new Set(PDF_INDEX.map((exercise) => exercise.code));
  const allowedTypes = new Set(["Exercice", "Étirement", "Technique", "Séance"]);

  Object.entries(exerciseTagsByCode).forEach(([code, tags]) => {
    if (!exerciseIds.has(code)) {
      issues.push({ scope: "exerciseTags", message: `unknown code ${code}` });
    }
    if (tags.zone && !MUSCU_ZONES.includes(tags.zone)) {
      issues.push({ scope: code, message: `invalid zone ${tags.zone}` });
    }
    if (tags.type && !allowedTypes.has(tags.type)) {
      issues.push({ scope: code, message: `invalid type ${tags.type}` });
    }
    (tags.projets ?? []).forEach((projet) => {
      if (!PROJETS.includes(projet)) {
        issues.push({ scope: code, message: `invalid projet ${projet}` });
      }
    });
  });

  return issues;
};
