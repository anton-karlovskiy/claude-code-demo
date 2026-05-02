"use client";

import type { Editor } from "@tiptap/react";

function toolbarBtn(isActive: boolean) {
  return (
    "rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800" +
    (isActive ? " bg-neutral-200 dark:bg-neutral-700" : "")
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="mx-1 inline-block w-px self-stretch bg-neutral-200 dark:bg-neutral-700"
    />
  );
}

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div
      role="toolbar"
      aria-label="Formatting options"
      className="flex flex-wrap items-center gap-1 border-b border-neutral-200 p-2 dark:border-neutral-800"
    >
      {/* Text style */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
        aria-pressed={editor.isActive("bold")}
        className={toolbarBtn(editor.isActive("bold"))}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
        aria-pressed={editor.isActive("italic")}
        className={toolbarBtn(editor.isActive("italic"))}
      >
        <em>I</em>
      </button>

      <Divider />

      {/* Block type */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        aria-label="Paragraph"
        aria-pressed={editor.isActive("paragraph")}
        className={toolbarBtn(editor.isActive("paragraph"))}
      >
        P
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

      <Divider />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
        aria-pressed={editor.isActive("bulletList")}
        className={toolbarBtn(editor.isActive("bulletList"))}
      >
        List
      </button>

      <Divider />

      {/* Code */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        aria-label="Inline code"
        aria-pressed={editor.isActive("code")}
        className={toolbarBtn(editor.isActive("code"))}
      >
        Code
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code block"
        aria-pressed={editor.isActive("codeBlock")}
        className={toolbarBtn(editor.isActive("codeBlock"))}
      >
        Block
      </button>

      <Divider />

      {/* Insert */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        aria-label="Horizontal rule"
        className={toolbarBtn(false)}
      >
        ─
      </button>
    </div>
  );
}
