import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getNotesByUser } from '@/lib/notes';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/authenticate');

  const notes = getNotesByUser(session.user.id);

  return (
    <main className='mx-auto max-w-5xl px-6 py-10'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold tracking-tight text-foreground'>Your Notes</h1>
        <Link
          href='/notes/new'
          className='rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white'
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className='mt-12 text-center text-sm text-neutral-500 dark:text-neutral-400'>
          No notes yet. Create your first one!
        </p>
      ) : (
        <ul className='mt-8 grid gap-3'>
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className='block rounded-xl border border-neutral-200 px-5 py-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900'
              >
                <p className='font-medium text-foreground'>{note.title}</p>
                <p className='mt-1 text-xs text-neutral-500 dark:text-neutral-400'>
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
