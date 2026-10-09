/**
 * District aggregation and statistical summary helpers
 */

export function computeStateSummary(districts) {
  if (!districts || districts.length === 0) {
    return {
      totalPopulation: 0,
      totalRuralPop: 0,
      totalUrbanPop: 0,
      totalMigrants: 0,
      totalVillages: 0,
      totalTowns: 0,
      highPressureCount: 0,
      criticalPressureCount: 0,
      avgPressureScore: 0,
      avgDemandIndex: 0,
      avgCapacityIndex: 0,
      avgSustainabilityScore: 0,
    };
  }

  // Exclude bifurcated entries (Palghar) when summing baseline state pop to avoid double count with undivided Thane 2011
  const uniqueDistricts = districts.filter(d => !d.isBifurcatedFromThane);

  const totalPopulation = uniqueDistricts.reduce((sum, d) => sum + (d.totalPopulation || 0), 0);
  const totalRuralPop = uniqueDistricts.reduce((sum, d) => sum + (d.ruralPopulation || 0), 0);
  const totalUrbanPop = uniqueDistricts.reduce((sum, d) => sum + (d.urbanPopulation || 0), 0);
  const totalMigrants = uniqueDistricts.reduce((sum, d) => sum + (d.totalMigrants || 0), 0);
  const totalVillages = uniqueDistricts.reduce((sum, d) => sum + (d.villagesCount || 0), 0);
  const totalTowns = uniqueDistricts.reduce((sum, d) => sum + (d.townsCount || 0), 0);

  const highPressureCount = districts.filter(d => d.indices?.pressureCategory === 'High Pressure').length;
  const criticalPressureCount = districts.filter(d => d.indices?.pressureCategory === 'Critical' || d.indices?.pressureCategory === 'Very High Pressure').length;

  const avgPressureScore = Number((districts.reduce((sum, d) => sum + (d.indices?.pressureScore || 0), 0) / districts.length).toFixed(1));
  const avgDemandIndex = Number((districts.reduce((sum, d) => sum + (d.indices?.movementDemandIndex || 0), 0) / districts.length).toFixed(1));
  const avgCapacityIndex = Number((districts.reduce((sum, d) => sum + (d.indices?.infrastructureCapacityIndex || 0), 0) / districts.length).toFixed(1));
  const avgSustainabilityScore = Number((districts.reduce((sum, d) => sum + (d.indices?.sustainabilityScore || 0), 0) / districts.length).toFixed(1));

  return {
    districtsAnalyzed: districts.length,
    totalPopulation,
    totalRuralPop,
    totalUrbanPop,
    totalMigrants,
    totalVillages,
    totalTowns,
    highPressureCount,
    criticalPressureCount,
    highOrCriticalCount: highPressureCount + criticalPressureCount,
    avgPressureScore,
    avgDemandIndex,
    avgCapacityIndex,
    avgSustainabilityScore,
  };
}
