import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  const body = await req.formData();
  const wedding_id = body.get('wedding_id');
  const name = body.get('name');
  const email = body.get('email');
  const notes = body.get('notes');

  // Use anon client for inserting intake (public)
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.from('intakes').insert([{ wedding_id, name, email, notes }]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Redirect back to a thank-you page or simple JSON
  return NextResponse.redirect(`/i/${(await supabase.from('weddings').select('slug').eq('id', wedding_id).single()).data.slug}`);
}
