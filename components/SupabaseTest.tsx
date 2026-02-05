'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SupabaseTest() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    let mounted = true;
    const supabase = createClientComponentClient();
    supabase.auth.getSession()
      .then(({ error }: any) => {
        if (!mounted) return;
        if (error) setStatus(`error: ${error.message}`);
        else setStatus('connected (no active session)');
      })
      .catch((err: any) => {
        if (!mounted) return;
        setStatus(`error: ${err.message}`);
      });
    return () => { mounted = false; };
  }, []);

  return <div className="p-4 rounded border">Supabase status: {status}</div>;
}
