import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function NoteEditorPage() {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  return <p>Note Editor</p>;
}
