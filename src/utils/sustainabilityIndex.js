/**
 * Sustainability Index calculation engine
 * Separate 0-100 Sustainable Infrastructure Score based on environmental, public transit & sanitation components
 */

export function calculateSustainabilityScore(district) {
  const s = district.services || {};
  const t = district.transport || {};

  const score = Number((
    0.15 * (s.yearRoundWaterPct || 50) +
    0.15 * (s.treatedWaterPct || 50) +
    0.15 * (s.sanitationTscPct || 50) +
    0.15 * (s.drainagePct || 50) +
    0.10 * (s.wasteDisposalPct || 50) +
    0.10 * (t.allWeatherRoadPct || 50) +
    0.10 * (t.publicBusPct || 50) +
    0.10 * (0.5 * (s.mobileCoveragePct || 50) + 0.5 * (s.internetCscPct || 50))
  ).toFixed(1));

  let category = 'Moderate Sustainability';
  if (score >= 80) category = 'High Sustainability';
  else if (score < 50) category = 'Low Sustainability / Urgent Action';

  return {
    score,
    category
  };
}
