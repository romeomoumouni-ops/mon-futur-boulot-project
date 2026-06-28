// Envoi d'e-mails transactionnels via Resend (API REST, sans dépendance npm).
// No-op propre tant que RESEND_API_KEY / EMAIL_FROM ne sont pas configurés :
// l'app ne casse jamais, on se contente de logger ce qui aurait été envoyé.
//
// Pour activer en production, définir dans Vercel :
//   RESEND_API_KEY = re_xxx               (clé API Resend)
//   EMAIL_FROM     = MonFuturBoulot <noreply@monfuturboulot.com>  (domaine vérifié)

export async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.log('[email] Skipped (RESEND_API_KEY/EMAIL_FROM absents) ->', { to, subject });
    return { skipped: true };
  }

  try {
    const payload = { from, to, subject, html };
    if (replyTo) payload.reply_to = replyTo;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[email] Resend error', res.status, detail);
      return { ok: false, status: res.status, error: detail };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error('[email] Resend exception', err?.message || err);
    return { ok: false, error: String(err?.message || err) };
  }
}
