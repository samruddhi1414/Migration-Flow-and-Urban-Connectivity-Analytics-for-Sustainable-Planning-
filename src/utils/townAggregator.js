/**
 * Town DCHB 2700 Aggregator
 * Aggregates town-level actual quantities (pucca road length, hospital beds, density, growth, etc.)
 */

export function aggregateTownRecords(townRows) {
  const townMap = {};

  const toNum = (val) => {
    if (val === null || val === undefined) return 0;
    const n = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  };

  for (let i = 1; i < townRows.length; i++) {
    const r = townRows[i];
    if (!r || r[2] === null || r[2] === undefined) continue;

    let dcode = '';
    try {
      dcode = String(parseInt(r[2], 10)).padStart(3, '0');
    } catch {
      continue;
    }

    if (!townMap[dcode]) {
      townMap[dcode] = {
        districtCode: dcode,
        districtName: String(r[3] || '').trim(),
        townCount: 0,
        townPopulation: 0,
        townAreaSqKm: 0.0,
        puccaRoadLength: 0.0,
        kutchaRoadLength: 0.0,
        hospitalBeds: 0,
        doctors: 0,
        healthCentres: 0,
        railwayDistances: [],
        busDistances: [],
        densities: [],
        growthRates: [],
        domesticElectricity: 0,
        commercialElectricity: 0,
        industrialElectricity: 0
      };
    }

    const td = townMap[dcode];
    td.townCount += 1;
    td.townPopulation += toNum(r[9]);
    td.townAreaSqKm += toNum(r[23]);
    td.puccaRoadLength += toNum(r[72]);
    td.kutchaRoadLength += toNum(r[73]);
    td.hospitalBeds += toNum(r[103]);
    td.doctors += (toNum(r[105]) + toNum(r[112]));
    td.healthCentres += toNum(r[116]);

    const rd = toNum(r[69]);
    td.railwayDistances.push(rd);

    const bd = toNum(r[71]);
    td.busDistances.push(bd);

    const dens = toNum(r[51]);
    if (dens > 0) td.densities.push(dens);

    const gr = toNum(r[50]);
    td.growthRates.push(gr);

    td.domesticElectricity += toNum(r[97]);
    td.commercialElectricity += toNum(r[99]);
    td.industrialElectricity += toNum(r[98]);
  }

  const result = {};
  for (const [code, td] of Object.entries(townMap)) {
    const avgDens = td.densities.length > 0 
      ? td.densities.reduce((a, b) => a + b, 0) / td.densities.length 
      : (td.townPopulation / Math.max(td.townAreaSqKm, 1));

    const avgGrowth = td.growthRates.length > 0 
      ? td.growthRates.reduce((a, b) => a + b, 0) / td.growthRates.length 
      : 15.0;

    const avgRail = td.railwayDistances.length > 0 
      ? td.railwayDistances.reduce((a, b) => a + b, 0) / td.railwayDistances.length 
      : 5.0;

    const avgBus = td.busDistances.length > 0 
      ? td.busDistances.reduce((a, b) => a + b, 0) / td.busDistances.length 
      : 2.0;

    result[code] = {
      districtCode: code,
      districtName: td.districtName,
      townCount: td.townCount,
      townPopulation: td.townPopulation,
      townAreaSqKm: Number(td.townAreaSqKm.toFixed(2)),
      totalPuccaRoadLength: Number(td.puccaRoadLength.toFixed(1)),
      totalKutchaRoadLength: Number(td.kutchaRoadLength.toFixed(1)),
      hospitalBeds: Math.round(td.hospitalBeds),
      doctors: Math.round(td.doctors),
      healthCentres: Math.round(td.healthCentres),
      averagePopulationDensity: Number(avgDens.toFixed(1)),
      averageGrowthRate: Number(avgGrowth.toFixed(2)),
      averageRailwayDistance: Number(avgRail.toFixed(1)),
      averageBusDistance: Number(avgBus.toFixed(1)),
      domesticElectricity: Math.round(td.domesticElectricity),
      commercialElectricity: Math.round(td.commercialElectricity),
      industrialElectricity: Math.round(td.industrialElectricity)
    };
  }

  return result;
}
