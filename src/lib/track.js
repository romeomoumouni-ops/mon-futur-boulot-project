// Suivi first-party léger (funnel d'acquisition) — envoie un événement à /api/track.
// Ne casse jamais l'UX (tout est encapsulé en try/catch, envoi non bloquant).

const ALLOWED = ['page_view', 'signup_attempt', 'scroll_bottom'];

export function getAnonId() {
  try {
    let id = localStorage.getItem('mfb_anon_id');
    if (!id) {
      id = 'a_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('mfb_anon_id', id);
    }
    return id;
  } catch {
    return null;
  }
}

export function track(event, path) {
  try {
    if (typeof window === 'undefined' || !ALLOWED.includes(event)) return;
    const body = JSON.stringify({
      event,
      anonId: getAnonId(),
      path: path || window.location.pathname,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch {
    // silencieux
  }
}

// Envoie un événement une seule fois par session de page (évite les doublons au scroll).
const fired = new Set();
export function trackOnce(event, path) {
  if (fired.has(event)) return;
  fired.add(event);
  track(event, path);
}
