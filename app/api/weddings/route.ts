import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } = {} } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { name, date, slug } = body;
  const payload = { name, date, slug, owner_id: session.user.id };
  const { data, error } = await supabase.from('weddings').insert([payload]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ wedding: data });
}
