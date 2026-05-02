import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NewNoteForm from "@/components/NewNoteForm";

export default async function NewNotePage() {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
        New Note
      </h1>
      <NewNoteForm />
    </main>
  );
}
