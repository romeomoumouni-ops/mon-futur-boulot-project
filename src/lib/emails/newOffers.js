// Gabarit d'e-mail « nouvelles offres d'emploi » (digest Lun/Jeu/Sam).
// HTML autonome (styles inline) pour une bonne compatibilité boîtes mail.

const BRAND = '#00b87c';

export function newOffersEmail({ firstName, offers = [], totalCount = 0, ctaUrl }) {
  const hello = firstName ? `Salut ${firstName},` : 'Salut,';
  const count = totalCount || offers.length;
  const countLabel = count <= 1 ? 'une nouvelle offre d\'emploi' : `${count} nouvelles offres d'emploi`;

  const rows = offers.slice(0, 6).map((o) => {
    const role = (o.role || 'Poste à pourvoir').toString();
    const company = (o.company || '').toString();
    const location = (o.location || o.country || '').toString();
    const meta = [company, location].filter(Boolean).join(' · ');
    return `
      <tr>
        <td style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
          <div style="font-weight:700;font-size:14px;color:#0f172a;">${escapeHtml(role)}</div>
          ${meta ? `<div style="font-size:12.5px;color:#64748b;margin-top:3px;">${escapeHtml(meta)}</div>` : ''}
        </td>
      </tr>
      <tr><td style="height:8px;line-height:8px;font-size:0;">&nbsp;</td></tr>`;
  }).join('');

  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="text-align:left;margin-bottom:20px;">
        <span style="display:inline-block;width:34px;height:34px;border-radius:9px;background:${BRAND};color:#fff;font-weight:800;text-align:center;line-height:34px;font-size:18px;vertical-align:middle;">M</span>
        <span style="font-weight:800;font-size:18px;margin-left:8px;vertical-align:middle;">MonFuturBoulot<span style="color:${BRAND};">.com</span></span>
      </div>

      <div style="background:#ffffff;border-radius:16px;padding:28px 24px;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
        <div style="display:inline-block;background:rgba(0,184,124,0.1);color:${BRAND};font-weight:700;font-size:12px;padding:6px 12px;border-radius:999px;margin-bottom:16px;">
          Nouvelles offres du jour
        </div>
        <h1 style="font-size:22px;margin:0 0 14px;line-height:1.25;">Il y a ${countLabel} à consulter</h1>
        <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 10px;">${hello}</p>
        <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px;">
          De nouvelles opportunités viennent d'être ajoutées sur ton espace. Sois parmi les premiers à postuler — les meilleures partent vite&nbsp;!
        </p>

        ${rows ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 18px;">${rows}</table>` : ''}

        <a href="${ctaUrl}" style="display:block;background:${BRAND};color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:15px 24px;border-radius:12px;">
          Voir les offres →
        </a>

        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:22px 0 0;">
          Connecte-toi à ton espace avec le bouton ci-dessus pour découvrir toutes les offres et postuler en un clic.
        </p>
      </div>

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:18px 0 0;">
        MonFuturBoulot.com — ton allié pour décrocher ton premier emploi.
      </p>
    </div>
  </body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
