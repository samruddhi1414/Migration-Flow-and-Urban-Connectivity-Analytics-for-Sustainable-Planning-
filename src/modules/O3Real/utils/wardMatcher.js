/**
 * Ward Matcher Utility
 * Standardizes Mumbai ward names and codes across BMC administrative datasets and Census 2011.
 * Greater Mumbai is divided into 24 administrative wards (A through T).
 */

export const CANONICAL_WARDS = [
  'A', 'B', 'C', 'D', 'E', 'F/N', 'F/S', 'G/N', 'G/S',
  'H/E', 'H/W', 'K/E', 'K/W', 'L', 'M/E', 'M/W',
  'N', 'P/N', 'P/S', 'R/C', 'R/N', 'R/S', 'S', 'T'
];

export const WARD_METADATA = {
  'A': { name: 'Ward A', zone: 'Island City', localities: 'Colaba, Fort, Marine Drive, Churchgate' },
  'B': { name: 'Ward B', zone: 'Island City', localities: 'Sandhurst Road, Masjid Bunder, Dongri, Mandvi' },
  'C': { name: 'Ward C', zone: 'Island City', localities: 'Marine Lines, Bhuleshwar, Chira Bazaar, Pydhonie' },
  'D': { name: 'Ward D', zone: 'Island City', localities: 'Grant Road, Malabar Hill, Walkeshwar, Tardeo, Girgaon' },
  'E': { name: 'Ward E', zone: 'Island City', localities: 'Byculla, Mazgaon, Mumbai Central, Nagpada' },
  'F/N': { name: 'Ward F/N', zone: 'Island City', localities: 'Matunga, Sion, Wadala East, King\'s Circle' },
  'F/S': { name: 'Ward F/S', zone: 'Island City', localities: 'Parel, Sewri, Naigaon, Lalbaug' },
  'G/N': { name: 'Ward G/N', zone: 'Island City', localities: 'Dadar West, Mahim, Dharavi' },
  'G/S': { name: 'Ward G/S', zone: 'Island City', localities: 'Worli, Lower Parel, Prabhadevi, Mahalaxmi' },
  'H/E': { name: 'Ward H/E', zone: 'Western Suburbs', localities: 'Santacruz East, Khar East, Bandra East, Kalina' },
  'H/W': { name: 'Ward H/W', zone: 'Western Suburbs', localities: 'Bandra West, Khar West, Santacruz West' },
  'K/E': { name: 'Ward K/E', zone: 'Western Suburbs', localities: 'Andheri East, Jogeshwari East, Vile Parle East' },
  'K/W': { name: 'Ward K/W', zone: 'Western Suburbs', localities: 'Andheri West, Versova, Juhu, Lokhandwala' },
  'L': { name: 'Ward L', zone: 'Eastern Suburbs', localities: 'Kurla, Chunabhatti, Sakinaka, Asalpha' },
  'M/E': { name: 'Ward M/E', zone: 'Eastern Suburbs', localities: 'Govandi, Mankhurd, Shivaji Nagar, Deonar' },
  'M/W': { name: 'Ward M/W', zone: 'Eastern Suburbs', localities: 'Chembur West, Tilak Nagar, Mahul' },
  'N': { name: 'Ward N', zone: 'Eastern Suburbs', localities: 'Ghatkopar, Vidyavihar, Pant Nagar' },
  'P/N': { name: 'Ward P/N', zone: 'Western Suburbs', localities: 'Malad, Marve, Madh, Dindoshi' },
  'P/S': { name: 'Ward P/S', zone: 'Western Suburbs', localities: 'Goregaon, Motilal Nagar, Aarey Colony' },
  'R/C': { name: 'Ward R/C', zone: 'Western Suburbs', localities: 'Borivali West, Gorai, Shimpoli, Eksar' },
  'R/N': { name: 'Ward R/N', zone: 'Western Suburbs', localities: 'Dahisar, Mandapeshwar' },
  'R/S': { name: 'Ward R/S', zone: 'Western Suburbs', localities: 'Kandivali, Charkop, Poisar, Samata Nagar' },
  'S': { name: 'Ward S', zone: 'Eastern Suburbs', localities: 'Bhandup, Powai, Kanjurmarg, Vikhroli West' },
  'T': { name: 'Ward T', zone: 'Eastern Suburbs', localities: 'Mulund, Nahur' }
};

/**
 * Normalizes any raw ward representation to the canonical 24 BMC ward codes.
 * Examples: 'R / C' -> 'R/C', 'FN' -> 'F/N', 'P/N1-WARD' -> 'P/N', 'Ward A' -> 'A'
 */
export function normalizeWardName(raw) {
  if (!raw || typeof raw !== 'string') return null;

  let s = raw.trim().toUpperCase()
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[-_]WARD\b/gi, '')
    .replace(/\bWARD[-_ ]*/gi, '')
    .replace(/\s+/g, '');

  if (CANONICAL_WARDS.includes(s)) return s;

  const twoLetterMatch = {
    'FN': 'F/N', 'FS': 'F/S', 'GN': 'G/N', 'GS': 'G/S',
    'HE': 'H/E', 'HW': 'H/W', 'KE': 'K/E', 'KW': 'K/W',
    'ME': 'M/E', 'MW': 'M/W', 'PN': 'P/N', 'PS': 'P/S',
    'RC': 'R/C', 'RN': 'R/N', 'RS': 'R/S'
  };
  if (twoLetterMatch[s]) return twoLetterMatch[s];

  if (s.startsWith('PN') || s.startsWith('P/N')) return 'P/N';
  if (s.startsWith('PS') || s.startsWith('P/S')) return 'P/S';
  if (s.startsWith('RC') || s.startsWith('R/C')) return 'R/C';
  if (s.startsWith('RN') || s.startsWith('R/N')) return 'R/N';
  if (s.startsWith('RS') || s.startsWith('R/S')) return 'R/S';
  if (s.startsWith('HE') || s.startsWith('H/E')) return 'H/E';
  if (s.startsWith('HW') || s.startsWith('H/W')) return 'H/W';
  if (s.startsWith('KE') || s.startsWith('K/E')) return 'K/E';
  if (s.startsWith('KW') || s.startsWith('K/W')) return 'K/W';
  if (s.startsWith('ME') || s.startsWith('M/E')) return 'M/E';
  if (s.startsWith('MW') || s.startsWith('M/W')) return 'M/W';
  if (s.startsWith('GN') || s.startsWith('G/N')) return 'G/N';
  if (s.startsWith('GS') || s.startsWith('G/S')) return 'G/S';
  if (s.startsWith('FN') || s.startsWith('F/N')) return 'F/N';
  if (s.startsWith('FS') || s.startsWith('F/S')) return 'F/S';

  const singleLetters = ['A', 'B', 'C', 'D', 'E', 'L', 'N', 'S', 'T'];
  for (const sl of singleLetters) {
    if (s === sl || s === `${sl}WARD` || s === `WARD${sl}`) return sl;
  }

  return null;
}
