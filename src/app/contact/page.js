'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const SUPPORT_EMAIL = 'support@monfuturboulot.com';

const SUBJECTS = [
  'Question sur mon compte',
  'Problème technique',
  'Abonnement & paiement',
  'Partenariat / entreprise',
  'Autre',
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      setErrorMsg('Merci de remplir tous les champs.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error('fail');
      setStatus('sent');
    } catch {
      setErrorMsg("Une erreur est survenue. Réessaie ou écris-nous directement à " + SUPPORT_EMAIL + '.');
      setStatus('error');
    }
  };

  return (
    <div style={styles.page}>
      {/* Header simple */}
      <header style={styles.header}>
        <div className="container" style={styles.headerInner}>
          <Link href="/" style={styles.logo}>
            <span style={styles.logoMark}>M</span>
            <span style={styles.logoText}>MonFuturBoulot<span style={{ color: 'var(--primary)' }}>.com</span></span>
          </Link>
          <Link href="/" style={styles.backLink}>← Retour à l'accueil</Link>
        </div>
      </header>

      <main className="container" style={styles.main}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={styles.title}>Contactez-nous</h1>
          <p style={styles.subtitle}>Une question, un souci, une idée ? Notre équipe est là pour t'aider.</p>
        </div>

        <div style={styles.grid}>
          {/* Colonne gauche : infos de contact */}
          <div style={styles.leftCol}>
            <h2 style={styles.colTitle}>Informations de contact</h2>
            <p style={styles.colDesc}>Choisis le moyen le plus adapté à ton besoin.</p>

            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
              </span>
              <div>
                <strong style={styles.infoTitle}>Email support</strong>
                <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.infoLink}>{SUPPORT_EMAIL}</a>
                <span style={styles.infoMeta}>Nous répondons généralement sous 24 h.</span>
              </div>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
              <div>
                <strong style={styles.infoTitle}>Centre d'aide</strong>
                <span style={styles.infoMeta}>Une question fréquente ? Pose-la directement via le formulaire ci-contre, on te répond sous 24 h.</span>
              </div>
            </div>

            <div style={styles.infoCard}>
              <span style={styles.infoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              <div>
                <strong style={styles.infoTitle}>Demandes professionnelles</strong>
                <span style={styles.infoMeta}>Partenariats, solutions entreprise ou autres demandes : utilise le formulaire ou écris-nous.</span>
                <a href={`mailto:${SUPPORT_EMAIL}`} style={styles.infoLink}>{SUPPORT_EMAIL}</a>
              </div>
            </div>
          </div>

          {/* Colonne droite : formulaire */}
          <div style={styles.rightCol}>
            {status === 'sent' ? (
              <div style={styles.successBox}>
                <span style={styles.successIcon}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
                <h2 style={{ margin: '0 0 8px' }}>Message envoyé !</h2>
                <p style={{ color: 'var(--light-text-muted)', margin: 0 }}>
                  Merci {name ? name.split(' ')[0] : ''} — on revient vers toi par email très vite (sous 24 h).
                </p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Retour à l'accueil</Link>
              </div>
            ) : (
              <>
                <h2 style={{ margin: '0 0 20px' }}>Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit}>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Nom *</label>
                      <input className="form-input" placeholder="Ton nom" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Email *</label>
                      <input className="form-input" type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Sujet *</label>
                    <select className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} required>
                      <option value="">Choisis un sujet</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Message *</label>
                    <textarea className="form-input" rows={6} placeholder="Dis-nous comment on peut t'aider…" value={message} onChange={(e) => setMessage(e.target.value)} required style={{ resize: 'vertical', minHeight: '140px' }} />
                  </div>

                  {status === 'error' && (
                    <p style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '14px' }}>{errorMsg}</p>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={status === 'sending'} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} MonFuturBoulot. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--light-bg)', display: 'flex', flexDirection: 'column' },
  header: { borderBottom: '1px solid var(--light-border)', background: '#fff', padding: '14px 0' },
  headerInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  logoMark: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '9px', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: '18px' },
  logoText: { fontWeight: 800, fontSize: '18px', color: 'var(--light-text)' },
  backLink: { color: 'var(--light-text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 },
  main: { flex: 1, padding: '48px 16px 64px' },
  title: { fontSize: '34px', fontWeight: 800, color: 'var(--light-text)', margin: '0 0 10px' },
  subtitle: { color: 'var(--light-text-muted)', fontSize: '16px', margin: 0 },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', maxWidth: '1040px', margin: '0 auto' },
  leftCol: { flex: '1 1 300px', minWidth: '280px' },
  rightCol: { flex: '1.6 1 420px', minWidth: '300px', background: '#fff', border: '1px solid var(--light-border)', borderRadius: '18px', padding: '28px' },
  colTitle: { fontSize: '22px', fontWeight: 800, margin: '0 0 6px' },
  colDesc: { color: 'var(--light-text-muted)', fontSize: '14px', margin: '0 0 20px' },
  infoCard: { display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#fff', border: '1px solid var(--light-border)', borderRadius: '14px', padding: '16px', marginBottom: '14px' },
  infoIcon: { flexShrink: 0, width: '42px', height: '42px', borderRadius: '11px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  infoTitle: { display: 'block', fontSize: '15px', fontWeight: 700, marginBottom: '3px' },
  infoLink: { display: 'block', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none', marginBottom: '3px' },
  infoMeta: { display: 'block', fontSize: '12.5px', color: 'var(--light-text-muted)', lineHeight: 1.5 },
  row: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' },
  field: { flex: '1 1 180px' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--light-text)' },
  successBox: { textAlign: 'center', padding: '24px 8px' },
  successIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', marginBottom: '16px' },
  footer: { borderTop: '1px solid var(--light-border)', padding: '20px 16px', textAlign: 'center', color: 'var(--light-text-muted)', fontSize: '13px' },
};
