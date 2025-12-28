#!/usr/bin/env python3
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DOCS = [
    (ROOT / "../../source_docs/EPS-1.docx").resolve(),
    (ROOT / "../../source_docs/EPS-2.docx").resolve(),
]
OUTPUT_SRC = ROOT / "src/data/exercises.json"
OUTPUT_PUBLIC = ROOT / "public/data/exercises.json"
IMAGES_DIR = ROOT / "public/images"

BULLET = "\u2022"
SESSION_RE = re.compile(r"^\s*SESSION\s+(\d+)\s*:\s*(.+)$", re.IGNORECASE)
EXERCISE_RE = re.compile(r"^\s*(S\d+\s*[-\u2013]\s*\d+)\s*:\s*(.+)$", re.IGNORECASE)

CATEGORY_MUSCLES = {
    "core": "Abdominaux, obliques, lombaires",
    "squat": "Quadriceps, fessiers, adducteurs",
    "hinge": "Ischio-jambiers, fessiers, lombaires",
    "push": "Pectoraux, deltoides, triceps",
    "pull": "Dos, biceps, deltoides posterieurs",
    "plyo": "Quadriceps, fessiers, mollets",
    "functional": "Chaine anterieure et posterieure",
}

CATEGORY_FUNCTION = {
    "core": "anti-extension et stabilite",
    "squat": "extension du genou et stabilite",
    "hinge": "extension de hanche",
    "push": "poussee horizontale",
    "pull": "tirage horizontal",
    "plyo": "triple extension et reactivite",
    "functional": "stabilite globale",
}

CATEGORY_SAFETY = {
    "core": [
        "Garder une colonne neutre",
        "Respirer sans bloquer",
        "Eviter la compensation lombaire",
    ],
    "squat": [
        "Genoux alignes avec les orteils",
        "Buste gaine",
        "Amplitude progressive",
    ],
    "hinge": [
        "Charniere hanche dominante",
        "Dos long et neutre",
        "Charge proche du corps",
    ],
    "push": [
        "Epaules basses et stables",
        "Coudes a 30-45 degres",
        "Tronc engage",
    ],
    "pull": [
        "Poitrine ouverte",
        "Epaules loin des oreilles",
        "Controle du retour",
    ],
    "plyo": [
        "Atterrissage souple",
        "Genoux stables",
        "Repos suffisant entre les series",
    ],
    "functional": [
        "Mouvement controle",
        "Amplitude adaptee",
        "Respiration reguliere",
    ],
}

CATEGORY_REGRESS = {
    "core": "Reduire la duree ou surelever les appuis.",
    "squat": "Limiter l'amplitude ou utiliser un support.",
    "hinge": "Diminuer la charge et ralentir le tempo.",
    "push": "Surelever les mains ou reduire la charge.",
    "pull": "Utiliser un elastique plus leger.",
    "plyo": "Remplacer par un saut plus bas ou marche.",
    "functional": "Simplifier la coordination du mouvement.",
}

CATEGORY_PROGRESS = {
    "core": "Augmenter la duree ou ajouter une instabilite.",
    "squat": "Ajouter une charge ou tempo excentrique.",
    "hinge": "Ajouter une charge ou augmenter l'amplitude.",
    "push": "Augmenter la charge ou passer au sol.",
    "pull": "Ajouter une charge ou un tempo lent.",
    "plyo": "Augmenter la hauteur ou l'intensite.",
    "functional": "Augmenter la complexite ou la charge.",
}

CATEGORY_DOSAGE = {
    "core": f"3-4 x 20-40s {BULLET} repos 45-60s {BULLET} focus gainage",
    "squat": f"3-5 x 8-12 reps {BULLET} repos 60-90s {BULLET} focus controle",
    "hinge": f"3-5 x 8-10 reps {BULLET} repos 60-90s {BULLET} focus charniere",
    "push": f"3-5 x 8-12 reps {BULLET} repos 60-90s {BULLET} focus alignement",
    "pull": f"3-5 x 8-12 reps {BULLET} repos 60-90s {BULLET} focus scapulas",
    "plyo": f"3-5 x 6-8 reps {BULLET} repos 90-120s {BULLET} focus explosivite",
    "functional": f"3-4 x 8-12 reps {BULLET} repos 60-90s {BULLET} focus fluide",
}


def normalize_code(code: str) -> str:
    code = code.replace("\u2013", "-").replace(" ", "")
    return code.upper()


def split_points(value: str) -> List[str]:
    value = value.replace(BULLET, ",")
    parts = re.split(r"[,;]+", value)
    return [p.strip() for p in parts if p.strip()]


def value_after_colon(line: str) -> str:
    parts = line.split(":", 1)
    return parts[1].strip() if len(parts) > 1 else ""


def strip_accents(value: str) -> str:
    return "".join(
        char for char in unicodedata.normalize("NFD", value) if unicodedata.category(char) != "Mn"
    )


def infer_category(title: str, muscles: str) -> str:
    hay = strip_accents(f"{title} {muscles}".lower())
    if any(k in hay for k in ["gainage", "planche", "core", "dead bug", "hollow", "anti-rotation"]):
        return "core"
    if any(k in hay for k in ["squat", "fente", "pistol", "step", "chaise"]):
        return "squat"
    if any(k in hay for k in ["hinge", "souleve", "soulev", "pont", "hip", "good morning"]):
        return "hinge"
    if any(k in hay for k in ["pousse", "pompe", "developp", "push", "dips"]):
        return "push"
    if any(k in hay for k in ["tirage", "traction", "row", "rame", "pull"]):
        return "pull"
    if any(k in hay for k in ["saut", "plyo", "bond", "jump", "burpee"]):
        return "plyo"
    return "functional"


def generate_fields(exercise: Dict[str, Any]) -> Dict[str, Any]:
    muscles = exercise.get("muscles") or ""
    category = infer_category(exercise.get("title", ""), muscles)
    if not muscles:
        muscles = CATEGORY_MUSCLES[category]
        exercise["muscles"] = muscles

    objective = exercise.get("objective") or ""
    if not objective:
        main = muscles.split(",")[0].strip()
        objective = f"Renforcer {main.lower()} et ameliorer la stabilite globale."
        exercise["objective"] = objective

    anatomy = exercise.get("anatomy") or ""
    if not anatomy:
        anatomy = f"{muscles} {BULLET} {CATEGORY_FUNCTION[category]}"
        exercise["anatomy"] = anatomy

    key_points = exercise.get("key_points") or []
    if not key_points:
        exercise["key_points"] = ["Alignement", "Respiration", "Controle"]

    safety = exercise.get("safety") or []
    if not safety:
        exercise["safety"] = CATEGORY_SAFETY[category][:3]

    if not exercise.get("regress"):
        exercise["regress"] = CATEGORY_REGRESS[category]
    if not exercise.get("progress"):
        exercise["progress"] = CATEGORY_PROGRESS[category]
    if not exercise.get("dosage"):
        exercise["dosage"] = CATEGORY_DOSAGE[category]

    return exercise


def make_subtitle(num: int, title: str) -> str:
    return f"Seance {num} {BULLET} {title}"


def build_mock_data() -> Dict[str, Any]:
    sessions: List[Dict[str, Any]] = [
        {
            "num": 1,
            "title": "Gainage & posture",
            "subtitle": make_subtitle(1, "Gainage & posture"),
            "exercises": [
                {
                    "code": "S1-01",
                    "title": "Planche coudes",
                    "level": "Intermediaire",
                    "equipment": "Tapis",
                    "muscles": "Abdominaux, lombaires",
                    "key_points": ["Alignement", "Respiration", "Controle"],
                    "image": "/images/S1-01.jpg",
                },
                {
                    "code": "S1-02",
                    "title": "Dead Bug",
                    "level": "Debutant",
                    "equipment": "Aucun",
                    "muscles": "Abdos profonds, flechisseurs de hanche",
                    "key_points": ["Dos plaque", "Mouvement lent", "Souffle"],
                    "image": "/images/S1-02.jpg",
                },
                {
                    "code": "S1-03",
                    "title": "Bird Dog",
                    "level": "Debutant",
                    "equipment": "Aucun",
                    "muscles": "Lombaires, fessiers, epaules",
                    "key_points": ["Stabilite", "Extension opposee", "Regard sol"],
                    "image": "/images/S1-03.jpg",
                },
                {
                    "code": "S1-04",
                    "title": "Pont fessier",
                    "level": "Debutant",
                    "equipment": "Tapis",
                    "muscles": "Fessiers, ischios",
                    "key_points": ["Pousser talons", "Bassin neutre", "Controle"],
                    "image": "/images/S1-04.jpg",
                },
                {
                    "code": "S1-05",
                    "title": "Squat poids du corps",
                    "level": "Debutant",
                    "equipment": "Aucun",
                    "muscles": "Quadriceps, fessiers",
                    "key_points": ["Genoux alignes", "Poitrine ouverte", "Pied stable"],
                    "image": "/images/S1-05.jpg",
                },
            ],
        },
        {
            "num": 2,
            "title": "Poussee & tirage",
            "subtitle": make_subtitle(2, "Poussee & tirage"),
            "exercises": [
                {
                    "code": "S2-01",
                    "title": "Pompes inclinees",
                    "level": "Intermediaire",
                    "equipment": "Banc",
                    "muscles": "Pectoraux, triceps",
                    "key_points": ["Gainage", "Coudes 45deg", "Controle"],
                    "image": "/images/S2-01.jpg",
                },
                {
                    "code": "S2-02",
                    "title": "Rowing elastique",
                    "level": "Intermediaire",
                    "equipment": "Elastique",
                    "muscles": "Dos, biceps",
                    "key_points": ["Epaules basses", "Poitrine ouverte", "Retour lent"],
                    "image": "/images/S2-02.jpg",
                },
                {
                    "code": "S2-03",
                    "title": "Fentes avant",
                    "level": "Intermediaire",
                    "equipment": "Aucun",
                    "muscles": "Quadriceps, fessiers",
                    "key_points": ["Genou stable", "Buste droit", "Pied ancre"],
                    "image": "/images/S2-03.jpg",
                },
                {
                    "code": "S2-04",
                    "title": "Burpees controles",
                    "level": "Avance",
                    "equipment": "Aucun",
                    "muscles": "Corps entier",
                    "key_points": ["Rythme propre", "Atterrissage souple", "Respiration"],
                    "image": "/images/S2-04.jpg",
                },
            ],
        },
    ]

    for session in sessions:
        for exercise in session["exercises"]:
            exercise.setdefault("objective", "")
            exercise.setdefault("anatomy", "")
            exercise.setdefault("safety", [])
            exercise.setdefault("regress", "")
            exercise.setdefault("progress", "")
            exercise.setdefault("dosage", "")
            generate_fields(exercise)

    return {
        "meta": {
            "is_mock": True,
            "warning": "Donnees de demonstration actives (DOCX manquants).",
        },
        "sessions": sessions,
    }


def iter_image_rel_ids(paragraph):
    from docx.oxml.ns import qn

    for run in paragraph.runs:
        for blip in run.element.findall(".//a:blip", namespaces={"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}):
            rid = blip.get(qn("r:embed"))
            if rid:
                yield rid


def save_image(image_part, dest_path: Path) -> None:
    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError("Missing Pillow. Install with: pip install pillow") from exc

    import io

    image = Image.open(io.BytesIO(image_part.blob))
    image = image.convert("RGB")
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(dest_path, format="JPEG", quality=85)


def parse_docx(paths: List[Path]) -> Dict[str, Any]:
    try:
        from docx import Document
    except ImportError as exc:
        raise RuntimeError("Missing python-docx. Install with: pip install python-docx") from exc

    sessions: List[Dict[str, Any]] = []
    session_map: Dict[int, Dict[str, Any]] = {}
    images_written = 0

    current_session: Optional[Dict[str, Any]] = None
    current_exercise: Optional[Dict[str, Any]] = None
    awaiting_image: Optional[Dict[str, Any]] = None

    for path in paths:
        doc = Document(path)
        for paragraph in doc.paragraphs:
            text = paragraph.text.strip()
            if text:
                for line in [l.strip() for l in text.splitlines() if l.strip()]:
                    session_match = SESSION_RE.match(line)
                    if session_match:
                        num = int(session_match.group(1))
                        title = session_match.group(2).strip()
                        session = session_map.get(num)
                        if not session:
                            session = {
                                "num": num,
                                "title": title,
                                "subtitle": make_subtitle(num, title),
                                "exercises": [],
                            }
                            session_map[num] = session
                            sessions.append(session)
                        current_session = session
                        current_exercise = None
                        awaiting_image = None
                        continue

                    exercise_match = EXERCISE_RE.match(line)
                    if exercise_match:
                        code = normalize_code(exercise_match.group(1))
                        title = exercise_match.group(2).strip()
                        if not current_session:
                            num = int(code.split("-")[0].lstrip("S"))
                            current_session = session_map.get(num)
                            if not current_session:
                                current_session = {
                                    "num": num,
                                    "title": f"Session {num}",
                                    "subtitle": make_subtitle(num, f"Session {num}"),
                                    "exercises": [],
                                }
                                session_map[num] = current_session
                                sessions.append(current_session)
                        current_exercise = {
                            "code": code,
                            "title": title,
                            "level": "Intermediaire",
                            "equipment": "Aucun",
                            "muscles": "",
                            "objective": "",
                            "anatomy": "",
                            "key_points": [],
                            "safety": [],
                            "regress": "",
                            "progress": "",
                            "dosage": "",
                            "image": f"/images/{code}.jpg",
                        }
                        current_session["exercises"].append(current_exercise)
                        awaiting_image = current_exercise
                        continue

                    if current_exercise:
                        lower = strip_accents(line.lower())
                        if lower.startswith("muscles"):
                            current_exercise["muscles"] = value_after_colon(line)
                        elif lower.startswith("niveau"):
                            current_exercise["level"] = value_after_colon(line) or "Intermediaire"
                        elif lower.startswith("materiel"):
                            current_exercise["equipment"] = value_after_colon(line) or "Aucun"
                        elif lower.startswith("points"):
                            points = value_after_colon(line)
                            current_exercise["key_points"] = split_points(points)

            if awaiting_image:
                for rel_id in iter_image_rel_ids(paragraph):
                    image_part = doc.part.related_parts[rel_id]
                    dest = IMAGES_DIR / f"{awaiting_image['code']}.jpg"
                    save_image(image_part, dest)
                    images_written += 1
                    awaiting_image = None
                    break

    sessions.sort(key=lambda s: s["num"])
    total_exercises = 0
    for session in sessions:
        if not session.get("subtitle"):
            session["subtitle"] = make_subtitle(session["num"], session["title"])
        for exercise in session["exercises"]:
            if not exercise.get("key_points"):
                exercise["key_points"] = []
            if not exercise.get("level"):
                exercise["level"] = "Intermediaire"
            if not exercise.get("equipment"):
                exercise["equipment"] = "Aucun"
            generate_fields(exercise)
            total_exercises += 1

    data = {
        "meta": {
            "is_mock": False,
            "source_docs": [p.name for p in paths],
        },
        "sessions": sessions,
    }

    return data, images_written, len(sessions), total_exercises


def write_outputs(data: Dict[str, Any]) -> None:
    OUTPUT_SRC.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_SRC.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=True, indent=2)
    with OUTPUT_PUBLIC.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=True, indent=2)


def main() -> int:
    args = sys.argv[1:]
    doc_paths = [Path(arg).expanduser().resolve() for arg in args] if args else DEFAULT_DOCS
    existing = [p for p in doc_paths if p.exists()]

    if not existing:
        data = build_mock_data()
        write_outputs(data)
        print("Aucun DOCX trouve. Dataset de demo genere.")
        print("Sessions:", len(data["sessions"]))
        print(
            "Exercices:",
            sum(len(session["exercises"]) for session in data["sessions"]),
        )
        print("Images extraites:", 0)
        return 0

    try:
        data, images_written, session_count, exercise_count = parse_docx(existing)
    except RuntimeError as exc:
        print(str(exc))
        return 1

    write_outputs(data)
    print("Sessions:", session_count)
    print("Exercices:", exercise_count)
    print("Images extraites:", images_written)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
