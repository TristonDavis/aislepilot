import { createClient } from '@supabase/supabase-js';

/**
 * Minimal server-only helper for non-auth operations.
 * For auth-aware usage in the App Router prefer:
 * - `createClientComponentClient()` in client components
 * - `createServerComponentClient()` in server components
 * - `createRouteHandlerClient()` in route handlers
 * from `@supabase/auth-helpers-nextjs` so cookies and sessions work correctly.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. See .env.example');
}

/** Return an anonymous server-side client (no cookie auth). */
export function createAnonSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
