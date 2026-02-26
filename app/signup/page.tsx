'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
function createClientComponentClient() {
  return createClient(supabaseUrl, supabaseKey);
}

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check session and update state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });
    const { data: { subscription } = {} as any } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    return () => subscription?.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setError(error.message);
      else {
        setSession(null);
        setInfo('Signed out successfully.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email || !password) return setError('Enter email and password');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      console.error('Signup error:', error);
      return setError(error.message);
    }

    // After signup, create org and org_member, then upsert profile
    const user = data.user;
    if (user) {
      // 1. Create org
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({ owner_user_id: user.id, name: email.split('@')[0] + "'s Org" })
        .select('id')
        .single();
      if (orgError || !orgData?.id) {
        console.error('Org creation error:', orgError, orgData);
        return setError('Failed to create org: ' + (orgError?.message || 'Unknown error'));
      }
      const orgId = orgData.id;

      // 2. Create org_member
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({ org_id: orgId, user_id: user.id, role: 'owner' });
      if (memberError) {
        console.error('Org member creation error:', memberError);
        return setError('Failed to create org member: ' + memberError.message);
      }

      // 3. Upsert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, active_org_id: orgId });
      if (profileError) {
        console.error('Profile upsert error:', profileError);
        return setError('Failed to upsert profile: ' + profileError.message);
      }
      console.log('Signup and all inserts successful:', { user, orgId });
    } else {
      console.error('No user returned from signup:', data);
    }

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
      {checkingSession ? (
        <div className="text-sm text-neutral-500 mb-2">Checking session status…</div>
      ) : session ? (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-green-600 mb-2">You are already logged in as {session.user?.email || 'user'}.</div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded bg-red-600 text-white w-fit"
            disabled={loading}
          >
            {loading ? 'Signing out…' : 'Sign out'}
          </button>
          {error && <div role="status" className="text-sm text-red-600">{error}</div>}
          {info && <div role="status" className="text-sm text-zinc-700">{info}</div>}
        </div>
      ) : (
        <>
          <div className="text-sm text-neutral-600 mb-2">No active session. You can sign up below.</div>
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="p-2 border rounded" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" className="p-2 border rounded" />
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Signing up…' : 'Sign up'}</button>
            {error && <div role="status" className="text-sm text-red-600">{error}</div>}
            {info && <div role="status" className="text-sm text-zinc-700">{info}</div>}
          </form>
        </>
      )}
    </div>
  );
}
