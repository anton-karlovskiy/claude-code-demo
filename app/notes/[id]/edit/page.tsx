import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import NoteEditor from '@/components/NoteEditor';
import ShareToggle from '@/components/ShareToggle';

export default async function NoteEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/authenticate');

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  return (
    <main className='mx-auto max-w-2xl px-4 py-10'>
      <NoteEditor note={note} />
      <div className='mt-6 flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800'>
        <span className='text-sm font-medium text-foreground'>Public sharing</span>
        <div className='flex gap-2'>
          <ShareToggle note={note} />
        </div>
      </div>
    </main>
  );
}
