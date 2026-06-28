import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['page_view', 'signup_attempt', 'scroll_bottom']);

// Enregistre un événement de funnel (public, visiteurs anonymes). Insertion via
// service role (bypass RLS) ; seuls les événements connus sont acceptés.
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad_body' }, { status: 400 }); }

  const event = String(body?.event || '');
  if (!ALLOWED.has(event)) return NextResponse.json({ error: 'bad_event' }, { status: 400 });

  const anonId = body?.anonId ? String(body.anonId).slice(0, 80) : null;
  const path = body?.path ? String(body.path).slice(0, 200) : null;

  try {
    const admin = createAdminClient();
    await admin.from('analytics_events').insert({ event, anon_id: anonId, path });
  } catch {
    // ne casse jamais : si le service role n'est pas configuré on ignore
  }
  return NextResponse.json({ ok: true });
}
