"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const inputClass =
  "rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-neutral-700 dark:focus-visible:ring-white";

function toolbarBtn(isActive: boolean) {
  return (
    "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800" +
    (isActive ? " bg-neutral-200 dark:bg-neutral-700" : "")
  );
}

export default function NewNoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    immediatelyRender: false,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editor) return;

    setIsPending(true);
    setError(null);

    const contentJson = JSON.stringify(editor.getJSON());
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, contentJson }),
    });

    if (!res.ok) {
      setError("Failed to create note. Please try again.");
      setIsPending(false);
      return;
    }

    const note = await res.json();
    router.push(`/notes/${note.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
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
          {editor && (
            <div
              role="toolbar"
              aria-label="Formatting options"
              className="flex flex-wrap gap-1 border-b border-neutral-200 p-2 dark:border-neutral-800"
            >
              <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold" aria-pressed={editor.isActive("bold")} className={toolbarBtn(editor.isActive("bold"))}>
                <strong>B</strong>
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic" aria-pressed={editor.isActive("italic")} className={toolbarBtn(editor.isActive("italic"))}>
                <em>I</em>
              </button>
              {([1, 2, 3] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                  aria-label={`Heading ${level}`}
                  aria-pressed={editor.isActive("heading", { level })}
                  className={toolbarBtn(editor.isActive("heading", { level }))}
                >
                  H{level}
                </button>
              ))}
              <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list" aria-pressed={editor.isActive("bulletList")} className={toolbarBtn(editor.isActive("bulletList"))}>
                List
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} aria-label="Inline code" aria-pressed={editor.isActive("code")} className={toolbarBtn(editor.isActive("code"))}>
                Code
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} aria-label="Code block" aria-pressed={editor.isActive("codeBlock")} className={toolbarBtn(editor.isActive("codeBlock"))}>
                Block
              </button>
              <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} aria-label="Horizontal rule" className={toolbarBtn(false)}>
                ─
              </button>
            </div>
          )}
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

      <button
        type="submit"
        disabled={isPending || !editor}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white"
      >
        {isPending ? "Creating…" : "Create note"}
      </button>
    </form>
  );
}
