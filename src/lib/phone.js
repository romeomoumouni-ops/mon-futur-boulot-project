// Validation des numéros de téléphone par pays (mêmes règles qu'à l'inscription).
// natLen = nombre de chiffres du numéro NATIONAL (hors indicatif), tel qu'écrit localement.

export const COUNTRY_INFO = {
  "Côte d'Ivoire": { iso: 'CI', dial: '+225', placeholder: '+225 07 12 34 56 78', natLen: 10 },
  'Sénégal': { iso: 'SN', dial: '+221', placeholder: '+221 77 123 45 67', natLen: 9 },
  'Cameroun': { iso: 'CM', dial: '+237', placeholder: '+237 6 71 23 45 67', natLen: 9 },
  'Bénin': { iso: 'BJ', dial: '+229', placeholder: '+229 01 23 45 67 89', natLen: 10 },
  'Togo': { iso: 'TG', dial: '+228', placeholder: '+228 90 12 34 56', natLen: 8 },
  'Mali': { iso: 'ML', dial: '+223', placeholder: '+223 70 12 34 56', natLen: 8 },
  'Burkina Faso': { iso: 'BF', dial: '+226', placeholder: '+226 70 12 34 56', natLen: 8 },
  'Gabon': { iso: 'GA', dial: '+241', placeholder: '+241 06 12 34 56', natLen: 8 },
};

export const COUNTRY_NAMES = Object.keys(COUNTRY_INFO);

// Numéro national (chiffres, sans indicatif) pour un pays donné.
export function nationalDigits(phone, countryName) {
  const info = COUNTRY_INFO[countryName];
  let digits = String(phone || '').replace(/[^0-9]/g, '');
  if (info) {
    const dd = info.dial.replace(/[^0-9]/g, '');
    if (digits.startsWith(dd)) digits = digits.slice(dd.length);
  }
  return digits;
}

// Numéro valide = bon nombre de chiffres nationaux pour le pays sélectionné.
export function isValidPhone(phone, countryName) {
  const info = COUNTRY_INFO[countryName];
  if (!info) return String(phone || '').replace(/[^0-9]/g, '').length >= 8;
  return nationalDigits(phone, countryName).length === info.natLen;
}
