import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchJSearchJobs } from '@/lib/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Pays francophones d'Afrique (ville principale). La requête générique
// "emploi à {ville} {pays}" (date_posted=all) renvoie des résultats fiables.
const COUNTRIES = [
  { code: 'CI', place: "Abidjan Côte d'Ivoire" },
  { code: 'SN', place: 'Dakar Sénégal' },
  { code: 'CM', place: 'Douala Cameroun' },
  { code: 'BJ', place: 'Cotonou Bénin' },
  { code: 'TG', place: 'Lomé Togo' },
  { code: 'BF', place: 'Ouagadougou Burkina Faso' },
  { code: 'GA', place: 'Libreville Gabon' },
  { code: 'GN', place: 'Conakry Guinée' },
  { code: 'CD', place: 'Kinshasa RD Congo' },
  { code: 'CG', place: 'Brazzaville Congo' },
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

  // Rotation quotidienne : pays de départ + page (1→3) qui changent chaque jour,
  // pour faire remonter des offres différentes au fil des jours.
  const dayIndex = Math.floor(Date.now() / DAY_MS);
  const start = dayIndex % COUNTRIES.length;
  const ordered = [...COUNTRIES.slice(start), ...COUNTRIES.slice(0, start)];
  const page = 1 + (dayIndex % 3);

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

  for (const c of ordered) {
    if (collected.length >= TARGET_NEW || calls >= MAX_CALLS) break;
    calls++;
    tried.push(c.code);

    // 2 pages tentées (la page du jour + page 1 en repli) pour maximiser les chances
    const pagesToTry = page === 1 ? [1] : [page, 1];
    let rows = [];
    for (const pg of pagesToTry) {
      rows = await fetchJSearchJobs({ query: `emploi à ${c.place}`, limit: 10, datePosted: 'all', page: pg })
        .then((r) => r.map((x) => ({ ...x, country: x.country || c.code })))
        .catch(() => []);
      if (rows.length) break;
    }
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
      ok: true, dryRun: true, page, tried, calls, found: collected.length,
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

  return NextResponse.json({ ok: true, page, tried, calls, inserted, purged: (purged || []).length });
}
