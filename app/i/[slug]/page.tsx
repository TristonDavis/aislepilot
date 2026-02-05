import { createAnonSupabaseClient } from '@/src/lib/supabaseClient';

export default async function IntakePublicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase.from('weddings').select('*').eq('slug', slug).single();

  if (error || !data) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Intake form</h2>
        <p className="mt-3 text-sm text-zinc-600">No public intake form found for this link. If this is your site, create a wedding in the dashboard and ensure a 'weddings' table exists.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold">Intake: {data.name}</h2>
      <p className="mt-2 text-sm text-zinc-600">Please fill out the intake below.</p>

      <form className="mt-6 space-y-3" action="/api/intakes" method="post">
        <input type="hidden" name="wedding_id" value={data.id} />
        <div>
          <label className="block text-sm">Your name</label>
          <input name="name" className="p-2 border rounded w-full" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" type="email" className="p-2 border rounded w-full" />
        </div>
        <div>
          <label className="block text-sm">Notes</label>
          <textarea name="notes" className="p-2 border rounded w-full" />
        </div>
        <div>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Submit</button>
        </div>
      </form>
    </div>
  );
}
