'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/authenticate');
          router.refresh();
        },
      },
    });
  }

  return (
    <button
      onClick={handleLogout}
      className='rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
    >
      Log out
    </button>
  );
}
