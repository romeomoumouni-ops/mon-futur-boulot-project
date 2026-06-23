import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Rafraîchit la session Supabase et protège l'accès au SaaS.
// - Pages publiques : accueil, /register, /pricing (non couvertes par le matcher).
// - Pages protégées (/dashboard, /cv-builder) :
//     • pas connecté        -> redirection vers /register
//     • connecté sans accès -> redirection vers /pricing (doit choisir/payer un plan)
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/register';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // /admin : STRICTEMENT réservé au compte admin/propriétaire.
  if (path.startsWith('/admin')) {
    let admin = false;
    try {
      const { data } = await supabase.rpc('is_admin');
      admin = data === true;
    } catch {
      admin = false;
    }
    if (!admin) {
      // Tout utilisateur non-admin est renvoyé hors de l'espace admin.
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return response; // admin autorisé
  }

  // Autres pages protégées (/dashboard, /cv-builder) : accès propriétaire/admin ou abonnement actif.
  let hasAccess = false;
  try {
    const { data } = await supabase.rpc('has_active_access');
    hasAccess = data === true;
  } catch {
    hasAccess = false;
  }

  if (!hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = '/pricing';
    url.searchParams.set('access', 'required');
    return NextResponse.redirect(url);
  }

  return response;
}
