import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Mappage produit Chariow -> plan + durée d'accès (en mois)
const PRODUCTS = {
  // Produits actuels (type license, vendus via l'API Checkout)
  prd_j5az5wo8: { plan: 'basique', months: 1 },    // 2 500 FCFA / mois
  prd_jg1uxdp8: { plan: 'standard', months: 1 },   // 5 000 FCFA / mois
  prd_pa4ronz5: { plan: 'premium', months: 6 },    // 15 000 FCFA / 6 mois
  // Anciens produits (widget) — gardés pour les abonnements déjà payés
  prd_covoyuoz: { plan: 'basique', months: 1 },
  prd_mouzb4yn: { plan: 'standard', months: 1 },
  prd_2dl6fbu2: { plan: 'premium', months: 6 },
};

function addMonths(dateIso, months) {
  const d = dateIso ? new Date(dateIso) : new Date();
  const base = isNaN(d.getTime()) ? new Date() : d;
  const result = new Date(base);
  result.setMonth(result.getMonth() + months);
  return result.toISOString();
}

// Vérifie la vente auprès de l'API Chariow (anti-usurpation). Best-effort.
async function verifySaleWithApi(saleId) {
  const apiKey = process.env.CHARIOW_API_KEY;
  if (!apiKey || !saleId) return { ok: true, checked: false }; // pas de clé -> on s'appuie sur le token
  try {
    const res = await fetch(`https://api.chariow.com/v1/sales/${encodeURIComponent(saleId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.status === 404) return { ok: false, checked: true }; // vente inexistante -> rejet
    if (!res.ok) return { ok: true, checked: false }; // erreur transitoire -> on ne bloque pas
    const json = await res.json();
    const status = json?.data?.status;
    if (status && !['completed', 'paid', 'success', 'successful'].includes(String(status).toLowerCase())) {
      return { ok: false, checked: true };
    }
    return { ok: true, checked: true };
  } catch {
    return { ok: true, checked: false }; // réseau KO -> on ne bloque pas une vente légitime
  }
}

export async function POST(request) {
  // 1) Sécurité : token secret dans l'URL (?token=...)
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const expected = process.env.CHARIOW_WEBHOOK_TOKEN;
  if (!expected || token !== expected) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 });
  }

  // On ne traite que les ventes réussies ; le reste est acquitté (200) sans action.
  if (payload?.event !== 'successful.sale') {
    return new Response(JSON.stringify({ ignored: true, event: payload?.event || null }), { status: 200 });
  }

  const sale = payload.sale || {};
  const product = payload.product || {};
  const customer = payload.customer || {};
  const productId = product.id;
  // L'e-mail réel du compte est passé dans custom_metadata (l'e-mail Chariow est un dummy).
  // On garde customer.email en repli pour les anciens paiements (widget).
  const metaEmail = sale?.custom_metadata?.app_user_email;
  const email = (metaEmail || customer.email || '').trim().toLowerCase();
  const saleId = sale.id || null;

  const mapping = productId ? PRODUCTS[productId] : null;
  if (!mapping) {
    // Produit hors de nos 3 plans -> on acquitte sans rien faire.
    return new Response(JSON.stringify({ ignored: true, reason: 'unknown_product', productId }), { status: 200 });
  }
  if (!email) {
    return new Response(JSON.stringify({ ignored: true, reason: 'no_email' }), { status: 200 });
  }

  // 2) Vérification de la vente auprès de Chariow (si clé API configurée)
  const check = await verifySaleWithApi(saleId);
  if (!check.ok) {
    return new Response(JSON.stringify({ error: 'sale_verification_failed' }), { status: 401 });
  }

  const startedAt = sale.created_at || new Date().toISOString();
  const expiresAt = addMonths(startedAt, mapping.months);

  try {
    const supabase = createAdminClient();

    // Idempotence : si cette vente a déjà été enregistrée, on s'arrête.
    if (saleId) {
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('chariow_sale_id', saleId)
        .maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ ok: true, duplicate: true }), { status: 200 });
      }
    }

    // Rattache à un compte existant si l'e-mail correspond à un profil.
    let userId = null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();
    if (profile) userId = profile.id;

    // Enregistre l'abonnement payé.
    const { error: insErr } = await supabase.from('subscriptions').insert({
      user_id: userId,
      email,
      plan: mapping.plan,
      status: 'active',
      amount: sale?.amount?.value ?? null,
      currency: sale?.amount?.currency ?? null,
      payment_method: 'chariow',
      product_id: productId,
      chariow_sale_id: saleId,
      started_at: startedAt,
      expires_at: expiresAt,
    });
    if (insErr) throw insErr;

    // Met à jour le plan du profil si l'utilisateur existe déjà.
    if (userId) {
      await supabase
        .from('profiles')
        .update({ plan: mapping.plan, plan_expires_at: expiresAt })
        .eq('id', userId);
    }

    return new Response(
      JSON.stringify({ ok: true, plan: mapping.plan, email, expires_at: expiresAt }),
      { status: 200 }
    );
  } catch (e) {
    // 500 -> Chariow réessaiera la livraison (politique de retry des Pulses).
    return new Response(JSON.stringify({ error: 'processing_error', detail: String(e?.message || e) }), {
      status: 500,
    });
  }
}

// Petit GET de santé pour vérifier que la route répond (sans secret -> info minimale).
export async function GET() {
  return new Response(JSON.stringify({ ok: true, endpoint: 'chariow-webhook' }), { status: 200 });
}
