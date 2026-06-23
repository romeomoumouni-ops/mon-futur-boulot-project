import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchJSearchJobs } from '@/lib/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Pays francophones d'Afrique (ville principale) — code + libellé de recherche
const COUNTRIES = [
  { code: 'CI', place: "Abidjan Côte d'Ivoire" },
  { code: 'SN', place: 'Dakar Sénégal' },
  { code: 'CM', place: 'Douala Cameroun' },
  { code: 'BJ', place: 'Cotonou Bénin' },
  { code: 'TG', place: 'Lomé Togo' },
  { code: 'BF', place: 'Ouagadougou Burkina Faso' },
  { code: 'ML', place: 'Bamako Mali' },
  { code: 'GA', place: 'Libreville Gabon' },
  { code: 'GN', place: 'Conakry Guinée' },
  { code: 'CD', place: 'Kinshasa RD Congo' },
  { code: 'NE', place: 'Niamey Niger' },
  { code: 'CG', place: 'Brazzaville Congo' },
];

// Secteurs courants — on alterne pour faire remonter des offres variées chaque jour
const SECTORS = [
  'développeur', 'commercial', 'comptable', 'marketing', 'assistant administratif',
  'ingénieur', 'logistique', 'ressources humaines', 'chef de projet',
  'technicien', 'vendeur', 'community manager', 'finance', 'gestionnaire',
];

const DAY_MS = 24 * 60 * 60 * 1000;
const TARGET_NEW = 3;   // 1 à 3 nouvelles offres par jour
const MAX_CALLS = 8;    // garde-fou quota JSearch
const PURGE_DAYS = 60;  // une offre reste 60 jours puis est retirée

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dry') === '1';

  // Combinaisons (pays, secteur) tournantes : décalage différent chaque jour
  const dayIndex = Math.floor(Date.now() / DAY_MS);
  const pairs = [];
  for (let i = 0; i < MAX_CALLS; i++) {
    const c = COUNTRIES[(dayIndex + i) % COUNTRIES.length];
    const s = SECTORS[(dayIndex + i) % SECTORS.length];
    pairs.push({ code: c.code, query: `${s} ${c.place}` });
  }

  let supabase = null;
  try {
    supabase = createAdminClient();
  } catch (e) {
    if (!dryRun) {
      return NextResponse.json({ error: 'service_role_missing', detail: String(e?.message || e) }, { status: 500 });
    }
  }

  const collected = [];
  const tried = [];
  let calls = 0;

  for (const p of pairs) {
    if (collected.length >= TARGET_NEW || calls >= MAX_CALLS) break;
    calls++;
    tried.push(p.query);

    const rows = await fetchJSearchJobs({ query: p.query, limit: 10, datePosted: 'month' })
      .then((r) => r.map((x) => ({ ...x, country: x.country || p.code })))
      .catch(() => []);
    if (!rows.length) continue;

    let existingIds = new Set();
    if (supabase) {
      const ids = rows.map((r) => r.external_id).filter(Boolean);
      if (ids.length) {
        const { data: existing } = await supabase.from('jobs').select('external_id').in('external_id', ids);
        existingIds = new Set((existing || []).map((e) => e.external_id));
      }
    }

    for (const r of rows) {
      if (collected.length >= TARGET_NEW) break;
      if (!r.external_id || existingIds.has(r.external_id)) continue;
      if (collected.some((x) => x.external_id === r.external_id)) continue;
      collected.push(r);
    }
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true, dryRun: true, tried, calls, found: collected.length,
      sample: collected.map((c) => ({ role: c.role, company: c.company, location: c.location })),
    });
  }

  let inserted = 0;
  if (collected.length) {
    const { error } = await supabase.from('jobs').insert(collected);
    if (error) return NextResponse.json({ error: 'insert_failed', detail: error.message }, { status: 500 });
    inserted = collected.length;
  }

  const cutoff = new Date(Date.now() - PURGE_DAYS * DAY_MS).toISOString();
  const { data: purged } = await supabase
    .from('jobs').delete().eq('source', 'jsearch').lt('created_at', cutoff).select('id');

  return NextResponse.json({ ok: true, tried, calls, inserted, purged: (purged || []).length });
}
