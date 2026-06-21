'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Page d'arrivée après paiement (URL de redirection à mettre dans Chariow).
// Elle attend que le webhook ait débloqué l'accès, puis envoie au dashboard.
export default function BienvenuePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [status, setStatus] = useState('checking'); // checking | active | waiting | nosession
  const [note, setNote] = useState('');
  const [entering, setEntering] = useState(false);

  // Bouton sûr : ne va au dashboard QUE si l'accès est réellement débloqué
  // (évite d'être renvoyé vers /pricing si le paiement n'est pas encore validé).
  const handleEnter = async () => {
    setEntering(true);
    setNote('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setStatus('nosession'); setEntering(false); return; }
    const { data: ok } = await supabase.rpc('has_active_access');
    setEntering(false);
    if (ok === true) {
      router.push('/dashboard');
    } else {
      setNote('⏳ Ton accès finit de s’activer, patiente quelques secondes puis réessaie.');
    }
  };

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    const check = async () => {
      if (cancelled) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('nosession');
        return;
      }
      const { data: ok } = await supabase.rpc('has_active_access');
      if (cancelled) return;
      if (ok === true) {
        setStatus('active');
        setTimeout(() => router.push('/dashboard'), 1200);
        return;
      }
      tries += 1;
      setStatus('waiting');
      if (tries < 30) setTimeout(check, 3000); // ~90s d'attente max
    };

    check();
    return () => { cancelled = true; };
  }, [supabase, router]);

  return (
    <div className="dark-theme" style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoDot}>M</span>
          <strong>MonFuturBoulot</strong><span style={{ color: 'var(--primary)' }}>.com</span>
        </div>

        {status === 'active' ? (
          <>
            <div style={styles.emoji}>✅</div>
            <h1 style={styles.title}>Accès activé !</h1>
            <p style={styles.text}>Redirection vers ton espace…</p>
          </>
        ) : status === 'nosession' ? (
          <>
            <div style={styles.emoji}>🎉</div>
            <h1 style={styles.title}>Merci pour ton paiement !</h1>
            <p style={styles.text}>
              Connecte-toi avec l'adresse e-mail utilisée pour le paiement afin d'accéder à ton espace.
            </p>
            <Link href="/register" className="btn btn-primary" style={styles.btn}>Se connecter →</Link>
          </>
        ) : (
          <>
            <div style={styles.spinner} />
            <h1 style={styles.title}>Merci pour ton paiement ! 🎉</h1>
            <p style={styles.text}>
              Activation de ton accès en cours… cela prend quelques secondes.
            </p>
            <button className="btn btn-primary" style={styles.btn} onClick={handleEnter} disabled={entering}>
              {entering ? 'Vérification…' : 'Accéder à mon espace →'}
            </button>
            {note && <p style={{ ...styles.text, color: 'var(--primary)', marginTop: '14px', marginBottom: 0, fontWeight: 600 }}>{note}</p>}
            <p style={styles.hint}>
              Ton accès s'active automatiquement après le paiement. Assure-toi d'avoir payé avec la
              même adresse e-mail que ton compte.
            </p>
          </>
        )}
      </div>

      <style>{`@keyframes mfbspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 28px',
    textAlign: 'center',
  },
  logo: { fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  logoDot: { backgroundColor: 'var(--primary)', color: '#fff', width: '28px', height: '28px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  emoji: { fontSize: '44px', marginBottom: '10px' },
  title: { color: '#fff', fontSize: '24px', fontWeight: '800', marginBottom: '10px' },
  text: { color: 'var(--dark-text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' },
  btn: { width: '100%', display: 'inline-block', textAlign: 'center' },
  hint: { color: 'var(--dark-text-muted)', fontSize: '12px', marginTop: '16px', lineHeight: 1.5 },
  spinner: {
    width: '40px', height: '40px', borderRadius: '50%',
    border: '4px solid var(--dark-border)', borderTopColor: 'var(--primary)',
    margin: '0 auto 18px', animation: 'mfbspin 0.8s linear infinite',
  },
};
