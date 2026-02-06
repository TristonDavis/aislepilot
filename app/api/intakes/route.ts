import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  const body = await req.formData();
  const wedding_id = body.get('wedding_id');
  const name = body.get('name');
  const email = body.get('email');
  const notes = body.get('notes');

  // Use anon client for inserting intake (public)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { cookies });
  const { data, error } = await supabase.from('intakes').insert([{ wedding_id, name, email, notes }]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Redirect back to a thank-you page or simple JSON
  const weddingResult = await supabase.from('weddings').select('slug').eq('id', wedding_id).single();
  if (!weddingResult.data || !weddingResult.data.slug) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }
  return NextResponse.redirect(`/i/${weddingResult.data.slug}`);
}
