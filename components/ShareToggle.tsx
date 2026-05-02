'use client';

import { useState } from 'react';
import type { Note } from '@/lib/notes';

export default function ShareToggle({ note }: { note: Note }) {
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [slug, setSlug] = useState(note.publicSlug);
  const [isPending, setIsPending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleToggle() {
    setIsPending(true);
    const res = await fetch(`/api/notes/${note.id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !isPublic }),
    });
    setIsPending(false);
    if (res.ok) {
      const updated: Note = await res.json();
      setIsPublic(updated.isPublic);
      setSlug(updated.publicSlug);
    }
  }

  async function handleCopy() {
    if (!slug) return;
    await navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type='button'
        onClick={handleToggle}
        disabled={isPending}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isPublic
            ? 'border-green-600 bg-green-600/10 text-green-700 hover:bg-green-600/20 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-600/20'
            : 'border-neutral-300 text-foreground hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
        }`}
      >
        {isPending ? '…' : isPublic ? 'Public' : 'Share'}
      </button>
      {isPublic && slug && (
        <button
          type='button'
          onClick={handleCopy}
          className='rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      )}
    </>
  );
}
