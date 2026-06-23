import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchJSearchJobs } from '@/lib/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Pays francophones d'Afrique (ville principale pour de meilleurs résultats JSearch)
const COUNTRIES = [
  { code: 'CI', query: "emploi Abidjan Côte d'Ivoire" },
  { code: 'SN', query: 'emploi Dakar Sénégal' },
  { code: 'CM', query: 'emploi Douala Cameroun' },
  { code: 'BJ', query: 'emploi Cotonou Bénin' },
  { code: 'TG', query: 'emploi Lomé Togo' },
  { code: 'BF', query: 'emploi Ouagadougou Burkina Faso' },
  { code: 'ML', query: 'emploi Bamako Mali' },
  { code: 'GA', query: 'emploi Libreville Gabon' },
  { code: 'GN', query: 'emploi Conakry Guinée' },
  { code: 'CD', query: 'emploi Kinshasa RD Congo' },
  { code: 'NE', query: 'emploi Niamey Niger' },
  { code: 'CG', query: 'emploi Brazzaville Congo' },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const TARGET_NEW = 3;   // 1 à 3 nouvelles offres par jour
const MAX_CALLS = 6;    // garde-fou quota JSearch (free ~200/mois)
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

  // Ordre tournant : un pays différent "démarre" chaque jour pour couvrir tout le continent
  const dayIndex = Math.floor(Date.now() / DAY_MS);
  const start = dayIndex % COUNTRIES.length;
  const ordered = [...COUNTRIES.slice(start), ...COUNTRIES.slice(0, start)];

  // Client admin (service role) — nécessaire pour dédoublonner et insérer
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

    const rows = await fetchJSearchJobs({ query: c.query, limit: 10, datePosted: 'week' })
      .then((r) => r.map((x) => ({ ...x, country: x.country || c.code })))
      .catch(() => []);
    if (!rows.length) continue;

    // Lesquelles existent déjà en base ?
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

  // Insertion des nouvelles offres (1 à 3). Si le marché est vide ce jour-là -> 0, on n'invente rien.
  let inserted = 0;
  if (collected.length) {
    const { error } = await supabase.from('jobs').insert(collected);
    if (error) return NextResponse.json({ error: 'insert_failed', detail: error.message }, { status: 500 });
    inserted = collected.length;
  }

  // Purge des offres de +60 jours (par date d'ajout)
  const cutoff = new Date(Date.now() - PURGE_DAYS * DAY_MS).toISOString();
  const { data: purged } = await supabase
    .from('jobs').delete().eq('source', 'jsearch').lt('created_at', cutoff).select('id');

  return NextResponse.json({
    ok: true, tried, calls, inserted, purged: (purged || []).length,
  });
}
