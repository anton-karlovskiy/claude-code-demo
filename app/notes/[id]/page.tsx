import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import NoteRenderer from '@/components/NoteRenderer';
import DeleteNoteButton from '@/components/DeleteNoteButton';
import ShareToggle from '@/components/ShareToggle';

export default async function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/authenticate');

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  return (
    <main className='mx-auto max-w-2xl px-4 py-10'>
      <div className='mb-6 flex items-start justify-between gap-4'>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>{note.title}</h1>
        <div className='flex shrink-0 flex-col items-end gap-2'>
          <div className='flex gap-2'>
            <Link
              href={`/notes/${id}/edit`}
              className='rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
            >
              Edit
            </Link>
            <DeleteNoteButton noteId={id} />
          </div>
          <ShareToggle note={note} />
        </div>
      </div>
      <NoteRenderer contentJson={note.contentJson} />
    </main>
  );
}
