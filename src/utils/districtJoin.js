import { calculateMovementDemandIndex } from './demandIndex';
import { calculateInfrastructureIndex } from './infrastructureIndex';
import { calculatePressureScore } from './pressureScore';
import { calculateDistrictSustainability } from './sustainabilityScore';
import { generatePlanningRecommendation } from './recommendations';
import { validateDistrictDataset } from './validation';
import { DISTRICT_CODE_NAME_MAP } from './geoJsonMatcher';

/**
 * Joins Village, Town, and Migration aggregations into the District Master Dataset.
 * Computes all indices and validates variation.
 */
export function buildDistrictMasterDataset(villageMap, townMap, migrationMap, customDemandWeights, customInfraWeights) {
  const allCodes = Object.keys(DISTRICT_CODE_NAME_MAP).filter(c => c !== '732'); // 35 Census 2011 districts
  const masterList = [];

  for (const code of allCodes) {
    const canonicalName = DISTRICT_CODE_NAME_MAP[code] || `District ${code}`;
    const v = villageMap[code] || {};
    const t = townMap[code] || {};
    const m = migrationMap[code] || {};

    const vPop = v.villagePopulation || 0;
    const tPop = t.townPopulation || 0;
    const totPop = vPop + tPop;

    const totMig = m.totalMigrants || 0;
    const migRate = totPop > 0 ? Number(((totMig / totPop) * 100).toFixed(2)) : 0;

    const is100Urban = (v.villageCount === 0 || !v.villageCount);

    masterList.push({
      districtCode: code,
      districtName: canonicalName,
      villageCount: v.villageCount || 0,
      townCount: t.townCount || 0,
      villagePopulation: vPop,
      townPopulation: tPop,
      totalPopulation: totPop,
      totalMigrants: totMig,
      migrationRate: migRate,
      workMigrants: m.workMigrants || 0,
      businessMigrants: m.businessMigrants || 0,
      educationMigrants: m.educationMigrants || 0,
      marriageMigrants: m.marriageMigrants || 0,
      movedAfterBirth: m.movedAfterBirth || 0,
      movedWithHousehold: m.movedWithHousehold || 0,
      otherMigrants: m.otherMigrants || 0,
      publicBusCoverage: is100Urban ? 100.0 : (v.publicBusCoverage || 0),
      privateBusCoverage: is100Urban ? 100.0 : (v.privateBusCoverage || 0),
      railwayCoverage: is100Urban ? 100.0 : (v.railwayCoverage || 0),
      allWeatherRoadCoverage: is100Urban ? 100.0 : (v.allWeatherRoadCoverage || 0),
      puccaRoadCoverage: is100Urban ? 100.0 : (v.puccaRoadCoverage || 0),
      kutchaRoadCoverage: is100Urban ? 0.0 : (v.kutchaRoadCoverage || 0),
      treatedWaterCoverage: is100Urban ? 98.0 : (v.treatedWaterCoverage || 0),
      yearRoundWaterCoverage: is100Urban ? 95.0 : (v.yearRoundWaterCoverage || 0),
      sanitationCoverage: is100Urban ? 92.0 : (v.sanitationCoverage || 0),
      drainageCoverage: is100Urban ? 90.0 : (v.drainageCoverage || 0),
      wasteManagementCoverage: is100Urban ? 85.0 : (v.wasteManagementCoverage || 0),
      mobileCoverage: is100Urban ? 100.0 : (v.mobileCoverage || 0),
      internetCoverage: is100Urban ? 80.0 : (v.internetCoverage || 0),
      schoolCoverage: is100Urban ? 100.0 : (v.schoolCoverage || 0),
      healthFacilityCoverage: is100Urban ? 95.0 : (v.healthFacilityCoverage || 0),
      bankCoverage: is100Urban ? 95.0 : (v.bankCoverage || 0),
      marketCoverage: is100Urban ? 90.0 : (v.marketCoverage || 0),
      pdsCoverage: is100Urban ? 100.0 : (v.pdsCoverage || 0),
      totalPuccaRoadLength: t.totalPuccaRoadLength || 0,
      totalKutchaRoadLength: t.totalKutchaRoadLength || 0,
      averagePopulationDensity: t.averagePopulationDensity || 400,
      averageGrowthRate: t.averageGrowthRate !== undefined ? t.averageGrowthRate : 15.0,
      averageRailwayDistance: t.averageRailwayDistance !== undefined ? t.averageRailwayDistance : 5.0,
      averageBusDistance: t.averageBusDistance !== undefined ? t.averageBusDistance : 2.0,
      hospitalBeds: t.hospitalBeds || 0,
      doctors: t.doctors || 0,
      healthCentres: t.healthCentres || 0
    });
  }

  // Also include Palghar (732) mapped from Thane (517)
  const thaneItem = masterList.find(d => d.districtCode === '517');
  if (thaneItem) {
    const palgharItem = JSON.parse(JSON.stringify(thaneItem));
    palgharItem.districtCode = '732';
    palgharItem.districtName = 'Palghar';
    palgharItem.isBifurcatedFromThane = true;
    masterList.push(palgharItem);
  }

  // Compute Demand & Infrastructure indices
  const demandResults = calculateMovementDemandIndex(masterList, customDemandWeights);
  const infraResults = calculateInfrastructureIndex(masterList, customInfraWeights);

  const finalDistricts = masterList.map((d, i) => {
    const dRes = demandResults[i];
    const iRes = infraResults[i];
    const pRes = calculatePressureScore(dRes.demandIndex, iRes.infrastructureIndex);
    const sRes = calculateDistrictSustainability(d);
    const rRes = generatePlanningRecommendation({
      ...d,
      demandIndex: dRes.demandIndex,
      infrastructureIndex: iRes.infrastructureIndex,
      sustainabilityScore: sRes.sustainabilityScore,
      transportScore: iRes.subScores.transport,
      servicesScore: iRes.subScores.essentialServices,
      waterSanitationScore: iRes.subScores.waterSanitation,
      connectivityScore: iRes.subScores.connectivity
    });

    const totRoad = Number(((d.totalPuccaRoadLength || 0) + (d.totalKutchaRoadLength || 0)).toFixed(1));
    const popPerRoad = totRoad > 0 ? Number((d.totalPopulation / totRoad).toFixed(1)) : 0;

    return {
      ...d,
      demandIndex: dRes.demandIndex,
      infrastructureIndex: iRes.infrastructureIndex,
      pressureScore: pRes.pressureScore,
      sustainabilityScore: sRes.sustainabilityScore,
      pressureCategory: pRes.pressureCategory,
      sustainabilityCategory: sRes.sustainabilityCategory,
      scatterZone: pRes.scatterZone,
      mainPressure: rRes.mainPressure,
      recommendation: rRes.recommendation,
      transportScore: iRes.subScores.transport,
      servicesScore: iRes.subScores.essentialServices,
      waterSanitationScore: iRes.subScores.waterSanitation,
      connectivityScore: iRes.subScores.connectivity,
      urbanSupportScore: iRes.subScores.urbanSupport,
      indices: {
        movementDemandIndex: dRes.demandIndex,
        infrastructureCapacityIndex: iRes.infrastructureIndex,
        pressureScore: pRes.pressureScore,
        sustainabilityScore: sRes.sustainabilityScore,
        pressureCategory: pRes.pressureCategory,
        sustainabilityCategory: sRes.sustainabilityCategory,
        scatterZone: pRes.scatterZone,
        mainPressure: rRes.mainPressure,
        recommendedAction: rRes.recommendation
      },
      transport: {
        allWeatherRoadPct: d.allWeatherRoadCoverage,
        puccaRoadPct: d.puccaRoadCoverage,
        kutchaRoadPct: d.kutchaRoadCoverage,
        publicBusPct: d.publicBusCoverage,
        privateBusPct: d.privateBusCoverage,
        railwayPct: d.railwayCoverage,
        townPuccaRoadKm: d.totalPuccaRoadLength,
        townKutchaRoadKm: d.totalKutchaRoadLength,
        totalTownRoadKm: totRoad,
        populationPerRoadKm: popPerRoad,
        avgDistrictHqDistanceKm: v.avgDistrictHqDistance || 15.0
      },
      services: {
        primarySchoolPct: d.schoolCoverage,
        healthFacilityPct: d.healthFacilityCoverage,
        hospitalBeds: d.hospitalBeds,
        doctors: d.doctors,
        healthCentres: d.healthCentres,
        treatedWaterPct: d.treatedWaterCoverage,
        yearRoundWaterPct: d.yearRoundWaterCoverage,
        drainagePct: d.drainageCoverage,
        sanitationTscPct: d.sanitationCoverage,
        wasteDisposalPct: d.wasteManagementCoverage,
        mobileCoveragePct: d.mobileCoverage,
        internetCscPct: d.internetCoverage,
        bankPct: d.bankCoverage,
        marketPct: d.marketCoverage,
        pdsPct: d.pdsCoverage
      },
      demographics: {
        avgDensity: d.averagePopulationDensity,
        avgGrowthRate: d.averageGrowthRate,
        urbanPercentage: d.totalPopulation > 0 ? Number(((d.townPopulation / d.totalPopulation) * 100).toFixed(1)) : 0
      },
      migrationReasons: {
        workEmployment: d.workMigrants,
        business: d.businessMigrants,
        education: d.educationMigrants,
        marriage: d.marriageMigrants,
        movedAfterBirth: d.movedAfterBirth,
        movedWithHousehold: d.movedWithHousehold,
        others: d.otherMigrants
      }
    };
  });

  // Sort by Pressure Score descending
  finalDistricts.sort((a, b) => b.pressureScore - a.pressureScore);
  finalDistricts.forEach((d, idx) => {
    d.rank = idx + 1;
    d.indices.pressureRank = idx + 1;
  });

  // Validate dataset variability
  validateDistrictDataset(finalDistricts);

  return finalDistricts;
}
