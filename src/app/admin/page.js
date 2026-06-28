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
      const sinceAnalytics = new Date(Date.now() - 90 * 86400000).toISOString();
      const [profiles, subs, letters, apps, cvs, support, jobs, messages, events] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, email, country, phone, created_at').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('user_id, email, plan, status, amount, expires_at, created_at'),
        supabase.from('cover_letters').select('user_id'),
        supabase.from('applications').select('user_id'),
        supabase.from('user_cvs').select('user_id, updated_at'),
        supabase.from('support_messages').select('user_id, sender'),
        supabase.from('jobs').select('id, role, company, location, country, contract, url, source, created_at').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('id, name, email, subject, message, status, reply, replied_at, created_at').order('created_at', { ascending: false }),
        supabase.from('analytics_events').select('event, anon_id, created_at').gte('created_at', sinceAnalytics),
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
        messages: messages.data || [],
        events: events.data || [],
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

    const messages = data.messages || [];
    const unreadMessages = messages.filter((m) => m.status === 'unread').length;

    // Funnel d'acquisition (suivi first-party + données réelles du compte)
    const events = data.events || [];
    const funnelFor = (windowDays) => {
      const since = windowDays ? now - windowDays * 86400000 : 0;
      const inP = (ts) => ts && new Date(ts).getTime() >= since;
      const evP = events.filter((e) => inP(e.created_at));
      const uniq = (name) => new Set(evP.filter((e) => e.event === name && e.anon_id).map((e) => e.anon_id)).size;
      return {
        visiteurs: uniq('page_view'),
        scroll: uniq('scroll_bottom'),
        tentatives: evP.filter((e) => e.event === 'signup_attempt').length,
        inscriptions: data.profiles.filter((p) => inP(p.created_at)).length,
        abonnements: data.subs.filter((s) => (s.amount || 0) > 0 && inP(s.created_at)).length,
      };
    };
    const funnel = { 7: funnelFor(7), 30: funnelFor(30), 90: funnelFor(90) };

    return { caTotal, caMonth, byPlan, days, maxDay, users, segAll, segBasique, segPro, newJobs, oldJobs, messages, unreadMessages, funnel };
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
          {[['overview', "Vue d'ensemble"], ['meta', 'Résultats Pub Meta'], ['users', 'Utilisateurs'], ['messagerie', 'Messagerie'], ['comm', 'Communication'], ['jobs', 'Offres du jour']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={{ ...s.tab, ...(tab === k ? s.tabActive : {}) }}>
              {label}
              {k === 'messagerie' && computed?.unreadMessages > 0 && (
                <span style={{ marginLeft: 7, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 9999, padding: '1px 7px' }}>{computed.unreadMessages}</span>
              )}
            </button>
          ))}
        </div>

        {loading || !computed ? (
          <div style={{ ...s.card, textAlign: 'center', color: '#64748b' }}>Chargement des données…</div>
        ) : (
          <>
            {tab === 'overview' && <Overview c={computed} />}
            {tab === 'meta' && <MetaFunnel c={computed} />}
            {tab === 'users' && <Users c={computed} />}
            {tab === 'messagerie' && <Messagerie c={computed} supabase={supabase} />}
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

function MetaFunnel({ c }) {
  const [days, setDays] = useState(30);
  const f = (c.funnel && c.funnel[days]) || { visiteurs: 0, scroll: 0, tentatives: 0, inscriptions: 0, abonnements: 0 };

  const steps = [
    { key: 'visiteurs', label: 'Visiteurs de la page', value: f.visiteurs, color: '#3b82f6' },
    { key: 'scroll', label: "Ont lu jusqu'en bas", value: f.scroll, color: '#6366f1' },
    { key: 'tentatives', label: "Ont tenté de s'inscrire", value: f.tentatives, color: '#8b5cf6' },
    { key: 'inscriptions', label: 'Inscriptions', value: f.inscriptions, color: '#10b981' },
    { key: 'abonnements', label: 'Abonnements payés', value: f.abonnements, color: PRIMARY },
  ];
  const max = Math.max(1, ...steps.map((x) => x.value));
  const rate = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

  return (
    <div>
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 6 }}>
          <h3 style={{ ...s.h3, margin: 0 }}>Funnel d'acquisition</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {[[7, '7 jours'], [30, '30 jours'], [90, '90 jours']].map(([k, label]) => (
              <button key={k} onClick={() => setDays(k)} style={{ ...s.segBtn, ...(days === k ? s.segBtnActive : {}) }}>{label}</button>
            ))}
          </div>
        </div>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4, marginBottom: 22 }}>
          Parcours réel des visiteurs, de l'arrivée sur le site jusqu'à l'abonnement.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {steps.map((st, i) => {
            const prev = i > 0 ? steps[i - 1].value : null;
            return (
              <div key={st.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{st.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: st.color }}>{st.value}</span>
                </div>
                <div style={{ height: 12, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, (st.value / max) * 100)}%`, height: '100%', background: st.color, borderRadius: 999, transition: 'width .3s' }} />
                </div>
                {prev !== null && (
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
                    {rate(st.value, prev)}% de « {steps[i - 1].label.toLowerCase()} »
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Taux clés */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
          <MiniRate label="Visiteur → Inscription" value={rate(f.inscriptions, f.visiteurs)} />
          <MiniRate label="Inscription → Abonnement" value={rate(f.abonnements, f.inscriptions)} />
          <MiniRate label="Visiteur → Abonnement" value={rate(f.abonnements, f.visiteurs)} />
        </div>
      </div>

      <div style={{ ...s.card, marginTop: 16, background: '#f8fafc' }}>
        <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          <strong>D'où viennent ces chiffres ?</strong> Suivi <strong>first-party</strong> de ton site (tes propres données, sans dépendre de Meta) :
          « Visiteurs » et « Lu jusqu'en bas » sont mesurés sur la page d'accueil ; « Inscriptions » et « Abonnements » viennent de ta base.
          À recouper avec le <strong>Gestionnaire d'événements Meta</strong> (le Pixel envoie aussi PageView / Purchase à Meta).
          Le suivi démarre à partir d'aujourd'hui : l'historique se remplit au fil des visites.
        </p>
      </div>
    </div>
  );
}

function MiniRate({ label, value }) {
  return (
    <div style={{ flex: '1 1 160px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: PRIMARY }}>{value}%</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Messagerie({ c, supabase }) {
  const [items, setItems] = useState(c.messages || []);
  const [openId, setOpenId] = useState(null);
  const [replies, setReplies] = useState({});
  const [sendingId, setSendingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const statusBadge = (status) => {
    const map = {
      unread: ['Non lu', '#ef4444'],
      read: ['Lu', '#64748b'],
      replied: ['Répondu', PRIMARY],
    };
    const [label, color] = map[status] || map.read;
    return <span style={{ fontSize: 11, fontWeight: 700, color, background: color + '1a', padding: '3px 8px', borderRadius: 999 }}>{label}</span>;
  };

  const openMessage = async (m) => {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    if (next && m.status === 'unread') {
      setItems((prev) => prev.map((x) => x.id === m.id ? { ...x, status: 'read' } : x));
      try { await supabase.from('contact_messages').update({ status: 'read' }).eq('id', m.id); } catch {}
    }
  };

  const sendReply = async (m) => {
    const reply = (replies[m.id] || '').trim();
    if (!reply) { setFeedback({ id: m.id, error: 'Écris une réponse.' }); return; }
    setSendingId(m.id); setFeedback(null);
    try {
      const r = await fetch('/api/admin/contact-reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, reply }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erreur');
      setItems((prev) => prev.map((x) => x.id === m.id ? { ...x, status: 'replied', reply, replied_at: new Date().toISOString() } : x));
      setFeedback({ id: m.id, ok: j.delivered === false ? 'Réponse enregistrée (e-mail non configuré sur le serveur).' : 'Réponse envoyée à ' + m.email });
    } catch (e) {
      setFeedback({ id: m.id, error: String(e.message || e) });
    }
    setSendingId(null);
  };

  if (!items.length) {
    return <div style={{ ...s.card, textAlign: 'center', color: '#64748b' }}>Aucun message de contact pour le moment.</div>;
  }

  return (
    <div style={s.card}>
      <h3 style={s.h3}>Messages reçus ({items.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((m) => (
          <div key={m.id} style={{ border: '1px solid #eef2f7', borderRadius: 12, overflow: 'hidden', background: m.status === 'unread' ? '#fffdf5' : '#fff' }}>
            <button onClick={() => openMessage(m)} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14 }}>{m.subject}</strong>
                  {statusBadge(m.status)}
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{m.name} · {m.email}</div>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{fmtDate(m.created_at)}</span>
            </button>

            {openId === m.id && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap', margin: '14px 0 16px' }}>{m.message}</div>

                {m.status === 'replied' && m.reply && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', marginBottom: 4 }}>Ta réponse</div>
                    <div style={{ fontSize: 13, color: '#065f46', whiteSpace: 'pre-wrap' }}>{m.reply}</div>
                  </div>
                )}

                <label style={s.label}>{m.status === 'replied' ? 'Répondre à nouveau' : 'Répondre'}</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={replies[m.id] || ''}
                  onChange={(e) => setReplies((p) => ({ ...p, [m.id]: e.target.value }))}
                  placeholder={`Réponse à ${m.name}… (envoyée par e-mail)`}
                  style={{ resize: 'vertical', marginBottom: 12 }}
                />
                <button className="btn btn-primary" disabled={sendingId === m.id} onClick={() => sendReply(m)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  {sendingId === m.id ? 'Envoi…' : 'Envoyer la réponse'}
                </button>

                {feedback && feedback.id === m.id && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 10, fontSize: 13, background: feedback.error ? '#fef2f2' : '#ecfdf5', border: `1px solid ${feedback.error ? '#fecaca' : '#a7f3d0'}`, color: feedback.error ? '#b91c1c' : '#065f46' }}>
                    {feedback.error || feedback.ok}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
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
