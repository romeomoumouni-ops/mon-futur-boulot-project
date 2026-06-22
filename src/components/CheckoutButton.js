'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';

// Bouton de paiement via l'API Chariow (pas de widget). Crée le paiement côté serveur
// puis redirige vers la page de paiement Moneroo. L'utilisateur doit être connecté.
export default function CheckoutButton({ plan, label = "Choisir ce plan d'abonnement", primary = true }) {
  const { user } = useContext(AppContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setError('');
    if (!user) {
      router.push('/register?next=/pricing');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/chariow/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push('/register?next=/pricing');
        return;
      }
      if (json.checkout_url) {
        window.location.href = json.checkout_url;
        return;
      }
      setError(json.error || 'Une erreur est survenue. Réessaie.');
      setLoading(false);
    } catch {
      setError('Erreur réseau. Réessaie.');
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`}
        style={{ width: '100%', padding: '15px 24px', fontSize: '15px', fontWeight: 700, minHeight: '52px' }}
      >
        {loading ? 'Redirection…' : label}
      </button>
      {error && (
        <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>{error}</p>
      )}
    </div>
  );
}
