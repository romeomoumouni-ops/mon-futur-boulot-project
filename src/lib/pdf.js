// Génération du PDF du CV à partir du conteneur d'aperçu rendu à l'écran.
// On capture l'élément `.cv-preview-container` (le CV mis en forme, fond blanc).

export async function generateCvPdf(mode = 'save', firstName = 'cv', lastName = '') {
  if (typeof window === 'undefined') return;

  const el = document.querySelector('.cv-preview-container');
  if (!el) {
    alert("Impossible de trouver l'aperçu du CV. Ouvre l'éditeur de CV puis réessaie.");
    return;
  }

  let html2pdf;
  try {
    html2pdf = (await import('html2pdf.js')).default;
  } catch (e) {
    alert("Le module de génération PDF n'a pas pu être chargé. Réessaie dans un instant.");
    return;
  }

  const safeName = `${firstName || 'cv'}-${lastName || ''}`
    .toLowerCase()
    .normalize('NFD')               // décompose les accents (é -> e + ́)
    .replace(/[^a-z0-9]+/g, '-')    // ne garde que lettres/chiffres
    .replace(/^-+|-+$/g, '');

  const opt = {
    margin: 0,
    filename: `CV-${safeName || 'monfuturboulot'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  const worker = html2pdf().set(opt).from(el);

  try {
    if (mode === 'open') {
      const url = await worker.output('bloburl');
      window.open(url, '_blank');
    } else {
      await worker.save();
    }
  } catch (e) {
    alert("Une erreur est survenue pendant la génération du PDF. Réessaie.");
  }
}
