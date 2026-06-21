'use client';

import { createBrowserClient } from '@supabase/ssr';

// Client Supabase à utiliser dans les composants "client" (navigateur).
// Repli sur des valeurs placeholder si les variables ne sont pas (encore) définies,
// pour ne JAMAIS casser le build/prérendu. (En prod, définir les vraies variables.)
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  return createBrowserClient(url, key);
}
