/**
 * Dynamic Planning Recommendations Engine
 * Evaluates district component scores to identify primary pressure bottlenecks and generate actionable policy directives.
 */

export function generatePlanningRecommendation(district) {
  const demand = district.demandIndex || district.indices?.movementDemandIndex || 50;
  const infra = district.infrastructureIndex || district.indices?.infrastructureCapacityIndex || 50;
  const sust = district.sustainabilityScore || district.indices?.sustainabilityScore || 50;
  
  const transScore = district.transportScore !== undefined ? district.transportScore : (district.publicBusCoverage || 50);
  const healthScore = district.servicesScore !== undefined ? district.servicesScore : (district.healthFacilityCoverage || 50);
  const waterScore = district.waterSanitationScore !== undefined ? district.waterSanitationScore : (district.treatedWaterCoverage || 50);
  const connScore = district.connectivityScore !== undefined ? district.connectivityScore : (district.internetCoverage || 50);

  // Determine main bottleneck
  const components = [
    { name: 'Transport Connectivity', score: transScore },
    { name: 'Healthcare Infrastructure', score: healthScore },
    { name: 'Water Infrastructure', score: waterScore },
    { name: 'Sanitation Infrastructure', score: district.sanitationCoverage || 50 },
    { name: 'Digital Connectivity', score: connScore }
  ];

  components.sort((a, b) => a.score - b.score);
  const lowest = components[0];
  const secondLowest = components[1];

  let mainPressure = lowest.name;
  if (Math.abs(lowest.score - secondLowest.score) < 4) {
    mainPressure = 'Multiple Infrastructure Gaps';
  }

  // Generate evidence-based recommendation text
  let recommendation = '';

  if (demand > 65 && transScore < 45) {
    recommendation = 'High movement demand is combined with comparatively weak transport accessibility. Priority should be given to improving public transport and all-weather road connectivity.';
  } else if (demand > 65 && healthScore < 45) {
    recommendation = 'High movement pressure with limited healthcare infrastructure indicates a need for additional health-service capacity.';
  } else if (waterScore < 45) {
    recommendation = 'Water infrastructure should be prioritized, particularly reliable and year-round supply.';
  } else if (sust < 45) {
    recommendation = 'District requires priority intervention in sustainable infrastructure, particularly water, sanitation, drainage and waste management.';
  } else if (connScore < 40) {
    recommendation = 'Digital divide requires accelerating BharatNet Common Service Centre kiosks and mobile network reach.';
  } else if (demand >= 50 && infra >= 50) {
    recommendation = 'Infrastructure is keeping pace; focus on sustaining high transit capacity and expanding multi-modal green feeder routes.';
  } else {
    recommendation = 'Upgrade rural secondary road links and reinforce primary civic utilities to accommodate demographic mobility.';
  }

  return {
    mainPressure,
    recommendation,
    recommendedAction: recommendation,
    priorityInterventions: [
      { sector: mainPressure, action: recommendation }
    ]
  };
}

export const generateDistrictRecommendations = generatePlanningRecommendation;

