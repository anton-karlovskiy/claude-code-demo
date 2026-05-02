'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { authClient } from '@/lib/auth-client';

const inputClass =
  'rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:border-neutral-700 dark:focus-visible:ring-white';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const result = isSignup
      ? await authClient.signUp.email({ email, password, name: email })
      : await authClient.signIn.email({ email, password });

    setIsPending(false);

    if (result.error) {
      setError(result.error.message ?? 'Something went wrong.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className='min-h-screen flex items-center justify-center bg-background px-4'>
      <div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white px-8 py-10 shadow-sm dark:border-neutral-800 dark:bg-neutral-900'>
        <h1 className='mb-6 text-2xl font-semibold tracking-tight text-foreground'>
          {isSignup ? 'Create an account' : 'Welcome back'}
        </h1>

        <form onSubmit={handleSubmit} className='flex flex-col gap-5' noValidate>
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='email' className='text-sm font-medium text-foreground'>
              Email
            </label>
            <input
              id='email'
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={handleEmailChange}
              className={inputClass}
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='password' className='text-sm font-medium text-foreground'>
              Password
            </label>
            <input
              id='password'
              type='password'
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={handlePasswordChange}
              className={inputClass}
            />
          </div>

          {error && (
            <p role='alert' className='text-sm text-red-600 dark:text-red-400'>
              {error}
            </p>
          )}

          <button
            type='submit'
            disabled={isPending}
            className='mt-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-white'
          >
            {isPending ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-neutral-500'>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            href={isSignup ? '/authenticate' : '/authenticate?mode=signup'}
            className='font-medium text-foreground underline underline-offset-4 hover:opacity-70'
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function AuthenticatePage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
