/**
 * Robust GeoJSON district matcher
 * Matches district data with GeoJSON properties using code, canonical name, and alias mappings.
 */

export const DISTRICT_CODE_NAME_MAP = {
  "497": "Nandurbar",
  "498": "Dhule",
  "499": "Jalgaon",
  "500": "Buldhana",
  "501": "Akola",
  "502": "Washim",
  "503": "Amravati",
  "504": "Wardha",
  "505": "Nagpur",
  "506": "Bhandara",
  "507": "Gondia",
  "508": "Gadchiroli",
  "509": "Chandrapur",
  "510": "Yavatmal",
  "511": "Nanded",
  "512": "Hingoli",
  "513": "Parbhani",
  "514": "Jalna",
  "515": "Aurangabad",
  "516": "Nashik",
  "517": "Thane",
  "518": "Mumbai Suburban",
  "519": "Mumbai",
  "520": "Raigad",
  "521": "Pune",
  "522": "Ahmednagar",
  "523": "Beed",
  "524": "Latur",
  "525": "Osmanabad",
  "526": "Solapur",
  "527": "Satara",
  "528": "Ratnagiri",
  "529": "Sindhudurg",
  "530": "Kolhapur",
  "531": "Sangli",
  "732": "Palghar"
};

export const DISTRICT_ALIASES = {
  "buldana": "500",
  "buldhana": "500",
  "gondiya": "507",
  "gondia": "507",
  "raigarh": "520",
  "raigad": "520",
  "ahmadnagar": "522",
  "ahmednagar": "522",
  "ahilyanagar": "522",
  "bid": "523",
  "beed": "523",
  "osmanabad": "525",
  "dharashiv": "525",
  "chhatrapati sambhajinagar": "515",
  "aurangabad": "515",
  "mumbai": "519",
  "mumbai suburban": "518",
  "mumbai city": "519",
  "thane": "517",
  "palghar": "732"
};

export function normalizeDistrictName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/[*()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchDistrictToData(geoProperties, districtDataList) {
  if (!geoProperties || !districtDataList) return null;
  
  const dtCode = String(geoProperties.dt_code || '').trim().padStart(3, '0');
  const districtName = normalizeDistrictName(geoProperties.district || geoProperties.NAME_2 || geoProperties.DISTRICT);

  // 1. Match by Code
  if (dtCode) {
    const byCode = districtDataList.find(d => String(d.districtCode).padStart(3, '0') === dtCode);
    if (byCode) return byCode;
  }

  // 2. Match by canonical alias
  const aliasCode = DISTRICT_ALIASES[districtName];
  if (aliasCode) {
    const byAlias = districtDataList.find(d => String(d.districtCode).padStart(3, '0') === aliasCode);
    if (byAlias) return byAlias;
  }

  // 3. Match by normalized name contains
  const byName = districtDataList.find(d => {
    const dNameNorm = normalizeDistrictName(d.districtName);
    return dNameNorm === districtName || dNameNorm.includes(districtName) || districtName.includes(dNameNorm);
  });

  return byName || null;
}
