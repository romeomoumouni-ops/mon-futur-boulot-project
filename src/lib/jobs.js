// Récupération de vraies offres d'emploi via JSearch (RapidAPI).
// Clé requise : RAPIDAPI_KEY (à définir dans Vercel / .env.local). Côté serveur uniquement.

const LOGO_COLORS = ['#00b87c', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2', '#ca8a04'];

function mapContract(type) {
  // Normalise "Full-time"/"FULLTIME"/"full_time" -> "FULLTIME"
  const norm = (type || '').replace(/[^a-z]/gi, '').toUpperCase();
  switch (norm) {
    case 'FULLTIME': return 'CDI';
    case 'PARTTIME': return 'Temps partiel';
    case 'CONTRACTOR': return 'Freelance';
    case 'INTERN': return 'Stage';
    case 'TEMPORARY': return 'CDD';
    default: return type || 'Emploi';
  }
}

function cleanDescription(desc) {
  if (!desc) return '';
  const cleaned = desc.replace(/\s+/g, ' ').trim();
  return cleaned.length > 600 ? cleaned.slice(0, 597) + '…' : cleaned;
}

function formatSalary(j) {
  if (!j.job_min_salary && !j.job_max_salary) return null;
  const cur = j.job_salary_currency || '';
  const per = j.job_salary_period ? `/${j.job_salary_period.toLowerCase()}` : '';
  if (j.job_min_salary && j.job_max_salary) return `${Math.round(j.job_min_salary)}–${Math.round(j.job_max_salary)} ${cur}${per}`;
  return `${Math.round(j.job_min_salary || j.job_max_salary)} ${cur}${per}`;
}

// Interroge JSearch et renvoie des offres normalisées (prêtes pour la table `jobs`).
export async function fetchJSearchJobs({ query, limit = 5 }) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.log('[jobs] RAPIDAPI_KEY absent — aucune offre récupérée');
    return [];
  }

  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`;
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
  } catch (err) {
    console.error('[jobs] fetch JSearch échec', err?.message || err);
    return [];
  }

  if (!res.ok) {
    console.error('[jobs] JSearch HTTP', res.status, await res.text().catch(() => ''));
    return [];
  }

  const json = await res.json().catch(() => ({}));
  const data = Array.isArray(json.data) ? json.data : [];

  return data
    .filter((j) => j.job_id && j.job_title && j.job_apply_link)
    .slice(0, limit)
    .map((j, i) => ({
      external_id: j.job_id,
      role: j.job_title,
      company: j.employer_name || 'Entreprise',
      location: [j.job_city, j.job_country].filter(Boolean).join(', ') || null,
      country: j.job_country || null,
      contract: mapContract((j.job_employment_types && j.job_employment_types[0]) || j.job_employment_type),
      salary: formatSalary(j),
      url: j.job_apply_link,
      description: cleanDescription(j.job_description),
      logo: (j.employer_name || '?').trim().charAt(0).toUpperCase(),
      logo_bg: LOGO_COLORS[i % LOGO_COLORS.length],
      source: 'jsearch',
      posted_at: j.job_posted_at_datetime_utc || null,
    }));
}
