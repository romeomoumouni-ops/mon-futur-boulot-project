import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchJSearchJobs } from '@/lib/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Pays francophones d'Afrique ciblés (requêtes JSearch)
const COUNTRY_QUERIES = [
  { code: 'CI', query: "emploi à Abidjan Côte d'Ivoire" },
  { code: 'SN', query: 'emploi à Dakar Sénégal' },
  { code: 'CM', query: 'emploi à Douala Cameroun' },
  { code: 'BJ', query: 'emploi à Cotonou Bénin' },
  { code: 'TG', query: 'emploi à Lomé Togo' },
  { code: 'BF', query: 'emploi à Ouagadougou Burkina Faso' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

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
  // Nombre d'offres à récupérer par pays (defaut 4)
  const perCountry = Math.min(parseInt(url.searchParams.get('per') || '4', 10) || 4, 10);

  // Rotation : 3 pays par jour (alterne entre 2 groupes selon la parité du jour)
  const dayIndex = Math.floor(Date.now() / DAY_MS);
  const group = dayIndex % 2 === 0 ? COUNTRY_QUERIES.slice(0, 3) : COUNTRY_QUERIES.slice(3);

  // Récupération JSearch (en parallèle)
  const batches = await Promise.all(
    group.map((c) =>
      fetchJSearchJobs({ query: c.query, limit: perCountry })
        .then((rows) => rows.map((r) => ({ ...r, country: r.country || c.code })))
        .catch(() => [])
    )
  );
  const fetched = batches.flat();

  // Dédoublonnage par external_id dans le lot
  const byId = new Map();
  for (const r of fetched) if (r.external_id && !byId.has(r.external_id)) byId.set(r.external_id, r);
  const candidates = [...byId.values()];

  if (dryRun) {
    return NextResponse.json({
      ok: true, dryRun: true, group: group.map((c) => c.code),
      fetched: fetched.length, unique: candidates.length,
      sample: candidates.slice(0, 3).map((c) => ({ role: c.role, company: c.company, location: c.location, url: c.url?.slice(0, 60) })),
    });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: 'service_role_missing', detail: String(e?.message || e) }, { status: 500 });
  }

  // N'insère que les offres pas encore en base
  let inserted = 0;
  if (candidates.length) {
    const ids = candidates.map((c) => c.external_id);
    const { data: existing } = await supabase.from('jobs').select('external_id').in('external_id', ids);
    const existingIds = new Set((existing || []).map((e) => e.external_id));
    const toInsert = candidates.filter((c) => !existingIds.has(c.external_id));
    if (toInsert.length) {
      const { error } = await supabase.from('jobs').insert(toInsert);
      if (error) return NextResponse.json({ error: 'insert_failed', detail: error.message }, { status: 500 });
      inserted = toInsert.length;
    }
  }

  // Purge des offres auto trop anciennes (> 30 jours) pour garder des annonces fraîches
  const cutoff = new Date(Date.now() - 30 * DAY_MS).toISOString();
  await supabase.from('jobs').delete().eq('source', 'jsearch').lt('created_at', cutoff);

  return NextResponse.json({
    ok: true, group: group.map((c) => c.code),
    fetched: fetched.length, unique: candidates.length, inserted,
  });
}
