import { notFound } from 'next/navigation';
import { getNoteByPublicSlug } from '@/lib/notes';
import NoteRenderer from '@/components/NoteRenderer';

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) notFound();

  return (
    <main className='mx-auto max-w-2xl px-4 py-10'>
      <h1 className='mb-6 text-3xl font-bold tracking-tight text-foreground'>{note.title}</h1>
      <NoteRenderer contentJson={note.contentJson} />
    </main>
  );
}
