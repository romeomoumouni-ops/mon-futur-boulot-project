import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Client Supabase à utiliser côté serveur (Server Components, Server Actions, Route Handlers).
// Next.js 14 : cookies() est synchrone.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : ignoré (le refresh de session
            // est géré par le middleware).
          }
        },
      },
    }
  );
}
