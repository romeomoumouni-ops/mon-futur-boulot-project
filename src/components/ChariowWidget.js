'use client';

import { useEffect } from 'react';

const STORE_DOMAIN = process.env.NEXT_PUBLIC_CHARIOW_STORE_DOMAIN || 'bajiuulm.mychariow.shop';
const WIDGET_JS = 'https://js.chariowcdn.com/v1/widget.min.js';
const WIDGET_CSS = 'https://js.chariowcdn.com/v1/widget.min.css';

// Le script Chariow cible les éléments avec id="chariow-widget" (querySelectorAll,
// donc les "doublons" d'id sont OK) et lit les data-* de chacun. initializeWidget()
// est idempotent (re-scan sans duplication) → on peut l'appeler à chaque montage.
function ensureChariow() {
  if (typeof document === 'undefined') return;

  if (!document.querySelector(`link[href="${WIDGET_CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = WIDGET_CSS;
    document.head.appendChild(link);
  }
  if (!document.querySelector(`script[src="${WIDGET_JS}"]`)) {
    const script = document.createElement('script');
    script.src = WIDGET_JS;
    script.async = true;
    document.head.appendChild(script);
  }

  // Attend que l'API soit prête puis (ré)initialise les widgets de la page.
  let tries = 0;
  const tick = () => {
    const init = typeof window !== 'undefined' && window.Chariow && window.Chariow.initializeWidget;
    if (typeof init === 'function') {
      try { window.Chariow.initializeWidget(); } catch {}
      return;
    }
    if (tries++ < 50) setTimeout(tick, 150); // ~7,5s max
  };
  tick();
}

// Widget de paiement Snap (popup sur le site, sans quitter la page).
export default function ChariowWidget({
  productId,
  primaryColor = '#00b87c',
  ctaWidth = 'block',
  ctaText = "Choisir ce plan d'abonnement",
}) {
  useEffect(() => {
    ensureChariow();
  }, [productId]);

  return (
    <div
      id="chariow-widget"
      className="mfb-chariow"
      data-product-id={productId}
      data-store-domain={STORE_DOMAIN}
      data-style="tap"
      data-border-style="rounded"
      data-cta-width={ctaWidth}
      data-custom-cta-text={ctaText}
      data-background-color="#FFFFFF"
      data-cta-animation="shake_scale"
      data-locale="fr"
      data-primary-color={primaryColor}
    />
  );
}
