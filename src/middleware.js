import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request) {
  return await updateSession(request);
}

// Ne protéger QUE le contenu du SaaS. L'accueil, /register et /pricing restent publics.
// /admin est protégé en plus (réservé au compte admin/propriétaire).
export const config = {
  matcher: ['/dashboard/:path*', '/cv-builder/:path*', '/admin/:path*'],
};
