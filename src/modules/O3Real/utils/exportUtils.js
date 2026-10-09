/**
 * CSV Export Utility
 * Converts filtered ward metrics into a cleanly formatted CSV and triggers a browser download.
 */

export function exportWardSummaryCSV(wardRows, filename = 'mumbai_urban_accessibility_summary.csv') {
  if (!wardRows || wardRows.length === 0) return;

  const headers = [
    'Ward Code',
    'Ward Name',
    'Zone',
    'Key Localities',
    'Total Population (Census 2011)',
    'Total Males',
    'Total Females',
    'SC Population',
    'ST Population',
    'Area (sq km)',
    'Population Density (persons/sq km)',
    'Total Healthcare Facilities',
    'Healthcare Facilities per 10k Residents',
    'Public Hospitals',
    'Dispensaries',
    'UPHCs',
    'Maternity Homes',
    'Hospital Beds (Registered)',
    'Total Schools',
    'Schools per 10k Residents',
    'Municipal Schools',
    'Private Unaided Schools',
    'Government Aided Schools',
    'Public Gardens & Parks',
    'Nearest Healthcare to Centroid (m)',
    'Nearest School to Centroid (m)'
  ];

  const rows = wardRows.map(w => [
    `"${w.wardCode}"`,
    `"${w.displayName}"`,
    `"${w.zone}"`,
    `"${w.localities.replace(/"/g, '""')}"`,
    w.population,
    w.males,
    w.females,
    w.scPopulation,
    w.stPopulation,
    w.areaKm2,
    w.density,
    w.healthcareCount,
    w.healthcarePer10k,
    w.healthTypes?.['Public Hospital'] || 0,
    w.healthTypes?.['Dispensary'] || 0,
    w.healthTypes?.['UPHC'] || 0,
    w.healthTypes?.['Maternity Home'] || 0,
    w.bedsCount || 0,
    w.schoolsCount,
    w.schoolsPer10k,
    w.schoolTypes?.['Municipal'] || 0,
    w.schoolTypes?.['Unaided'] || 0,
    w.schoolTypes?.['Aided'] || 0,
    w.parksCount || 0,
    w.nearestHealthMeters != null ? w.nearestHealthMeters : 'N/A',
    w.nearestSchoolMeters != null ? w.nearestSchoolMeters : 'N/A'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
