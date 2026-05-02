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
    <div className='flex flex-col gap-2'>
      <button
        type='button'
        onClick={handleToggle}
        disabled={isPending}
        className='rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
      >
        {isPending ? '…' : isPublic ? 'Sharing on' : 'Share publicly'}
      </button>
      {isPublic && slug && (
        <div className='flex items-center gap-2'>
          <span className='truncate rounded border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'>
            {typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `/p/${slug}`}
          </span>
          <button
            type='button'
            onClick={handleCopy}
            className='shrink-0 rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
}
