import React from "react";

type TiptapMark = { type: string };

type TiptapNode = {
  type: string;
  attrs?: { level?: 1 | 2 | 3 };
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
};

const headingClass: Record<1 | 2 | 3, string> = {
  1: "mb-4 mt-6 text-2xl font-bold tracking-tight text-foreground",
  2: "mb-3 mt-5 text-xl font-semibold tracking-tight text-foreground",
  3: "mb-2 mt-4 text-lg font-semibold text-foreground",
};

function renderText(node: TiptapNode): React.ReactNode {
  let content: React.ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") content = <strong>{content}</strong>;
    if (mark.type === "italic") content = <em>{content}</em>;
    if (mark.type === "code")
      content = (
        <code className="rounded bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 text-sm font-mono">
          {content}
        </code>
      );
  }
  return content;
}

function renderNode(node: TiptapNode, key: number): React.ReactNode {
  switch (node.type) {
    case "doc":
      return <>{node.content?.map(renderNode)}</>;
    case "paragraph":
      return (
        <p key={key} className="mb-3 leading-7 text-foreground">
          {node.content?.map(renderNode)}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level ?? 1) as 1 | 2 | 3;
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      return (
        <Tag key={key} className={headingClass[level]}>
          {node.content?.map(renderNode)}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul key={key} className="mb-3 list-disc pl-6 space-y-1">
          {node.content?.map(renderNode)}
        </ul>
      );
    case "listItem":
      return (
        <li key={key} className="leading-7">
          {node.content?.map(renderNode)}
        </li>
      );
    case "codeBlock":
      return (
        <pre
          key={key}
          className="mb-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-4 overflow-x-auto"
        >
          <code className="text-sm font-mono">{node.content?.map(renderNode)}</code>
        </pre>
      );
    case "horizontalRule":
      return (
        <hr key={key} className="my-6 border-neutral-200 dark:border-neutral-700" />
      );
    case "text":
      return <React.Fragment key={key}>{renderText(node)}</React.Fragment>;
    default:
      return null;
  }
}

export default function NoteRenderer({ contentJson }: { contentJson: string }) {
  let doc: TiptapNode;
  try {
    doc = JSON.parse(contentJson);
  } catch {
    return <p className="text-sm text-red-500">Unable to render note content.</p>;
  }
  if (doc.type !== "doc") return null;
  return <>{doc.content?.map(renderNode)}</>;
}
