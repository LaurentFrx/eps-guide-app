// src/lib/exercises.ts
import fs from "fs";
import path from "path";
import { PDF_INDEX, cleanPdfTitle, type PdfIndexItem } from "@/data/pdfIndex";
import { allExercises, type ExerciseWithSession } from "@/lib/exercise-data";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import type { ExerciseStatus } from "@/lib/exerciseStatus";
import { getExerciseHeroSrcOrFallback } from "@/lib/exerciseAssets";
import { editorialByCode } from "@/lib/editorial.generated";

export type Session = {
  id: "S1" | "S2" | "S3" | "S4" | "S5";
  title: string;
  subtitle: string;
  exerciseCount: number;
  accent: string; // CSS color token or hex
  heroImage: string; // public path
  reperePedagogiques: string[];
};

export type Exercise = {
  id: string;
  sessionId: Session["id"];
  title: string;
  subtitleEn?: string;
  level: string;
  image: string;
  objectif: string;
  materiel: string;
  anatomie: { muscles: string; fonction: string };
  techniquePoints: string[];
  securitePoints: string[];
  progression: { regression: string; progression: string };
  dosage: string;
  status?: ExerciseStatus;
  materielMd?: string;
  consignesMd?: string;
  dosageMd?: string;
  securiteMd?: string;
  detailMd?: string;
  fullMdRaw?: string;
};

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_EXTS = [".webp", ".avif", ".jpg", ".jpeg", ".png", ".svg"];
const FALLBACK_IMAGE = "/exercises/fallback.svg";
const PLACEHOLDER_TEXT = "Contenu a completer";

function resolvePublicImagePath(preferred: string) {
  const normalized = preferred.replace(/^\/+/, "");
  const absPreferred = path.join(PUBLIC_DIR, normalized);
  if (fs.existsSync(absPreferred)) return preferred;

  const ext = path.extname(preferred);
  const base = ext ? preferred.slice(0, -ext.length) : preferred;

  for (const candidateExt of IMAGE_EXTS) {
    const candidate = `${base}${candidateExt}`;
    const abs = path.join(PUBLIC_DIR, candidate.replace(/^\/+/, ""));
    if (fs.existsSync(abs)) return candidate;
  }

  return preferred;
}

function resolveExerciseImage(code: string): string {
  return getExerciseHeroSrcOrFallback(code, FALLBACK_IMAGE);
}

const sessionsBase: Array<Omit<Session, "exerciseCount">> = [
  {
    id: "S1",
    title: "Pr‚paration g‚n‚rale",
    subtitle: "S1 - Mobilit‚, gainage et maŒtrise du mouvement",
    accent: "var(--s1)",
    heroImage: "/exercises/S1/hero.jpg",
    reperePedagogiques: [
      "Posture active",
      "Respiration maŒtris‚e",
      "Alignement segmentaire",
    ],
  },
  {
    id: "S2",
    title: "Force et explosivit‚",
    subtitle: "S2 - Travail de pouss‚e, tirage et saut",
    accent: "var(--s2)",
    heroImage: "/exercises/S2/hero.jpg",
    reperePedagogiques: ["ChaŒne musculaire du membre sup‚rieur", "Appui podal"],
  },
  {
    id: "S3",
    title: "Endurance et enchaŒnements",
    subtitle: "S3 - Cardio, circuit et rythme",
    accent: "var(--s3)",
    heroImage: "/exercises/S3/hero.jpg",
    reperePedagogiques: ["Gestion de l'effort", "Rythme et r‚cup‚ration"],
  },
  {
    id: "S4",
    title: "Coordination et agilit‚",
    subtitle: "S4 - Change of direction, ‚quilibre",
    accent: "var(--s4)",
    heroImage: "/exercises/S4/hero.jpg",
    reperePedagogiques: ["Contr“le sensoriel", "Changement d'appui"],
  },
  {
    id: "S5",
    title: "Performance avanc‚e",
    subtitle: "S5 - Puissance et situations complexes",
    accent: "var(--s5)",
    heroImage: "/exercises/S5/hero.jpg",
    reperePedagogiques: ["Analyse technique", "Automatisation"],
  },
];

const detailByCode = new Map<string, ExerciseWithSession>(
  allExercises.map((exercise) => [normalizeExerciseCode(exercise.code), exercise])
);

function toExercise(entry: PdfIndexItem): Exercise {
  const normalized = normalizeExerciseCode(entry.code);
  const detail = detailByCode.get(normalized);
  const title = detail?.title ?? cleanPdfTitle(entry.title) ?? `Exercice ${normalized}`;
  const image = resolveExerciseImage(normalized);
  const editorial = editorialByCode[normalized];

  const exercise: Exercise = {
    id: normalized,
    sessionId: entry.series as Session["id"],
    title,
    subtitleEn: undefined,
    level: detail?.level ?? "A definir",
    image,
    objectif: detail?.objective ?? PLACEHOLDER_TEXT,
    materiel: detail?.equipment ?? PLACEHOLDER_TEXT,
    anatomie: {
      muscles: detail?.muscles ?? PLACEHOLDER_TEXT,
      fonction: detail?.anatomy ?? PLACEHOLDER_TEXT,
    },
    techniquePoints: detail?.key_points?.length ? detail.key_points : [],
    securitePoints: detail?.safety?.length ? detail.safety : [],
    progression: {
      regression: detail?.regress ?? PLACEHOLDER_TEXT,
      progression: detail?.progress ?? PLACEHOLDER_TEXT,
    },
    dosage: detail?.dosage ?? PLACEHOLDER_TEXT,
    materielMd: editorial?.materielMd,
    consignesMd: editorial?.consignesMd,
    dosageMd: editorial?.dosageMd,
    securiteMd: editorial?.securiteMd,
    detailMd: editorial?.detailMd,
    fullMdRaw: editorial?.fullMdRaw,
  };

  exercise.status = detail ? "ready" : "draft";
  return exercise;
}

export const exercises: Exercise[] = PDF_INDEX.map(toExercise);

type HeroFallback = { id: string; image: string };
const heroFallbackBySession: Partial<Record<Session["id"], HeroFallback>> = {};
const heroIdCollator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

for (const exercise of exercises) {
  const current = heroFallbackBySession[exercise.sessionId];
  if (!current || heroIdCollator.compare(exercise.id, current.id) < 0) {
    heroFallbackBySession[exercise.sessionId] = { id: exercise.id, image: exercise.image };
  }
}

export const sessions: Session[] = sessionsBase.map((s) => ({
  ...s,
  heroImage:
    s.heroImage && s.heroImage.trim().length
      ? resolvePublicImagePath(s.heroImage)
      : (heroFallbackBySession[s.id]?.image ?? FALLBACK_IMAGE),
  exerciseCount: exercises.filter((e) => e.sessionId === s.id).length,
}));

export default exercises;
