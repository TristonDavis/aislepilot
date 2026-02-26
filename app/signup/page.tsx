'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard?note=already-signed-in');
        return;
      }
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) router.replace('/dashboard');
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedUsername || !trimmedEmail || !password) {
      setError('Enter username, email, and password');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          username: trimmedUsername,
          phone: trimmedPhone || null,
        },
      },
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    if (!data.session) {
      setLoading(false);
      setInfo('Sign-up successful. Please confirm your email before app records can be created in your tables.');
      return;
    }

    const bootstrapResponse = await fetch('/api/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgName: `${trimmedUsername || 'My'} Org` }),
    });

    if (!bootstrapResponse.ok) {
      const body = await bootstrapResponse.json().catch(() => ({}));
      setLoading(false);
      setError(body?.error ?? 'Account created, but failed to create organization/profile records.');
      return;
    }

    setLoading(false);
    router.replace('/dashboard?note=signed-up');
  }

  if (checkingSession) {
    return (
      <div className="max-w-md mx-auto p-6 rounded border mt-12">
        <h2 className="text-2xl font-semibold mb-4">Sign up</h2>
        <div className="text-sm text-neutral-500">Checking session status…</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded border mt-12">
      <h2 className="text-2xl font-semibold mb-4">Sign up</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="p-2 border rounded" autoComplete="username" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" type="email" className="p-2 border rounded" autoComplete="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="create password" type="password" className="p-2 border rounded" autoComplete="new-password" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="phone number (optional)" type="tel" className="p-2 border rounded" autoComplete="tel" />
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Signing up…' : 'Sign up'}</button>
        {error && <div role="status" className="text-sm text-red-600">{error}</div>}
        {info && <div role="status" className="text-sm text-zinc-700">{info}</div>}
      </form>
    </div>
  );
}
