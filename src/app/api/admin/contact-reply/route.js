import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BRAND = '#00b87c';

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(reply, originalSubject) {
  const safe = escapeHtml(reply).replace(/\n/g, '<br>');
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="margin-bottom:18px;">
        <span style="display:inline-block;width:32px;height:32px;border-radius:9px;background:${BRAND};color:#fff;font-weight:800;text-align:center;line-height:32px;font-size:17px;vertical-align:middle;">M</span>
        <span style="font-weight:800;font-size:17px;margin-left:8px;vertical-align:middle;">MonFuturBoulot<span style="color:${BRAND};">.com</span></span>
      </div>
      <div style="background:#fff;border-radius:16px;padding:26px 24px;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
        <p style="font-size:12px;color:#64748b;margin:0 0 14px;">En réponse à : <strong>${escapeHtml(originalSubject)}</strong></p>
        <div style="font-size:15px;line-height:1.65;color:#334155;">${safe}</div>
      </div>
      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:18px 0 0;">L'équipe MonFuturBoulot.com — © ${new Date().getFullYear()}</p>
    </div></body></html>`;
}

export async function POST(request) {
  const supabase = createClient();

  // Authentification + contrôle admin STRICT
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  const { data: adm } = await supabase.rpc('is_admin');
  if (adm !== true) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { body = {}; }
  const id = String(body?.id || '').trim();
  const reply = String(body?.reply || '').trim();
  if (!id || !reply) return Response.json({ error: 'missing_fields' }, { status: 400 });

  // Récupère le message original (RLS admin autorise la lecture)
  const { data: msg, error: msgErr } = await supabase
    .from('contact_messages')
    .select('id, name, email, subject')
    .eq('id', id)
    .maybeSingle();
  if (msgErr || !msg) return Response.json({ error: 'not_found' }, { status: 404 });

  // Envoi de la réponse au visiteur (reply-to = boîte support, jamais le Gmail perso)
  const res = await sendEmail({
    to: msg.email,
    subject: `Re : ${msg.subject}`,
    html: wrap(reply, msg.subject),
    replyTo: process.env.SUPPORT_EMAIL || 'support@monfuturboulot.com',
  });
  if (res?.ok === false) return Response.json({ error: 'send_failed' }, { status: 502 });

  // Marque le message comme répondu (RLS admin autorise la mise à jour)
  await supabase
    .from('contact_messages')
    .update({ status: 'replied', reply, replied_at: new Date().toISOString() })
    .eq('id', id);

  return Response.json({ ok: true, delivered: !res?.skipped });
}
