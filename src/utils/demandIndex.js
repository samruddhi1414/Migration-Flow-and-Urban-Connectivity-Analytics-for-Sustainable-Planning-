import { minMaxNormalize } from './normalization';

export const DEFAULT_DEMAND_WEIGHTS = {
  migrationPressure: 0.50,
  populationDensity: 0.30,
  populationGrowth: 0.20
};

/**
 * Calculates Movement Demand Index (0-100) for all districts.
 * Each district uses its OWN raw metrics.
 */
export function calculateMovementDemandIndex(districts, customWeights = DEFAULT_DEMAND_WEIGHTS) {
  if (!districts || districts.length === 0) return [];

  // Extract raw indicators per district
  const totalMigrants = districts.map(d => d.totalMigrants || 0);
  const migrationRates = districts.map(d => {
    const pop = d.totalPopulation || (d.villagePopulation + d.townPopulation) || 1;
    return ((d.totalMigrants || 0) / pop) * 100;
  });
  const densities = districts.map(d => d.averagePopulationDensity || 400);
  const growths = districts.map(d => d.averageGrowthRate !== undefined ? d.averageGrowthRate : 15.0);

  // Normalize across districts
  const normMigVol = minMaxNormalize(totalMigrants);
  const normMigRate = minMaxNormalize(migrationRates);
  const normMigPressure = normMigVol.map((v, i) => Number((0.5 * v + 0.5 * normMigRate[i]).toFixed(2)));

  const normDensity = minMaxNormalize(densities);
  const normGrowth = minMaxNormalize(growths);

  // Dynamic weight redistribution if sum != 1
  const wTotal = (customWeights.migrationPressure || 0.5) + (customWeights.populationDensity || 0.3) + (customWeights.populationGrowth || 0.2) || 1.0;
  const wMig = (customWeights.migrationPressure || 0.5) / wTotal;
  const wDens = (customWeights.populationDensity || 0.3) / wTotal;
  const wGrow = (customWeights.populationGrowth || 0.2) / wTotal;

  return districts.map((d, i) => {
    const score = Number((wMig * normMigPressure[i] + wDens * normDensity[i] + wGrow * normGrowth[i]).toFixed(1));
    return {
      districtCode: d.districtCode,
      demandIndex: Math.max(0, Math.min(100, score)),
      components: {
        migrationPressureNorm: normMigPressure[i],
        densityNorm: normDensity[i],
        growthNorm: normGrowth[i]
      }
    };
  });
}
