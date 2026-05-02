"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsPending(true);
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
      >
        Delete
      </button>
      <dialog
        ref={dialogRef}
        className="m-auto rounded-xl border border-neutral-200 bg-white p-6 shadow-lg backdrop:bg-black/40 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 className="mb-2 text-lg font-semibold text-foreground">Delete note?</h2>
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
