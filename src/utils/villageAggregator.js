/**
 * Village DCHB 2700 Aggregator
 * Processes village-level status flags (1=Available, 2=Not Available)
 * Coverage % = (Villages with Status 1 / Total Valid Villages) * 100
 */

export function aggregateVillageRecords(villageRows) {
  const villageMap = {};

  const isAvailable = (val) => {
    if (val === null || val === undefined) return false;
    try { return parseInt(val, 10) === 1; }
    catch { return String(val).trim() === '1'; }
  };

  const toNum = (val) => {
    if (val === null || val === undefined) return 0;
    const n = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  };

  // Header is row 0
  for (let i = 1; i < villageRows.length; i++) {
    const r = villageRows[i];
    if (!r || r[2] === null || r[2] === undefined) continue;

    let dcode = '';
    try {
      dcode = String(parseInt(r[2], 10)).padStart(3, '0');
    } catch {
      continue;
    }

    if (!villageMap[dcode]) {
      villageMap[dcode] = {
        districtCode: dcode,
        districtName: String(r[3] || '').trim(),
        villageCount: 0,
        villagePopulation: 0,
        villageHouseholds: 0,
        countPublicBus: 0,
        countPrivateBus: 0,
        countRailway: 0,
        countAllWeatherRoad: 0,
        countPuccaRoad: 0,
        countKutchaRoad: 0,
        countTreatedWater: 0,
        countYearRoundWater: 0,
        countSanitationTSC: 0,
        countDrainage: 0,
        countWasteDisposal: 0,
        countMobile: 0,
        countCSC: 0,
        countPrimarySchool: 0,
        countHealthFacility: 0,
        countBank: 0,
        countMarket: 0,
        countPDS: 0,
        distHqDistances: []
      };
    }

    const vd = villageMap[dcode];
    vd.villageCount += 1;
    vd.villagePopulation += toNum(r[25]);
    vd.villageHouseholds += toNum(r[8]);

    const dhq = toNum(r[16]);
    if (dhq > 0 && dhq < 500) vd.distHqDistances.push(dhq);

    if (isAvailable(r[271])) vd.countPublicBus += 1;
    if (isAvailable(r[273])) vd.countPrivateBus += 1;
    if (isAvailable(r[275])) vd.countRailway += 1;
    if (isAvailable(r[307])) vd.countAllWeatherRoad += 1;
    if (isAvailable(r[301])) vd.countPuccaRoad += 1;
    if (isAvailable(r[303])) vd.countKutchaRoad += 1;
    if (isAvailable(r[207])) vd.countTreatedWater += 1;
    if (isAvailable(r[208])) vd.countYearRoundWater += 1;
    if (isAvailable(r[244])) vd.countSanitationTSC += 1;
    if (isAvailable(r[237]) || isAvailable(r[240])) vd.countDrainage += 1;
    if (isAvailable(r[249])) vd.countWasteDisposal += 1;
    if (isAvailable(r[265])) vd.countMobile += 1;
    if (isAvailable(r[267])) vd.countCSC += 1;
    if (isAvailable(r[41]) || isAvailable(r[43])) vd.countPrimarySchool += 1;
    if (toNum(r[132]) > 0 || toNum(r[138]) > 0 || toNum(r[186]) > 0) vd.countHealthFacility += 1;
    if (isAvailable(r[315]) || isAvailable(r[317])) vd.countBank += 1;
    if (isAvailable(r[325])) vd.countMarket += 1;
    if (isAvailable(r[323])) vd.countPDS += 1;
  }

  // Calculate coverage percentages
  const result = {};
  for (const [code, vd] of Object.entries(villageMap)) {
    const total = vd.villageCount || 1;
    result[code] = {
      districtCode: code,
      districtName: vd.districtName,
      villageCount: vd.villageCount,
      villagePopulation: vd.villagePopulation,
      villageHouseholds: vd.villageHouseholds,
      publicBusCoverage: Number(((vd.countPublicBus / total) * 100).toFixed(1)),
      privateBusCoverage: Number(((vd.countPrivateBus / total) * 100).toFixed(1)),
      railwayCoverage: Number(((vd.countRailway / total) * 100).toFixed(1)),
      allWeatherRoadCoverage: Number(((vd.countAllWeatherRoad / total) * 100).toFixed(1)),
      puccaRoadCoverage: Number(((vd.countPuccaRoad / total) * 100).toFixed(1)),
      kutchaRoadCoverage: Number(((vd.countKutchaRoad / total) * 100).toFixed(1)),
      treatedWaterCoverage: Number(((vd.countTreatedWater / total) * 100).toFixed(1)),
      yearRoundWaterCoverage: Number(((vd.countYearRoundWater / total) * 100).toFixed(1)),
      sanitationCoverage: Number(((vd.countSanitationTSC / total) * 100).toFixed(1)),
      drainageCoverage: Number(((vd.countDrainage / total) * 100).toFixed(1)),
      wasteManagementCoverage: Number(((vd.countWasteDisposal / total) * 100).toFixed(1)),
      mobileCoverage: Number(((vd.countMobile / total) * 100).toFixed(1)),
      internetCoverage: Number(((vd.countCSC / total) * 100).toFixed(1)),
      schoolCoverage: Number(((vd.countPrimarySchool / total) * 100).toFixed(1)),
      healthFacilityCoverage: Number(((vd.countHealthFacility / total) * 100).toFixed(1)),
      bankCoverage: Number(((vd.countBank / total) * 100).toFixed(1)),
      marketCoverage: Number(((vd.countMarket / total) * 100).toFixed(1)),
      pdsCoverage: Number(((vd.countPDS / total) * 100).toFixed(1)),
      avgDistrictHqDistance: vd.distHqDistances.length > 0 
        ? Number((vd.distHqDistances.reduce((a, b) => a + b, 0) / vd.distHqDistances.length).toFixed(1)) 
        : 15.0
    };
  }

  return result;
}
