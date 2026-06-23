'use client';

import React, { useState, useContext, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppContext } from '@/context/AppContext';

const PRIMARY = '#00b87c';

function fmtMoney(n) {
  return (n || 0).toLocaleString('fr-FR') + ' FCFA';
}
function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return '—'; }
}
function dayKey(d) {
  try { return new Date(d).toISOString().slice(0, 10); } catch { return ''; }
}

export default function AdminPage() {
  const { supabase, isAdmin, user } = useContext(AppContext);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // L'accès est déjà bloqué par le middleware ; on revérifie côté client (défense en profondeur).
  useEffect(() => {
    const t = setTimeout(() => setAuthChecked(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isAdmin || !user?.id) return;
    let active = true;
    (async () => {
      setLoading(true);
      const [profiles, subs, letters, apps, cvs, support, jobs] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, email, country, phone, created_at').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('user_id, email, plan, status, amount, expires_at, created_at'),
        supabase.from('cover_letters').select('user_id'),
        supabase.from('applications').select('user_id'),
        supabase.from('user_cvs').select('user_id, updated_at'),
        supabase.from('support_messages').select('user_id, sender'),
        supabase.from('jobs').select('id, role, company, location, country, contract, url, source, created_at').order('created_at', { ascending: false }),
      ]);
      if (!active) return;
      setData({
        profiles: profiles.data || [],
        subs: subs.data || [],
        letters: letters.data || [],
        apps: apps.data || [],
        cvs: cvs.data || [],
        support: support.data || [],
        jobs: jobs.data || [],
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, [isAdmin, user, supabase]);

  const computed = useMemo(() => {
    if (!data) return null;
    const now = Date.now();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    // CA
    const caTotal = data.subs.reduce((s, x) => s + (x.amount || 0), 0);
    const caMonth = data.subs.filter((x) => new Date(x.created_at).getTime() >= monthStart).reduce((s, x) => s + (x.amount || 0), 0);

    // Plan effectif par email (abonnement actif non expiré le plus récent)
    const planByEmail = new Map();
    for (const s of data.subs) {
      if (s.status !== 'active' || !s.expires_at || new Date(s.expires_at).getTime() <= now) continue;
      const key = (s.email || '').toLowerCase();
      const prev = planByEmail.get(key);
      if (!prev || new Date(s.expires_at) > new Date(prev.expires_at)) planByEmail.set(key, s);
    }
    const planOf = (email) => {
      if ((email || '').toLowerCase() === 'nekodu229@gmail.com') return 'premium';
      return planByEmail.get((email || '').toLowerCase())?.plan || null;
    };

    // Répartition par plan
    const byPlan = { basique: 0, standard: 0, premium: 0, aucun: 0 };
    for (const p of data.profiles) {
      const pl = planOf(p.email);
      if (pl === 'basique') byPlan.basique++;
      else if (pl === 'standard') byPlan.standard++;
      else if (pl === 'premium') byPlan.premium++;
      else byPlan.aucun++;
    }

    // Inscrits par jour (14 derniers jours)
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const count = data.profiles.filter((p) => dayKey(p.created_at) === key).length;
      days.push({ key, label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), count });
    }
    const maxDay = Math.max(1, ...days.map((d) => d.count));

    // Compteurs d'actions par user
    const cnt = (arr) => { const m = new Map(); for (const x of arr) m.set(x.user_id, (m.get(x.user_id) || 0) + 1); return m; };
    const lettersBy = cnt(data.letters);
    const appsBy = cnt(data.apps);
    const supportBy = cnt(data.support.filter((s) => s.sender === 'user'));
    const cvSet = new Set(data.cvs.map((c) => c.user_id));

    const users = data.profiles.map((p) => ({
      ...p,
      plan: planOf(p.email),
      letters: lettersBy.get(p.id) || 0,
      apps: appsBy.get(p.id) || 0,
      support: supportBy.get(p.id) || 0,
      hasCV: cvSet.has(p.id),
    }));

    // Segments communication
    const segAll = data.profiles.length;
    const segBasique = data.profiles.filter((p) => planOf(p.email) === 'basique').length;
    const segPro = data.profiles.filter((p) => ['standard', 'premium'].includes(planOf(p.email))).length;

    // Offres : nouvelles aujourd'hui vs anciennes
    const todayKey = new Date(now).toISOString().slice(0, 10);
    const newJobs = data.jobs.filter((j) => dayKey(j.created_at) === todayKey);
    const oldJobs = data.jobs.filter((j) => dayKey(j.created_at) !== todayKey);

    return { caTotal, caMonth, byPlan, days, maxDay, users, segAll, segBasique, segPro, newJobs, oldJobs };
  }, [data]);

  // --- Accès refusé (si jamais on arrive ici sans être admin) ---
  if (authChecked && isAdmin === false) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, maxWidth: 440, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ margin: '0 0 8px' }}>Accès réservé</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>Cet espace est réservé à l'administrateur.</p>
          <Link href="/dashboard" className="btn btn-primary">Retour à mon espace</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link href="/" style={s.logo}><span style={s.logoDot}>M</span><strong>MonFuturBoulot</strong><span style={{ color: PRIMARY }}>.com</span></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={s.adminBadge}>ESPACE ADMIN</span>
          <Link href="/dashboard" style={s.backLink}>← Mon espace</Link>
        </div>
      </header>

      <div style={s.container}>
        <h1 style={{ fontSize: 26, margin: '0 0 4px' }}>Administration</h1>
        <p style={{ color: '#64748b', marginTop: 0, marginBottom: 24 }}>Pilotage de la plateforme — réservé à l'administrateur.</p>

        {/* Tabs */}
        <div style={s.tabs}>
          {[['overview', "Vue d'ensemble"], ['users', 'Utilisateurs'], ['comm', 'Communication'], ['jobs', 'Offres du jour']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={{ ...s.tab, ...(tab === k ? s.tabActive : {}) }}>{label}</button>
          ))}
        </div>

        {loading || !computed ? (
          <div style={{ ...s.card, textAlign: 'center', color: '#64748b' }}>Chargement des données…</div>
        ) : (
          <>
            {tab === 'overview' && <Overview c={computed} />}
            {tab === 'users' && <Users c={computed} />}
            {tab === 'comm' && <Communication c={computed} supabase={supabase} />}
            {tab === 'jobs' && <Jobs c={computed} />}
          </>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }) {
  return (
    <div style={{ ...s.card, borderLeft: `4px solid ${accent || PRIMARY}` }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{value}</div>
    </div>
  );
}

function Overview({ c }) {
  return (
    <div>
      <div style={s.kpiGrid}>
        <Kpi label="Chiffre d'affaires total" value={fmtMoney(c.caTotal)} />
        <Kpi label="CA ce mois-ci" value={fmtMoney(c.caMonth)} accent="#2563eb" />
        <Kpi label="Utilisateurs" value={c.users.length} accent="#a855f7" />
        <Kpi label="Abonnés actifs" value={c.byPlan.basique + c.byPlan.standard + c.byPlan.premium} accent="#f59e0b" />
      </div>

      <div style={{ ...s.card, marginTop: 20 }}>
        <h3 style={s.h3}>Répartition par offre</h3>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <PlanPill label="Basique" n={c.byPlan.basique} color="#0891b2" />
          <PlanPill label="Standard" n={c.byPlan.standard} color={PRIMARY} />
          <PlanPill label="Premium" n={c.byPlan.premium} color="#a855f7" />
          <PlanPill label="Sans abonnement actif" n={c.byPlan.aucun} color="#94a3b8" />
        </div>
      </div>

      <div style={{ ...s.card, marginTop: 20 }}>
        <h3 style={s.h3}>Nouveaux inscrits — 14 derniers jours</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, padding: '10px 0' }}>
          {c.days.map((d) => (
            <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: d.count ? '#0f172a' : '#cbd5e1' }}>{d.count}</span>
              <div style={{ width: '70%', height: `${Math.round((d.count / c.maxDay) * 90)}px`, minHeight: d.count ? 4 : 0, background: PRIMARY, borderRadius: 4 }} />
              <span style={{ fontSize: 9, color: '#94a3b8', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanPill({ label, n, color }) {
  return (
    <div style={{ flex: 1, minWidth: 120, padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{n}</div>
    </div>
  );
}

function Users({ c }) {
  return (
    <div style={{ ...s.card, overflowX: 'auto' }}>
      <h3 style={s.h3}>Tous les utilisateurs ({c.users.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#64748b', fontSize: 12 }}>
            <th style={s.th}>Utilisateur</th><th style={s.th}>Pays</th><th style={s.th}>Offre</th>
            <th style={s.th}>Inscrit le</th><th style={s.th}>CV</th><th style={s.th}>Lettres</th>
            <th style={s.th}>Candid.</th><th style={s.th}>Support</th>
          </tr>
        </thead>
        <tbody>
          {c.users.map((u) => (
            <tr key={u.id} style={{ borderTop: '1px solid #eef2f7', fontSize: 13 }}>
              <td style={s.td}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{u.email}</div>
                {u.phone && <div style={{ color: '#94a3b8', fontSize: 11 }}>{u.phone}</div>}
              </td>
              <td style={s.td}>{u.country || '—'}</td>
              <td style={s.td}><PlanTag plan={u.plan} /></td>
              <td style={s.td}>{fmtDate(u.created_at)}</td>
              <td style={s.td}>{u.hasCV ? '✅' : '—'}</td>
              <td style={s.td}>{u.letters}</td>
              <td style={s.td}>{u.apps}</td>
              <td style={s.td}>{u.support}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlanTag({ plan }) {
  const map = { basique: ['Basique', '#0891b2'], standard: ['Standard', PRIMARY], premium: ['Premium', '#a855f7'] };
  const [label, color] = map[plan] || ['Aucun', '#94a3b8'];
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + '1a', padding: '3px 8px', borderRadius: 999 }}>{label}</span>;
}

function Communication({ c, supabase }) {
  const [segment, setSegment] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const counts = { all: c.segAll, basique: c.segBasique, standard_premium: c.segPro };

  const send = async (test) => {
    if (!subject.trim() || !message.trim()) { setResult({ error: 'Renseigne un objet et un message.' }); return; }
    setSending(true); setResult(null);
    try {
      const r = await fetch('/api/admin/broadcast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment, subject, message, test }),
      });
      const j = await r.json();
      setResult(r.ok ? j : { error: j.error || 'Erreur' });
    } catch (e) { setResult({ error: String(e) }); }
    setSending(false);
  };

  return (
    <div style={s.card}>
      <h3 style={s.h3}>Envoyer un message à mes utilisateurs</h3>

      <label style={s.label}>Segment de destinataires</label>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        {[['all', 'Tous les utilisateurs'], ['basique', 'Basique uniquement'], ['standard_premium', 'Standard + Premium']].map(([k, label]) => (
          <button key={k} onClick={() => setSegment(k)} style={{ ...s.segBtn, ...(segment === k ? s.segBtnActive : {}) }}>
            {label} <span style={{ opacity: 0.7 }}>({counts[k]})</span>
          </button>
        ))}
      </div>

      <label style={s.label}>Objet</label>
      <input className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex : Nouvelles offres cette semaine 🚀" style={{ marginBottom: 14 }} />

      <label style={s.label}>Message</label>
      <textarea className="form-input" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Écris ton message... (les sauts de ligne sont conservés)" style={{ resize: 'vertical', marginBottom: 16 }} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" disabled={sending} onClick={() => send(true)}>📨 M'envoyer un test</button>
        <button className="btn btn-primary" disabled={sending} onClick={() => send(false)}>
          {sending ? 'Envoi…' : `Envoyer à ${counts[segment]} destinataire${counts[segment] > 1 ? 's' : ''}`}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 10, fontSize: 13, background: result.error ? '#fef2f2' : '#ecfdf5', border: `1px solid ${result.error ? '#fecaca' : '#a7f3d0'}`, color: result.error ? '#b91c1c' : '#065f46' }}>
          {result.error ? `❌ ${result.error}` : `✅ Envoyé. Destinataires : ${result.recipients} · Réussis : ${result.sent} · Ignorés : ${result.skipped} · Échecs : ${result.failed}${result.note ? ` — ${result.note}` : ''}`}
        </div>
      )}
    </div>
  );
}

function Jobs({ c }) {
  const Row = (j) => (
    <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid #eef2f7', borderRadius: 10, background: '#fff' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{j.role}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{[j.company, j.location].filter(Boolean).join(' • ')}</div>
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(j.created_at)}</span>
      {j.url && <a href={j.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: PRIMARY, fontWeight: 600 }}>Voir →</a>}
    </div>
  );
  return (
    <div>
      <div style={{ ...s.card, borderLeft: `4px solid ${PRIMARY}` }}>
        <h3 style={s.h3}>🆕 Nouvelles offres aujourd'hui ({c.newJobs.length})</h3>
        {c.newJobs.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Aucune nouvelle offre ajoutée aujourd'hui pour l'instant (le robot tourne chaque jour à 6h UTC).</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{c.newJobs.map(Row)}</div>
        )}
      </div>
      <div style={{ ...s.card, marginTop: 20 }}>
        <h3 style={s.h3}>📚 Offres précédentes ({c.oldJobs.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{c.oldJobs.map(Row)}</div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f1f5f9', color: '#0f172a' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0' },
  logo: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#0f172a', fontSize: 17 },
  logoDot: { background: PRIMARY, color: '#fff', width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  adminBadge: { fontSize: 11, fontWeight: 800, color: '#a855f7', background: '#a855f71a', padding: '4px 10px', borderRadius: 999, letterSpacing: '0.05em' },
  backLink: { color: '#64748b', fontSize: 14, fontWeight: 600 },
  container: { maxWidth: 1000, margin: '0 auto', padding: '28px 20px 60px' },
  tabs: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  tab: { padding: '9px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#475569' },
  tabActive: { background: PRIMARY, color: '#fff', borderColor: PRIMARY },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 },
  h3: { fontSize: 15, margin: '0 0 16px' },
  th: { padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap' },
  td: { padding: '10px', verticalAlign: 'top' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 },
  segBtn: { padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#475569' },
  segBtnActive: { background: PRIMARY + '1a', borderColor: PRIMARY, color: PRIMARY },
};
