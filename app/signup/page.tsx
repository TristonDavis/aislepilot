'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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
    setInfo(null);
    if (!email || !password) return setError('Enter email and password');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setError(error.message);

    // If a session is returned the user is signed in immediately; otherwise instruct to check email
    if ((data as any)?.session) {
      router.push('/dashboard');
    } else {
      setInfo('Sign-up successful. Check your email for confirmation or magic link.');
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded border mt-12">
      <h2 className="text-2xl font-semibold mb-4">Sign up</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" className="p-2 border rounded" />
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Signing up…' : 'Sign up'}</button>
        {error && <div role="status" className="text-sm text-red-600">{error}</div>}
        {info && <div role="status" className="text-sm text-zinc-700">{info}</div>}
      </form>
    </div>
  );
}
