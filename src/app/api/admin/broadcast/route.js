import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BRAND = '#00b87c';

function wrap(subject, message) {
  const safe = String(message || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="margin-bottom:18px;">
        <span style="display:inline-block;width:32px;height:32px;border-radius:9px;background:${BRAND};color:#fff;font-weight:800;text-align:center;line-height:32px;font-size:17px;vertical-align:middle;">M</span>
        <span style="font-weight:800;font-size:17px;margin-left:8px;vertical-align:middle;">MonFuturBoulot<span style="color:${BRAND};">.com</span></span>
      </div>
      <div style="background:#fff;border-radius:16px;padding:26px 24px;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
        <h1 style="font-size:19px;margin:0 0 14px;">${subject ? subject.replace(/</g, '&lt;') : ''}</h1>
        <div style="font-size:15px;line-height:1.65;color:#334155;">${safe}</div>
        <a href="https://www.monfuturboulot.com/dashboard" style="display:inline-block;margin-top:22px;background:${BRAND};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:10px;">Ouvrir mon espace →</a>
      </div>
      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:18px 0 0;">© ${new Date().getFullYear()} MonFuturBoulot.com</p>
    </div></body></html>`;
}

export async function POST(request) {
  const supabase = createClient();

  // 1) Authentification + contrôle admin STRICT
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  const { data: adm } = await supabase.rpc('is_admin');
  if (adm !== true) return Response.json({ error: 'forbidden' }, { status: 403 });

  // 2) Paramètres
  let body;
  try { body = await request.json(); } catch { body = {}; }
  const segment = ['all', 'no_sub', 'basique', 'standard_premium'].includes(body?.segment) ? body.segment : 'all';
  const subject = String(body?.subject || '').trim();
  const message = String(body?.message || '').trim();
  const test = body?.test === true; // envoi de test : uniquement à l'admin
  if (!subject || !message) return Response.json({ error: 'missing_fields' }, { status: 400 });

  // 3) Destinataires
  let emails = [];
  if (test) {
    emails = [user.email];
  } else if (segment === 'all') {
    const { data } = await supabase.from('profiles').select('email');
    emails = (data || []).map((p) => p.email).filter(Boolean);
  } else if (segment === 'no_sub') {
    // Inscrits SANS abonnement actif : tous les profils, moins ceux ayant un
    // abonnement actif non expiré (et moins le propriétaire/admin).
    const [{ data: profs }, { data: actives }] = await Promise.all([
      supabase.from('profiles').select('email'),
      supabase
        .from('subscriptions')
        .select('email')
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString()),
    ]);
    const withSub = new Set((actives || []).map((s) => (s.email || '').toLowerCase()));
    withSub.add('nekodu229@gmail.com'); // propriétaire (accès admin, pas un client sans abo)
    emails = (profs || []).map((p) => p.email).filter((e) => e && !withSub.has(e.toLowerCase()));
  } else {
    const wantedPlans = segment === 'basique' ? ['basique'] : ['standard', 'premium'];
    const { data } = await supabase
      .from('subscriptions')
      .select('email, plan, expires_at, status')
      .eq('status', 'active')
      .in('plan', wantedPlans)
      .gt('expires_at', new Date().toISOString());
    emails = (data || []).map((s) => s.email).filter(Boolean);
  }

  // Dédoublonnage (insensible à la casse)
  const seen = new Set();
  const recipients = [];
  for (const e of emails) {
    const key = e.toLowerCase();
    if (!seen.has(key)) { seen.add(key); recipients.push(e); }
  }

  if (!recipients.length) {
    return Response.json({ ok: true, recipients: 0, sent: 0, skipped: 0, failed: 0, note: 'Aucun destinataire pour ce segment.' });
  }

  // 4) Envoi (séquentiel, plafonné)
  const MAX = 500;
  const html = wrap(subject, message);
  let sent = 0, skipped = 0, failed = 0;
  for (const to of recipients.slice(0, MAX)) {
    const r = await sendEmail({ to, subject, html });
    if (r?.ok) sent++;
    else if (r?.skipped) skipped++;
    else failed++;
  }

  return Response.json({
    ok: true,
    segment,
    recipients: recipients.length,
    sent, skipped, failed,
    note: skipped > 0 ? "RESEND_API_KEY/EMAIL_FROM absents : aucun e-mail réellement envoyé (configurer dans Vercel)." : undefined,
  });
}
