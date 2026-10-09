/**
 * Critical Pressure Score Calculation
 * Formula: PRESSURE SCORE = ( MOVEMENT DEMAND INDEX + (100 - INFRASTRUCTURE AVAILABILITY INDEX) ) / 2
 */

export function calculatePressureScore(demandIndex, infrastructureIndex) {
  const d = Math.max(0, Math.min(100, demandIndex));
  const i = Math.max(0, Math.min(100, infrastructureIndex));

  const score = Number(((d + (100.0 - i)) / 2.0).toFixed(1));

  let category = 'Adequate';
  if (score > 80) category = 'Critical';
  else if (score > 60) category = 'Very High Pressure';
  else if (score > 40) category = 'High Pressure';
  else if (score > 20) category = 'Moderate Pressure';

  let scatterZone = 'Relatively Adequate';
  if (d >= 50 && i < 50) scatterZone = 'Critical Infrastructure Gap';
  else if (d >= 50 && i >= 50) scatterZone = 'Infrastructure Keeping Pace';
  else if (d < 50 && i < 50) scatterZone = 'Development Gap';

  return {
    pressureScore: score,
    pressureCategory: category,
    scatterZone
  };
}
