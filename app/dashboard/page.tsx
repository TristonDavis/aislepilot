import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } = {}, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    return <div className="p-6">Error checking session: {sessionError.message}</div>;
  }

  if (!session) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="mt-2">You need to <Link className="text-blue-600" href="/login">log in</Link> or <Link className="text-blue-600" href="/signup">sign up</Link>.</p>
      </div>
    );
  }

  // Try to load user's workspaces (table may not exist yet)
  const { data: workspaces, error } = await supabase.from('workspaces').select('*').eq('owner_id', session.user.id).order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Welcome, {session.user.email}</h2>
      <div className="mt-4">
        <h3 className="text-lg font-medium">Workspaces</h3>
        {error ? (
          <div className="mt-2 text-sm text-red-600">Could not load workspaces: {error.message}. You can create one below.</div>
        ) : null}

        <div className="mt-3">
          {workspaces && workspaces.length > 0 ? (
            <ul className="space-y-2">
              {workspaces.map((w: any) => (
                <li key={w.id} className="p-2 border rounded">{w.name}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-zinc-600">No workspaces yet.</div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/weddings" className="px-4 py-2 rounded bg-blue-600 text-white">View weddings</Link>
          <Link href="/weddings/new" className="px-4 py-2 rounded bg-green-600 text-white">Create wedding</Link>
        </div>
      </div>
    </div>
  );
}
