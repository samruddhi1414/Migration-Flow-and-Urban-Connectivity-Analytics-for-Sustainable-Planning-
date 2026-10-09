/**
 * Sustainability Score Calculation Engine (Completely separate 0-100 score)
 */

export function calculateDistrictSustainability(district) {
  const yrWater = district.yearRoundWaterCoverage || 0;
  const trWater = district.treatedWaterCoverage || 0;
  const sanit = district.sanitationCoverage || 0;
  const drain = district.drainageCoverage || 0;
  const waste = district.wasteManagementCoverage || 0;
  const allRoad = district.allWeatherRoadCoverage || 0;
  const pubBus = district.publicBusCoverage || 0;
  const mobile = district.mobileCoverage || 0;
  const internet = district.internetCoverage || 0;

  const score = Number((
    0.20 * yrWater +
    0.15 * trWater +
    0.15 * sanit +
    0.15 * drain +
    0.10 * waste +
    0.10 * allRoad +
    0.10 * pubBus +
    0.05 * (0.5 * mobile + 0.5 * internet)
  ).toFixed(1));

  let category = 'Moderate Sustainability';
  if (score >= 80) category = 'High Sustainability';
  else if (score < 50) category = 'Low Sustainability / Urgent Action';

  return {
    sustainabilityScore: score,
    sustainabilityCategory: category,
    components: {
      yrWater,
      trWater,
      sanit,
      drain,
      waste,
      allRoad,
      pubBus,
      digital: (0.5 * mobile + 0.5 * internet)
    }
  };
}
