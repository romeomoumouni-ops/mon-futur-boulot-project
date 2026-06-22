import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Plan -> produit Chariow (type license). Garde les IDs côté serveur.
const PLAN_PRODUCTS = {
  basique: 'prd_j5az5wo8',
  standard: 'prd_jg1uxdp8',
  premium: 'prd_pa4ronz5',
};

const COUNTRY_ISO = {
  "côte d'ivoire": 'CI', 'cote d ivoire': 'CI', 'sénégal': 'SN', 'senegal': 'SN',
  'cameroun': 'CM', 'bénin': 'BJ', 'benin': 'BJ', 'togo': 'TG', 'mali': 'ML',
  'burkina faso': 'BF', 'gabon': 'GA', 'france': 'FR',
};

const REDIRECT_URL = 'https://www.monfuturboulot.com/bienvenue';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { body = {}; }

  const productId = PLAN_PRODUCTS[body?.plan];
  if (!productId) {
    return Response.json({ error: 'Plan invalide.' }, { status: 400 });
  }

  // Utilisateur connecté requis (on relie le paiement à son compte)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'auth' }, { status: 401 });
  }

  const apiKey = process.env.CHARIOW_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Configuration paiement manquante.' }, { status: 500 });
  }

  const meta = user.user_metadata || {};
  const firstName = String(meta.first_name || 'Client').slice(0, 50);
  const lastName = String(meta.last_name || 'MonFuturBoulot').slice(0, 50);
  const phoneDigits = String(meta.phone || '').replace(/\D/g, '') || '0700000000';
  const countryCode = COUNTRY_ISO[String(meta.country || '').toLowerCase().trim()] || 'CI';

  // E-mail DUMMY envoyé à Chariow : l'utilisateur ne reçoit AUCUN e-mail de Chariow.
  const dummyEmail = `noreply+${user.id}@monfuturboulot.com`;

  try {
    const resp = await fetch('https://api.chariow.com/v1/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        email: dummyEmail,
        first_name: firstName,
        last_name: lastName,
        phone: { number: phoneDigits, country_code: countryCode },
        redirect_url: REDIRECT_URL,
        // Le vrai e-mail du compte : renvoyé par le webhook pour débloquer le bon compte.
        custom_metadata: { app_user_email: user.email, app_user_id: user.id },
      }),
    });

    const json = await resp.json().catch(() => ({}));
    const url = json?.data?.payment?.checkout_url;
    const step = json?.data?.step;

    if (step === 'already_purchased') {
      return Response.json({ error: 'Tu possèdes déjà cet abonnement.' }, { status: 409 });
    }
    if (!resp.ok || !url) {
      return Response.json({ error: json?.message || 'Échec de la création du paiement.' }, { status: 502 });
    }
    return Response.json({ checkout_url: url });
  } catch (e) {
    return Response.json({ error: 'Erreur de connexion au paiement.' }, { status: 502 });
  }
}
