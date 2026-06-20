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
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/register';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Vérifie l'accès (propriétaire/admin ou abonnement actif non expiré).
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
