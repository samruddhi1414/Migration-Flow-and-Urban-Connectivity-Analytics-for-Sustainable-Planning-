/**
 * Movement Demand Index & Infrastructure Capacity Index Calculation Engine
 * Supports custom weight adjustments and dynamic missing-weight redistribution
 */

export const DEFAULT_DEMAND_WEIGHTS = {
  migrationPressure: 0.40,
  populationDensity: 0.25,
  populationGrowth: 0.20,
  mobilityDependency: 0.15,
};

export const DEFAULT_CAPACITY_WEIGHTS = {
  roadAccessibility: 0.30,
  publicTransport: 0.20,
  railwayAccessibility: 0.15,
  essentialServices: 0.15,
  waterSanitation: 0.10,
  digitalElectric: 0.10,
};

export function minMaxNormalize(values) {
  const validVals = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (validVals.length === 0) return values.map(() => 50);
  const min = Math.min(...validVals);
  const max = Math.max(...validVals);
  if (max === min) return values.map(() => 50);
  return values.map(v => {
    if (v === null || v === undefined || isNaN(v)) return 50;
    return Number(((v - min) / (max - min) * 100).toFixed(2));
  });
}

/**
 * Dynamically recalculate Demand & Capacity Indices with custom or default weights
 */
export function recalculateIndices(districts, customDemandWeights = DEFAULT_DEMAND_WEIGHTS, customCapacityWeights = DEFAULT_CAPACITY_WEIGHTS) {
  if (!districts || districts.length === 0) return [];

  // 1. Calculate raw components
  const rawMig = districts.map(d => d.totalMigrants / Math.max(d.totalPopulation, 1));
  const rawDens = districts.map(d => d.demographics?.avgDensity || 400);
  const rawGrowth = districts.map(d => d.demographics?.avgGrowthRate || 15);
  const rawCommute = districts.map(d => (d.migrationReasons?.workEmployment || 0) / Math.max(d.totalPopulation, 1));

  const normMig = minMaxNormalize(rawMig);
  const normDens = minMaxNormalize(rawDens);
  const normGrowth = minMaxNormalize(rawGrowth);
  const normCommute = minMaxNormalize(rawCommute);

  // Road
  const rawRoadCov = districts.map(d => d.transport?.allWeatherRoadPct || 50);
  const rawRoadDens = districts.map(d => (d.transport?.totalTownRoadKm || 50) / Math.max(d.totalPopulation / 100000, 1));
  const normRoadCov = minMaxNormalize(rawRoadCov);
  const normRoadDens = minMaxNormalize(rawRoadDens);
  const normRoad = normRoadCov.map((c, i) => Number((0.6 * c + 0.4 * normRoadDens[i]).toFixed(2)));

  // Public Bus
  const normPubBus = districts.map(d => Number((0.6 * (d.transport?.publicBusPct || 50) + 0.4 * (d.transport?.townBusAccessPct || 50)).toFixed(2)));

  // Railway
  const rawRailVil = districts.map(d => d.transport?.railwayPct || 0);
  const rawRailTown = districts.map(d => d.transport?.townRailwayAccessPct || 0);
  const normRailVil = minMaxNormalize(rawRailVil);
  const normRailTown = minMaxNormalize(rawRailTown);
  const normRail = normRailVil.map((rv, i) => Number((0.5 * rv + 0.5 * normRailTown[i]).toFixed(2)));

  // Essential Services
  const normServices = districts.map(d => {
    const s = d.services || {};
    return Number((
      0.25 * (s.primarySchoolPct || 50) +
      0.35 * (s.healthFacilityPct || 50) +
      0.20 * (s.bankPct || 50) +
      0.20 * (s.marketPct || 50)
    ).toFixed(2));
  });

  // Water & Sanitation
  const normWaterSanit = districts.map(d => {
    const s = d.services || {};
    return Number((
      0.40 * (s.treatedWaterPct || 50) +
      0.30 * (s.drainagePct || 50) +
      0.30 * (s.wasteDisposalPct || 50)
    ).toFixed(2));
  });

  // Digital & Electricity
  const normDigital = districts.map(d => {
    const s = d.services || {};
    return Number((
      0.50 * (s.mobileCoveragePct || 50) +
      0.50 * (s.internetCscPct || 50)
    ).toFixed(2));
  });

  // Normalize total weights to sum to 1
  const dWTotal = customDemandWeights.migrationPressure + customDemandWeights.populationDensity + customDemandWeights.populationGrowth + customDemandWeights.mobilityDependency || 1;
  const dwMig = customDemandWeights.migrationPressure / dWTotal;
  const dwDens = customDemandWeights.populationDensity / dWTotal;
  const dwGrowth = customDemandWeights.populationGrowth / dWTotal;
  const dwComm = customDemandWeights.mobilityDependency / dWTotal;

  const cWTotal = Object.values(customCapacityWeights).reduce((a, b) => a + b, 0) || 1;
  const cwRoad = (customCapacityWeights.roadAccessibility || 0.3) / cWTotal;
  const cwBus = (customCapacityWeights.publicTransport || 0.2) / cWTotal;
  const cwRail = (customCapacityWeights.railwayAccessibility || 0.15) / cWTotal;
  const cwServ = (customCapacityWeights.essentialServices || 0.15) / cWTotal;
  const cwWat = (customCapacityWeights.waterSanitation || 0.10) / cWTotal;
  const cwDig = (customCapacityWeights.digitalElectric || 0.10) / cWTotal;

  return districts.map((d, i) => {
    const demandIdx = Number((dwMig * normMig[i] + dwDens * normDens[i] + dwGrowth * normGrowth[i] + dwComm * normCommute[i]).toFixed(1));
    const capacityIdx = Number((
      cwRoad * normRoad[i] +
      cwBus * normPubBus[i] +
      cwRail * normRail[i] +
      cwServ * normServices[i] +
      cwWat * normWaterSanit[i] +
      cwDig * normDigital[i]
    ).toFixed(1));

    const rawDiff = Number((demandIdx - capacityIdx).toFixed(1));
    const pressureScore = Number(Math.max(0, Math.min(100, (rawDiff + 100) / 2)).toFixed(1));

    let pressureCategory = 'Adequate';
    if (pressureScore > 80) pressureCategory = 'Critical';
    else if (pressureScore > 60) pressureCategory = 'Very High Pressure';
    else if (pressureScore > 40) pressureCategory = 'High Pressure';
    else if (pressureScore > 20) pressureCategory = 'Moderate Pressure';

    let scatterZone = 'Relatively Adequate';
    if (demandIdx >= 50 && capacityIdx < 50) scatterZone = 'Critical Infrastructure Gap';
    else if (demandIdx >= 50 && capacityIdx >= 50) scatterZone = 'Infrastructure Keeping Pace';
    else if (demandIdx < 50 && capacityIdx < 50) scatterZone = 'Development Gap';

    return {
      ...d,
      indices: {
        ...d.indices,
        movementDemandIndex: demandIdx,
        infrastructureCapacityIndex: capacityIdx,
        rawPressureDiff: rawDiff,
        pressureScore,
        pressureCategory,
        scatterZone,
        componentScores: {
          migrationPressureNorm: normMig[i],
          densityNorm: normDens[i],
          growthNorm: normGrowth[i],
          commuteNorm: normCommute[i],
          roadCapacityNorm: normRoad[i],
          publicTransportNorm: normPubBus[i],
          railwayNorm: normRail[i],
          essentialServicesNorm: normServices[i],
          waterSanitationNorm: normWaterSanit[i],
          digitalNorm: normDigital[i]
        }
      }
    };
  });
}
