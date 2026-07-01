'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/context/AppContext';

// Bouton de l'offre GRATUITE : aucun paiement. Un compte connecté a déjà l'accès
// gratuit (= ancien Basique) -> on l'envoie directement à son espace. Sinon, on
// l'envoie créer son compte (il obtiendra l'accès gratuit juste après).
export default function FreePlanButton({ label = 'Commencer gratuitement', primary = false }) {
  const { user } = useContext(AppContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    // Suivi Meta : prendre l'offre GRATUITE = prospect -> événement "Lead" (jamais Purchase).
    // Déclenché une seule fois par navigateur.
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        if (localStorage.getItem('mfb_pixel_lead') !== '1') {
          window.fbq('track', 'Lead', { content_name: 'Offre Gratuite' });
          localStorage.setItem('mfb_pixel_lead', '1');
        }
      }
    } catch {}
    if (user) router.push('/dashboard');
    else router.push('/register');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`}
      style={{ width: '100%', padding: '15px 24px', fontSize: '15px', fontWeight: 700, minHeight: '52px' }}
    >
      {loading ? 'Redirection…' : label}
    </button>
  );
}
