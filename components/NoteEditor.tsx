"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Note } from "@/lib/notes";
import EditorToolbar from "./EditorToolbar";

const inputClass =
  "rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-neutral-700 dark:focus-visible:ring-white";

export default function NoteEditor({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: JSON.parse(note.contentJson),
    immediatelyRender: false,
  });

  async function handleSave() {
    if (!editor) return;
    setIsPending(true);
    setError(null);
    setSaved(false);

    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, contentJson: JSON.stringify(editor.getJSON()) }),
    });

    setIsPending(false);
    if (!res.ok) {
      setError("Failed to save note. Please try again.");
    } else {
      setSaved(true);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span id="content-label" className="text-sm font-medium text-foreground">
          Content
        </span>
        <div
          className="rounded-lg border border-neutral-200 dark:border-neutral-800"
          aria-labelledby="content-label"
        >
          <EditorToolbar editor={editor} />
          <div className="min-h-48 p-4 [&_.tiptap]:outline-none [&_.tiptap]:text-foreground">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-green-600 dark:text-green-400">
          Saved.
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !editor}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white"
      >
        {isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
