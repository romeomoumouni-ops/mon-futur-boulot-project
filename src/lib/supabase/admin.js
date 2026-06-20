import { createClient } from '@supabase/supabase-js';

// Client Supabase "service role" — UNIQUEMENT côté serveur (webhook).
// Contourne la RLS pour écrire les abonnements payés. Ne JAMAIS l'importer côté client.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase service role non configuré (SUPABASE_SERVICE_ROLE_KEY manquant).');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
