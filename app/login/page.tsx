'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // redirect if already signed in or when session appears (magic link)
    supabase.auth.getSession().then(({ data: { session } }) => session && router.push('/dashboard'));
    const { data: { subscription } = {} as any } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) router.push('/dashboard');
    });
    return () => subscription?.unsubscribe();
  }, [router, supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError('Enter email and password');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push('/dashboard');
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded border mt-12">
      <h2 className="text-2xl font-semibold mb-4">Log in</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" className="p-2 border rounded" />
        <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white" disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>
        {error && <div role="status" className="text-sm text-zinc-700">{error}</div>}
      </form>
    </div>
  );
}
