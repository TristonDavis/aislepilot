'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.replace('/login?note=signed-out');
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-neutral-700 hover:text-black"
      disabled={loading}
      type="button"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
