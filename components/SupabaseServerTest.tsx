import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function SupabaseServerTest() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } = {}, error } = await supabase.auth.getSession();
  const status = error ? `error: ${error.message}` : (session ? 'connected (session present)' : 'no session');

  return <div className="p-4 rounded border">Supabase server status: {status}</div>;
}
