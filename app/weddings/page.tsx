import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function WeddingsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } = {} } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Weddings</h2>
        <p className="mt-2">Please <Link className="text-blue-600" href="/login">login</Link> to view and create weddings.</p>
      </div>
    );
  }

  const { data: weddings, error } = await supabase.from('weddings').select('*').eq('owner_id', session.user.id).order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Weddings</h2>
        <Link href="/weddings/new" className="px-3 py-1 rounded bg-green-600 text-white">New</Link>
      </div>

      {error ? <div className="mt-4 text-red-600">Could not load weddings: {error.message}</div> : null}

      <div className="mt-4">
        {weddings && weddings.length > 0 ? (
          <ul className="space-y-3">
            {weddings.map((w: any) => (
              <li key={w.id} className="p-3 border rounded">
                <div className="font-medium">{w.name}</div>
                <div className="text-sm text-zinc-600">Slug: {w.slug}</div>
                <div className="mt-2">
                  <a className="text-blue-600" href={`/i/${w.slug}`} target="_blank" rel="noreferrer">View intake form</a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-zinc-600">No weddings yet. Create one.</div>
        )}
      </div>
    </div>
  );
}
