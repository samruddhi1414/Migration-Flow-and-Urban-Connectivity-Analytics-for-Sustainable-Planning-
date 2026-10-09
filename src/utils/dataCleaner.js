/**
 * Data cleaning, conversion, and normalization utility
 */

export function cleanNumeric(val, fallback = 0) {
  if (val === null || val === undefined || val === '' || val === 'NA' || val === 'N/A' || val === 'NaN') {
    return fallback;
  }
  const str = String(val).trim().replace(/,/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

export function parseStatusCode(val) {
  // Census DCHB status standard: 1 = Available, 2 = Not Available
  if (val === 1 || val === '1' || val === true) return true;
  return false;
}

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return new Intl.NumberFormat('en-IN').format(Math.round(num));
}

export function formatDecimal(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return Number(num).toFixed(decimals);
}

export function formatPercent(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return `${Number(num).toFixed(decimals)}%`;
}

export function formatCompactNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} K`;
  return formatNumber(num);
}

export function getPressureColor(score) {
  if (score === null || score === undefined) return '#64748b';
  if (score <= 20) return '#10b981'; // Adequate (Green)
  if (score <= 40) return '#06b6d4'; // Moderate (Cyan/Blue)
  if (score <= 60) return '#f59e0b'; // High (Amber)
  if (score <= 80) return '#f97316'; // Very High (Orange)
  return '#ef4444';                  // Critical (Red)
}

export function getPressureCategory(score) {
  if (score === null || score === undefined) return 'N/A';
  if (score <= 20) return 'Adequate';
  if (score <= 40) return 'Moderate Pressure';
  if (score <= 60) return 'High Pressure';
  if (score <= 80) return 'Very High Pressure';
  return 'Critical';
}

export function getSustainabilityColor(score) {
  if (score === null || score === undefined) return '#64748b';
  if (score >= 80) return '#10b981'; // High Sustainability
  if (score >= 50) return '#f59e0b'; // Moderate Sustainability
  return '#ef4444';                  // Low Sustainability / Urgent Action
}
