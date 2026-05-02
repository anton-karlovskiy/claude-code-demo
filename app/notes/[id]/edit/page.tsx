import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getNoteById } from '@/lib/notes';
import NoteEditor from '@/components/NoteEditor';

export default async function NoteEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect('/authenticate');

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  return (
    <main className='mx-auto max-w-2xl px-4 py-10'>
      <NoteEditor note={note} />
    </main>
  );
}
