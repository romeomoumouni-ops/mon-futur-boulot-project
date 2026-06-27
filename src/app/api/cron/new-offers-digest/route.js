import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { newOffersEmail } from '@/lib/emails/newOffers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://www.monfuturboulot.com'
  );
}

// Déclenché par Vercel Cron les lundi / jeudi / samedi (voir vercel.json).
// Envoie à TOUS les abonnés actifs (même Basique) un e-mail listant les
// nouvelles offres d'emploi, avec les entreprises pour inciter au clic.
export async function GET(request) {
  // Sécurité : Vercel Cron envoie Authorization: Bearer ${CRON_SECRET}
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // ?dry=1 -> n'envoie rien (test) ; ?days=N -> fenêtre des nouvelles offres
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dry') === '1';
  const days = Math.max(1, Math.min(14, parseInt(url.searchParams.get('days') || '4', 10) || 4));

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: 'service_role_missing', detail: String(e?.message || e) },
      { status: 500 }
    );
  }

  const now = Date.now();
  const since = new Date(now - days * DAY_MS).toISOString();

  // 1) Nouvelles offres récentes
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs')
    .select('role, company, location, country, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (jobsErr) {
    return NextResponse.json({ error: 'jobs_query_failed', detail: jobsErr.message }, { status: 500 });
  }

  const offers = jobs || [];
  if (offers.length === 0) {
    // Aucune nouvelle offre → on n'envoie rien (pas de mail vide).
    return NextResponse.json({ ok: true, sent: 0, reason: 'no_new_offers', windowDays: days });
  }

  // 2) Abonnés actifs (tous plans, même Basique)
  const { data: subs, error: subsErr } = await supabase
    .from('subscriptions')
    .select('user_id, email, expires_at')
    .eq('status', 'active')
    .not('expires_at', 'is', null)
    .gt('expires_at', new Date(now).toISOString());

  if (subsErr) {
    return NextResponse.json({ error: 'subs_query_failed', detail: subsErr.message }, { status: 500 });
  }

  // Dédoublonnage par e-mail
  const byEmail = new Map();
  for (const s of subs || []) {
    const email = (s.email || '').trim().toLowerCase();
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, { email, user_id: s.user_id });
  }

  // 3) Prénoms (table profiles) pour personnaliser
  const userIds = [...byEmail.values()].map((r) => r.user_id).filter(Boolean);
  const firstNameById = new Map();
  if (userIds.length) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, first_name')
      .in('id', userIds);
    for (const p of profs || []) firstNameById.set(p.id, p.first_name || '');
  }

  const ctaUrl = `${siteUrl()}/dashboard`;
  const recipients = [...byEmail.values()];

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      offersCount: offers.length,
      recipients: recipients.length,
      companies: [...new Set(offers.map((o) => o.company).filter(Boolean))].slice(0, 10),
      windowDays: days,
    });
  }

  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const html = newOffersEmail({
      firstName: firstNameById.get(r.user_id) || '',
      offers,
      totalCount: offers.length,
      ctaUrl,
    });
    const subject = offers.length <= 1
      ? 'Une nouvelle offre d\'emploi à consulter 🔎'
      : `${offers.length} nouvelles offres d'emploi à consulter 🔎`;
    const res = await sendEmail({ to: r.email, subject, html });
    if (res?.ok || res?.skipped) sent += 1; else failed += 1;
  }

  return NextResponse.json({ ok: true, sent, failed, offersCount: offers.length, recipients: recipients.length, windowDays: days });
}
