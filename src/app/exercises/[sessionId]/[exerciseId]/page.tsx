import { redirect } from "next/navigation";

export default function ExerciseRedirect(props: { params: { exerciseId: string } }) {
  const { exerciseId } = props.params;
  redirect(`/exercises/${exerciseId}`);
}
