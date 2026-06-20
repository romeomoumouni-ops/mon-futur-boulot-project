// Génération du PDF du CV à partir du conteneur d'aperçu rendu à l'écran.
// On capture l'élément `.cv-preview-container` (le CV mis en forme, fond blanc).
//
// Particularités mobiles (iOS Safari) :
//  - l'attribut <a download> est ignoré → on passe par navigator.share (feuille
//    « Enregistrer dans Fichiers / WhatsApp… ») quand c'est disponible ;
//  - window.open() après un await est bloqué → pour l'aperçu on navigue dans
//    l'onglet courant si l'ouverture en nouvel onglet est refusée.

async function buildPdfBlob(firstName, lastName) {
  const el = document.querySelector('.cv-preview-container');
  if (!el) {
    alert("Impossible de trouver l'aperçu du CV. Ouvre l'éditeur de CV puis réessaie.");
    return null;
  }

  let html2pdf;
  try {
    html2pdf = (await import('html2pdf.js')).default;
  } catch (e) {
    alert("Le module de génération PDF n'a pas pu être chargé. Réessaie dans un instant.");
    return null;
  }

  const safeName = `${firstName || 'cv'}-${lastName || ''}`
    .toLowerCase()
    .normalize('NFD')               // décompose les accents (é -> e + ́)
    .replace(/[^a-z0-9]+/g, '-')    // ne garde que lettres/chiffres
    .replace(/^-+|-+$/g, '');

  const filename = `CV-${safeName || 'monfuturboulot'}.pdf`;

  const opt = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    const blob = await html2pdf().set(opt).from(el).output('blob');
    return { blob, filename };
  } catch (e) {
    alert("Une erreur est survenue pendant la génération du PDF. Réessaie.");
    return null;
  }
}

export async function generateCvPdf(mode = 'save', firstName = 'cv', lastName = '') {
  if (typeof window === 'undefined') return;

  const result = await buildPdfBlob(firstName, lastName);
  if (!result) return;
  const { blob, filename } = result;

  // ---- APERÇU : ouvrir le PDF (nouvel onglet, sinon onglet courant) ----
  if (mode === 'open') {
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      // mobile : ouverture en nouvel onglet bloquée → on ouvre dans l'onglet courant
      window.location.href = url;
    }
    return;
  }

  // ---- TÉLÉCHARGER ----
  const file = new File([blob], filename, { type: 'application/pdf' });

  // 1) Mobile (iOS/Android) : partage natif -> « Enregistrer dans Fichiers », WhatsApp, etc.
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Mon CV', text: 'Mon CV — MonFuturBoulot.com' });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return; // l'utilisateur a annulé
      // sinon on tente le téléchargement classique ci-dessous
    }
  }

  // 2) Desktop : téléchargement classique
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
