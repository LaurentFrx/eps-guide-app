import { MuscuExercisesView } from "@/components/muscu/MuscuExercisesView";
import { exercises } from "@/lib/exercises";
import { exerciseTagsByCode } from "@/lib/exercises/exerciseTags";
import { muscuExercises } from "@/lib/muscu";

export default function MuscuExercicesPage() {
  const epsExercises = exercises.map((exercise) => ({
    id: exercise.id,
    title: exercise.title,
    sessionId: exercise.sessionId,
    level: exercise.level,
    image: exercise.image,
  }));

  return (
    <MuscuExercisesView
      muscuExercises={muscuExercises}
      epsExercises={epsExercises}
      exerciseTagsByCode={exerciseTagsByCode}
    />
  );
}
