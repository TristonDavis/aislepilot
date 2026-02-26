'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function Home() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loadingSignOut, setLoadingSignOut] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(Boolean(session));
      setEmail(session?.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    setLoadingSignOut(true);
    await supabase.auth.signOut();
    setLoadingSignOut(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-20 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            AislePilot — Planner-first MVP
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Quickstart flows: <Link className="font-medium text-blue-600" href="/signup">Sign up</Link> → <Link className="font-medium text-blue-600" href="/dashboard">Dashboard</Link> → create weddings and inquiry forms.
          </p>
        </div>

        <div className="w-full mt-8 rounded border p-4">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {isSignedIn === null ? 'Checking sign-in status…' : isSignedIn ? `Signed in as ${email ?? 'your account'}` : 'You are not signed in'}
          </p>
          {isSignedIn ? (
            <button
              onClick={handleSignOut}
              className="mt-3 px-4 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
              disabled={loadingSignOut}
              type="button"
            >
              {loadingSignOut ? 'Signing out…' : 'Sign out'}
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-8">
          <Link href="/login" className="px-4 py-2 rounded bg-blue-600 text-white">Log in</Link>
          <Link href="/signup" className="px-4 py-2 rounded bg-green-600 text-white">Sign up</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded border">Dashboard</Link>
        </div>

      </main>
    </div>
  );
}
