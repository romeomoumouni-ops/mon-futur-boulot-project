import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BRAND = '#00b87c';

// Adresse qui REÇOIT les messages du formulaire de contact.
// Configurable via SUPPORT_EMAIL (Vercel). Par défaut : la boîte support du domaine.
function supportInbox() {
  return process.env.SUPPORT_EMAIL || 'support@monfuturboulot.com';
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const name = (body?.name || '').toString().trim();
  const email = (body?.email || '').toString().trim();
  const subject = (body?.subject || '').toString().trim();
  const message = (body?.message || '').toString().trim();

  // Validation
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk || !subject || !message) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (name.length > 120 || subject.length > 160 || message.length > 5000) {
    return NextResponse.json({ error: 'too_long' }, { status: 400 });
  }

  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="margin-bottom:16px;">
      <span style="display:inline-block;width:32px;height:32px;border-radius:8px;background:${BRAND};color:#fff;font-weight:800;text-align:center;line-height:32px;font-size:17px;vertical-align:middle;">M</span>
      <span style="font-weight:800;font-size:17px;margin-left:8px;vertical-align:middle;">MonFuturBoulot<span style="color:${BRAND};">.com</span></span>
    </div>
    <div style="background:#fff;border-radius:14px;padding:24px;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
      <h1 style="font-size:18px;margin:0 0 16px;">Nouveau message via le formulaire de contact</h1>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Nom :</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 6px;font-size:14px;"><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 14px;font-size:14px;"><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
      <div style="border-top:1px solid #e2e8f0;padding-top:14px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
    </div>
    <p style="font-size:12px;color:#94a3b8;text-align:center;margin:16px 0 0;">Réponds directement à cet e-mail pour contacter ${escapeHtml(name)}.</p>
  </div>
</body></html>`;

  // 1) Enregistre le message en base (service role : bypass RLS pour un visiteur anonyme)
  //    → visible dans l'onglet « Messagerie » de l'espace admin.
  try {
    const admin = createAdminClient();
    await admin.from('contact_messages').insert({ name, email, subject, message });
  } catch (e) {
    console.error('[contact] insert skipped', e?.message || e);
  }

  // 2) Notification e-mail vers la boîte support (avec reply-to = visiteur)
  const res = await sendEmail({
    to: supportInbox(),
    subject: `[Contact] ${subject} — ${name}`,
    html,
    replyTo: email, // répondre directement au visiteur
  });

  if (res?.skipped) {
    // Email non configuré côté serveur : on log mais on ne casse pas l'UX.
    return NextResponse.json({ ok: true, delivered: false });
  }
  if (!res?.ok) {
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, delivered: true });
}
