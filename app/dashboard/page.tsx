import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type DashboardPageProps = {
  searchParams?: Promise<{ note?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createSupabaseServerClient();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

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

  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_user_id', session.user.id)
    .order('created_at', { ascending: false });

  const bannerText =
    resolvedSearchParams?.note === 'already-signed-in'
      ? 'You were already signed in, so we redirected you to your dashboard.'
      : resolvedSearchParams?.note === 'signed-up'
      ? 'Sign-up complete. Your initial workspace setup has been attempted.'
      : null;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Welcome, {session.user.email}</h2>

      {bannerText ? <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{bannerText}</div> : null}

      <div className="mt-4">
        <h3 className="text-lg font-medium">Organizations</h3>
        {error ? (
          <div className="mt-2 text-sm text-red-600">Could not load organizations: {error.message}. You can create one below.</div>
        ) : null}

        <div className="mt-3">
          {organizations && organizations.length > 0 ? (
            <ul className="space-y-2">
              {organizations.map((o: { id: string; name: string | null }) => (
                <li key={o.id} className="p-2 border rounded">{o.name}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-zinc-600">No organizations yet.</div>
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
