import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { renewalJ3Email, renewalJ2Email } from '@/lib/emails/renewal';

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

// Déclenché 1x/jour par Vercel Cron (voir vercel.json).
// Envoie les relances J-3 puis J-2 (2 mails max), sans doublon.
export async function GET(request) {
  // Sécurité : Vercel Cron envoie Authorization: Bearer ${CRON_SECRET}
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  // ?dry=1 -> n'envoie rien, ne marque rien (pour tester la logique)
  const dryRun = new URL(request.url).searchParams.get('dry') === '1';

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
  const dashboardUrl = `${siteUrl()}/dashboard`;

  // Abonnements actifs encore valides, expirant dans <= 3 jours
  const horizon = new Date(now + 3 * DAY_MS).toISOString();
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, email, plan, expires_at, reminder_j3_sent_at, reminder_j2_sent_at')
    .eq('status', 'active')
    .not('expires_at', 'is', null)
    .gt('expires_at', new Date(now).toISOString())
    .lte('expires_at', horizon);

  if (error) {
    return NextResponse.json({ error: 'query_failed', detail: error.message }, { status: 500 });
  }

  // Si un utilisateur a plusieurs abonnements actifs, on ne garde que celui
  // qui expire le plus tard (= son accès effectif).
  const latestByEmail = new Map();
  for (const s of subs || []) {
    const key = (s.email || '').toLowerCase();
    if (!key) continue;
    const prev = latestByEmail.get(key);
    if (!prev || new Date(s.expires_at) > new Date(prev.expires_at)) {
      latestByEmail.set(key, s);
    }
  }

  // Prénom depuis profiles (pour personnaliser)
  const firstNameById = new Map();
  const ids = [...latestByEmail.values()].map((s) => s.user_id).filter(Boolean);
  if (ids.length) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, first_name')
      .in('id', ids);
    for (const p of profs || []) firstNameById.set(p.id, p.first_name || '');
  }

  const results = [];

  for (const s of latestByEmail.values()) {
    const daysLeft = (new Date(s.expires_at).getTime() - now) / DAY_MS;
    const firstName = firstNameById.get(s.user_id) || '';
    let kind = null;

    // J-3 : reste <= 3 jours et pas encore envoyé
    if (daysLeft > 2 && daysLeft <= 3 && !s.reminder_j3_sent_at) kind = 'j3';
    // J-2 (ou moins) : reste <= 2 jours et pas encore envoyé
    else if (daysLeft <= 2 && !s.reminder_j2_sent_at) kind = 'j2';
    // Rattrapage J-3 si on a loupé un jour de cron (reste <=3 mais aucun envoyé)
    else if (daysLeft > 2 && daysLeft <= 3 && s.reminder_j3_sent_at) kind = null;

    if (!kind) continue;

    const tpl =
      kind === 'j3'
        ? renewalJ3Email({ firstName, dashboardUrl })
        : renewalJ2Email({ firstName, dashboardUrl });

    if (dryRun) {
      results.push({ email: s.email, kind, daysLeft: Math.round(daysLeft * 10) / 10, sent: 'dry-run' });
      continue;
    }

    const sent = await sendEmail({ to: s.email, subject: tpl.subject, html: tpl.html });

    // On ne marque "envoyé" que si l'envoi n'a pas explicitement échoué
    // (skipped = pas de clé configurée -> on marque quand même pour éviter le spam de logs)
    if (sent?.ok || sent?.skipped) {
      const patch =
        kind === 'j3'
          ? { reminder_j3_sent_at: new Date(now).toISOString() }
          : { reminder_j2_sent_at: new Date(now).toISOString() };
      await supabase.from('subscriptions').update(patch).eq('id', s.id);
    }

    results.push({
      email: s.email,
      kind,
      daysLeft: Math.round(daysLeft * 10) / 10,
      sent: sent?.ok ? 'sent' : sent?.skipped ? 'skipped(no-key)' : 'failed',
    });
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    candidates: latestByEmail.size,
    processed: results.length,
    results,
  });
}
