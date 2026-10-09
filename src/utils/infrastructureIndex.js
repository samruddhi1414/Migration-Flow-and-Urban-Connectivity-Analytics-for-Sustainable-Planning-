import { minMaxNormalize } from './normalization';

export const DEFAULT_INFRA_WEIGHTS = {
  transport: 0.35,
  essentialServices: 0.25,
  waterSanitation: 0.20,
  connectivity: 0.10,
  urbanSupport: 0.10
};

/**
 * Calculates Infrastructure Availability Index (0-100) per district.
 */
export function calculateInfrastructureIndex(districts, customWeights = DEFAULT_INFRA_WEIGHTS) {
  if (!districts || districts.length === 0) return [];

  // 1. TRANSPORT (35%)
  const normBus = minMaxNormalize(districts.map(d => d.publicBusCoverage || 0));
  const normRail = minMaxNormalize(districts.map(d => d.railwayCoverage || 0));
  const normAllWeather = minMaxNormalize(districts.map(d => d.allWeatherRoadCoverage || 0));
  const normPucca = minMaxNormalize(districts.map(d => d.puccaRoadCoverage || 0));
  const normRailDist = minMaxNormalize(districts.map(d => d.averageRailwayDistance || 5), true); // reverse
  const normBusDist = minMaxNormalize(districts.map(d => d.averageBusDistance || 2), true); // reverse

  const transportScores = districts.map((_, i) => {
    return Number((
      0.25 * normBus[i] +
      0.20 * normRail[i] +
      0.25 * normAllWeather[i] +
      0.15 * normPucca[i] +
      0.15 * (0.5 * normRailDist[i] + 0.5 * normBusDist[i])
    ).toFixed(2));
  });

  // 2. ESSENTIAL SERVICES (25%)
  const normSchool = minMaxNormalize(districts.map(d => d.schoolCoverage || 0));
  const normHealthCov = minMaxNormalize(districts.map(d => d.healthFacilityCoverage || 0));
  const normBeds = minMaxNormalize(districts.map(d => (d.hospitalBeds || 0) / Math.max((d.totalPopulation || 1) / 10000, 1)));
  const normDocs = minMaxNormalize(districts.map(d => (d.doctors || 0) / Math.max((d.totalPopulation || 1) / 10000, 1)));
  const normBank = minMaxNormalize(districts.map(d => d.bankCoverage || 0));
  const normMarket = minMaxNormalize(districts.map(d => d.marketCoverage || 0));

  const servicesScores = districts.map((_, i) => {
    return Number((
      0.25 * normSchool[i] +
      0.30 * normHealthCov[i] +
      0.20 * normBeds[i] +
      0.15 * normDocs[i] +
      0.10 * (0.5 * normBank[i] + 0.5 * normMarket[i])
    ).toFixed(2));
  });

  // 3. WATER & SANITATION (20%)
  const normWaterTr = minMaxNormalize(districts.map(d => d.treatedWaterCoverage || 0));
  const normWaterYr = minMaxNormalize(districts.map(d => d.yearRoundWaterCoverage || 0));
  const normDrain = minMaxNormalize(districts.map(d => d.drainageCoverage || 0));
  const normSanit = minMaxNormalize(districts.map(d => d.sanitationCoverage || 0));
  const normWaste = minMaxNormalize(districts.map(d => d.wasteManagementCoverage || 0));

  const waterSanitScores = districts.map((_, i) => {
    return Number((
      0.30 * normWaterTr[i] +
      0.25 * normWaterYr[i] +
      0.25 * normDrain[i] +
      0.10 * normSanit[i] +
      0.10 * normWaste[i]
    ).toFixed(2));
  });

  // 4. CONNECTIVITY (10%)
  const normMobile = minMaxNormalize(districts.map(d => d.mobileCoverage || 0));
  const normInternet = minMaxNormalize(districts.map(d => d.internetCoverage || 0));

  const connectivityScores = districts.map((_, i) => {
    return Number((
      0.50 * normMobile[i] +
      0.50 * normInternet[i]
    ).toFixed(2));
  });

  // 5. URBAN SUPPORT (10%)
  const normPuccaPerCap = minMaxNormalize(districts.map(d => (d.totalPuccaRoadLength || 0) / Math.max((d.townPopulation || 1) / 10000, 1)));
  const urbanSupportScores = districts.map((_, i) => {
    return Number((
      0.60 * normPuccaPerCap[i] +
      0.40 * (0.5 * normBeds[i] + 0.5 * normDocs[i])
    ).toFixed(2));
  });

  // Combine components
  const wTotal = (customWeights.transport || 0.35) + (customWeights.essentialServices || 0.25) + (customWeights.waterSanitation || 0.20) + (customWeights.connectivity || 0.10) + (customWeights.urbanSupport || 0.10) || 1.0;
  const wTrans = (customWeights.transport || 0.35) / wTotal;
  const wServ = (customWeights.essentialServices || 0.25) / wTotal;
  const wWat = (customWeights.waterSanitation || 0.20) / wTotal;
  const wConn = (customWeights.connectivity || 0.10) / wTotal;
  const wUrb = (customWeights.urbanSupport || 0.10) / wTotal;

  return districts.map((d, i) => {
    const score = Number((
      wTrans * transportScores[i] +
      wServ * servicesScores[i] +
      wWat * waterSanitScores[i] +
      wConn * connectivityScores[i] +
      wUrb * urbanSupportScores[i]
    ).toFixed(1));

    return {
      districtCode: d.districtCode,
      infrastructureIndex: Math.max(0, Math.min(100, score)),
      subScores: {
        transport: transportScores[i],
        essentialServices: servicesScores[i],
        waterSanitation: waterSanitScores[i],
        connectivity: connectivityScores[i],
        urbanSupport: urbanSupportScores[i]
      }
    };
  });
}
