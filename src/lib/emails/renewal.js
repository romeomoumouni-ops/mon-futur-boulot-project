// Gabarits d'e-mails de relance de renouvellement (J-3 et J-2).
// HTML autonome (styles inline) pour une bonne compatibilité boîtes mail.

const BRAND = '#00b87c';

function shell({ title, intro, daysLeft, ctaUrl, firstName }) {
  const hello = firstName ? `Salut ${firstName},` : 'Salut,';
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
          ⏳ J-${daysLeft} avant la fin de ton abonnement
        </div>
        <h1 style="font-size:22px;margin:0 0 14px;line-height:1.25;">${title}</h1>
        <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 10px;">${hello}</p>
        <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 22px;">${intro}</p>

        <a href="${ctaUrl}" style="display:block;background:${BRAND};color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:15px 24px;border-radius:12px;">
          Renouveler mon abonnement →
        </a>

        <p style="font-size:13px;line-height:1.6;color:#64748b;margin:22px 0 0;">
          Tu peux te connecter directement à ton espace avec le bouton ci-dessus, puis cliquer sur « Renouveler ».
        </p>
      </div>

      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:20px 0 0;">
        © ${new Date().getFullYear()} MonFuturBoulot.com — La plateforme des jeunes diplômés en Afrique francophone.
      </p>
    </div>
  </body>
</html>`;
}

// J-3 : premier rappel
export function renewalJ3Email({ firstName, dashboardUrl }) {
  return {
    subject: '⏳ Ton abonnement MonFuturBoulot se termine dans 3 jours',
    html: shell({
      daysLeft: 3,
      firstName,
      ctaUrl: dashboardUrl,
      title: 'Ton abonnement arrive bientôt à échéance',
      intro:
        "Ton accès à MonFuturBoulot.com se termine dans <strong>3 jours</strong>. Pour continuer à créer des CV performants, tes lettres de motivation et accéder aux offres, pense à renouveler ton abonnement dès maintenant — ça ne prend qu'une minute.",
    }),
  };
}

// J-2 : second (et dernier) rappel
export function renewalJ2Email({ firstName, dashboardUrl }) {
  return {
    subject: '🔔 Dernier rappel : ton abonnement se termine dans 2 jours',
    html: shell({
      daysLeft: 2,
      firstName,
      ctaUrl: dashboardUrl,
      title: 'Plus que 2 jours avant la fin de ton accès',
      intro:
        "C'est notre <strong>dernier rappel</strong> : ton abonnement MonFuturBoulot.com expire dans <strong>2 jours</strong>. Renouvelle maintenant pour ne pas perdre l'accès à ton espace, tes documents et les offres d'emploi.",
    }),
  };
}
