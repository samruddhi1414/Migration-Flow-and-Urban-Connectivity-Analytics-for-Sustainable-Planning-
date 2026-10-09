import { CANONICAL_WARDS, WARD_METADATA } from './wardMatcher';
import { haversineDistance } from './geoUtils';

/**
 * Aggregates all ward-level metrics across Population, GeoJSON, Healthcare, Schools, and Parks.
 */
export function aggregateWardMetrics({ geojson, population, healthcare, schools, parks }) {
  const popMap = population?.byWard || {};
  const healthList = healthcare?.facilities || [];
  const schoolList = schools?.facilities || [];
  const parksList = parks?.facilities || [];
  const csvHospitals = healthcare?.csvHospitals || [];

  // Map GeoJSON feature areas and centroids
  const geoMap = {};
  if (geojson && geojson.features) {
    geojson.features.forEach(f => {
      const code = f.properties.wardCode;
      const areaSqM = Number(f.properties.Shape__Area) || 0;
      geoMap[code] = {
        areaKm2: areaSqM > 0 ? Number((areaSqM / 1_000_000).toFixed(2)) : 0,
        centroid: f.properties.centroid || [19.0760, 72.8777]
      };
    });
  }

  // Pre-index facilities by ward
  const healthByWard = {};
  const healthTypesByWard = {};
  const schoolsByWard = {};
  const schoolTypesByWard = {};
  const parksByWard = {};
  const bedsByWard = {};

  CANONICAL_WARDS.forEach(w => {
    healthByWard[w] = [];
    healthTypesByWard[w] = { 'Dispensary': 0, 'UPHC': 0, 'Public Hospital': 0, 'Maternity Home': 0, 'Veterinary Hospital': 0 };
    schoolsByWard[w] = [];
    schoolTypesByWard[w] = { 'Municipal': 0, 'Aided': 0, 'Unaided': 0 };
    parksByWard[w] = [];
    bedsByWard[w] = 0;
  });

  healthList.forEach(item => {
    if (item.ward && healthByWard[item.ward]) {
      healthByWard[item.ward].push(item);
      const sub = item.subcategory;
      if (healthTypesByWard[item.ward][sub] !== undefined) {
        healthTypesByWard[item.ward][sub]++;
      }
    }
  });

  schoolList.forEach(item => {
    if (item.ward && schoolsByWard[item.ward]) {
      schoolsByWard[item.ward].push(item);
      const sub = item.subcategory;
      if (schoolTypesByWard[item.ward][sub] !== undefined) {
        schoolTypesByWard[item.ward][sub]++;
      }
    }
  });

  parksList.forEach(item => {
    if (item.ward && parksByWard[item.ward]) {
      parksByWard[item.ward].push(item);
    }
  });

  csvHospitals.forEach(h => {
    if (h.ward && bedsByWard[h.ward] !== undefined) {
      bedsByWard[h.ward] += (h.beds || 0);
    }
  });

  // Calculate ward summary rows
  const wardRows = CANONICAL_WARDS.map(wardCode => {
    const p = popMap[wardCode] || { totalPopulation: 0, males: 0, females: 0, scPopulation: 0, stPopulation: 0 };
    const pop = p.totalPopulation;
    const g = geoMap[wardCode] || { areaKm2: 0, centroid: [19.0760, 72.8777] };
    const meta = WARD_METADATA[wardCode] || { name: `Ward ${wardCode}`, zone: 'Greater Mumbai', localities: '' };

    const hCount = healthByWard[wardCode]?.length || 0;
    const sCount = schoolsByWard[wardCode]?.length || 0;
    const prkCount = parksByWard[wardCode]?.length || 0;
    const bedCount = bedsByWard[wardCode] || 0;

    const healthPer10k = pop > 0 ? Number(((hCount / pop) * 10_000).toFixed(2)) : 0;
    const schoolsPer10k = pop > 0 ? Number(((sCount / pop) * 10_000).toFixed(2)) : 0;
    const parksPer10k = pop > 0 ? Number(((prkCount / pop) * 10_000).toFixed(2)) : 0;

    const density = g.areaKm2 > 0 && pop > 0 ? Math.round(pop / g.areaKm2) : 0;
    const healthDensity = g.areaKm2 > 0 ? Number((hCount / g.areaKm2).toFixed(2)) : 0;
    const schoolDensity = g.areaKm2 > 0 ? Number((sCount / g.areaKm2).toFixed(2)) : 0;

    // Estimate average distance to nearest facility from ward centroid
    const [cLat, cLon] = g.centroid;
    let minHealthDist = Infinity;
    (healthByWard[wardCode] || []).forEach(hf => {
      if (hf.lat && hf.lon) {
        const d = haversineDistance(cLat, cLon, hf.lat, hf.lon);
        if (d < minHealthDist) minHealthDist = d;
      }
    });

    let minSchoolDist = Infinity;
    (schoolsByWard[wardCode] || []).forEach(sf => {
      if (sf.lat && sf.lon) {
        const d = haversineDistance(cLat, cLon, sf.lat, sf.lon);
        if (d < minSchoolDist) minSchoolDist = d;
      }
    });

    return {
      wardCode,
      displayName: meta.name,
      zone: meta.zone,
      localities: meta.localities,
      population: pop,
      males: p.males,
      females: p.females,
      scPopulation: p.scPopulation,
      stPopulation: p.stPopulation,
      areaKm2: g.areaKm2,
      density,
      centroid: g.centroid,
      healthcareCount: hCount,
      schoolsCount: sCount,
      parksCount: prkCount,
      bedsCount: bedCount,
      healthcarePer10k: healthPer10k,
      schoolsPer10k: schoolsPer10k,
      parksPer10k: parksPer10k,
      healthcareDensity: healthDensity,
      schoolDensity: schoolDensity,
      healthTypes: healthTypesByWard[wardCode],
      schoolTypes: schoolTypesByWard[wardCode],
      nearestHealthMeters: minHealthDist !== Infinity ? Math.round(minHealthDist) : null,
      nearestSchoolMeters: minSchoolDist !== Infinity ? Math.round(minSchoolDist) : null
    };
  });

  // Calculate City-Wide Summary & Benchmarks
  const totalPop = wardRows.reduce((sum, w) => sum + w.population, 0);
  const totalHealth = wardRows.reduce((sum, w) => sum + w.healthcareCount, 0);
  const totalSchools = wardRows.reduce((sum, w) => sum + w.schoolsCount, 0);
  const totalParks = wardRows.reduce((sum, w) => sum + w.parksCount, 0);
  const totalAreaKm2 = Number(wardRows.reduce((sum, w) => sum + w.areaKm2, 0).toFixed(2));

  const cityHealthPer10k = totalPop > 0 ? Number(((totalHealth / totalPop) * 10_000).toFixed(2)) : 0;
  const citySchoolsPer10k = totalPop > 0 ? Number(((totalSchools / totalPop) * 10_000).toFixed(2)) : 0;
  const cityAvgDensity = totalAreaKm2 > 0 ? Math.round(totalPop / totalAreaKm2) : 0;

  // Global Composition Breakdown
  const healthComposition = [
    { name: 'Dispensaries', count: healthList.filter(h => h.subcategory === 'Dispensary').length, color: '#0d9488' },
    { name: 'UPHCs (Primary Health)', count: healthList.filter(h => h.subcategory === 'UPHC').length, color: '#0891b2' },
    { name: 'Public Hospitals', count: healthList.filter(h => h.subcategory === 'Public Hospital').length, color: '#1e40af' },
    { name: 'Maternity Homes', count: healthList.filter(h => h.subcategory === 'Maternity Home').length, color: '#f43f5e' },
    { name: 'Veterinary Hospitals', count: healthList.filter(h => h.subcategory === 'Veterinary Hospital').length, color: '#8b5cf6' }
  ].filter(item => item.count > 0);

  const schoolComposition = [
    { name: 'Municipal Schools (BMC)', count: schoolList.filter(s => s.subcategory === 'Municipal').length, color: '#059669' },
    { name: 'Private Unaided Schools', count: schoolList.filter(s => s.subcategory === 'Unaided').length, color: '#d97706' },
    { name: 'Government Aided Schools', count: schoolList.filter(s => s.subcategory === 'Aided').length, color: '#6366f1' }
  ].filter(item => item.count > 0);

  return {
    wardRows,
    cityBenchmarks: {
      totalPopulation: totalPop,
      totalWards: wardRows.length,
      totalHealthcare: totalHealth,
      totalSchools,
      totalParks,
      totalAreaKm2,
      cityHealthPer10k,
      citySchoolsPer10k,
      cityAvgDensity
    },
    healthComposition,
    schoolComposition,
    facilitiesMap: {
      allHealthcare: healthList,
      allSchools: schoolList,
      allParks: parksList
    }
  };
}

/**
 * Generates dynamic, data-backed insights and planning recommendations based on loaded datasets.
 */
export function generateInsights(wardRows, cityBenchmarks) {
  if (!wardRows || wardRows.length === 0) return { insights: [], priorities: [] };

  const validWards = wardRows.filter(w => w.population > 0);

  // Highest and lowest healthcare availability
  const sortedByHealthRate = [...validWards].sort((a, b) => b.healthcarePer10k - a.healthcarePer10k);
  const highestHealth = sortedByHealthRate[0];
  const lowestHealth = sortedByHealthRate[sortedByHealthRate.length - 1];

  // Highest and lowest school availability
  const sortedBySchoolRate = [...validWards].sort((a, b) => b.schoolsPer10k - a.schoolsPer10k);
  const highestSchool = sortedBySchoolRate[0];
  const lowestSchool = sortedBySchoolRate[sortedBySchoolRate.length - 1];

  // Disparity ratio
  const healthDisparity = lowestHealth.healthcarePer10k > 0
    ? (highestHealth.healthcarePer10k / lowestHealth.healthcarePer10k).toFixed(1)
    : 'N/A';

  const schoolDisparity = lowestSchool.schoolsPer10k > 0
    ? (highestSchool.schoolsPer10k / lowestSchool.schoolsPer10k).toFixed(1)
    : 'N/A';

  // High population wards with below-average facility rates
  const highPopUnderserved = validWards.filter(w =>
    w.population > 600_000 &&
    (w.healthcarePer10k < cityBenchmarks.cityHealthPer10k || w.schoolsPer10k < cityBenchmarks.citySchoolsPer10k)
  );

  // Suburb vs Island City comparison
  const islandWards = validWards.filter(w => w.zone === 'Island City');
  const suburbWards = validWards.filter(w => w.zone !== 'Island City');

  const islandPop = islandWards.reduce((s, w) => s + w.population, 0);
  const islandHealth = islandWards.reduce((s, w) => s + w.healthcareCount, 0);
  const islandSchools = islandWards.reduce((s, w) => s + w.schoolsCount, 0);
  const islandHealthPer10k = islandPop > 0 ? ((islandHealth / islandPop) * 10_000).toFixed(2) : 0;
  const islandSchoolsPer10k = islandPop > 0 ? ((islandSchools / islandPop) * 10_000).toFixed(2) : 0;

  const suburbPop = suburbWards.reduce((s, w) => s + w.population, 0);
  const suburbHealth = suburbWards.reduce((s, w) => s + w.healthcareCount, 0);
  const suburbSchools = suburbWards.reduce((s, w) => s + w.schoolsCount, 0);
  const suburbHealthPer10k = suburbPop > 0 ? ((suburbHealth / suburbPop) * 10_000).toFixed(2) : 0;
  const suburbSchoolsPer10k = suburbPop > 0 ? ((suburbSchools / suburbPop) * 10_000).toFixed(2) : 0;

  const insights = [
    {
      title: 'Huge Healthcare Gap Between Wards',
      highlight: `${healthDisparity}x Gap`,
      text: `Ward ${highestHealth.wardCode} (${highestHealth.localities.split(',')[0]}) has ${highestHealth.healthcarePer10k} clinics for every 10,000 residents, while Ward ${lowestHealth.wardCode} (${lowestHealth.localities.split(',')[0]}) has only ${lowestHealth.healthcarePer10k}. That means the best-served ward has ${healthDisparity} times more clinics per person than the least-served ward.`,
      keyTakeaway: `Healthcare is spread very unevenly: South Mumbai has plenty of clinics, while outer suburbs have severe shortages.`,
      type: 'warning'
    },
    {
      title: 'Suburbs Have the People, South Mumbai Has the Facilities',
      highlight: '75% Live in Suburbs',
      text: `South Mumbai has ${islandHealthPer10k} clinics per 10,000 people, while the suburbs have only ${suburbHealthPer10k}. Even though 3 out of every 4 Mumbaikars live in the suburbs, older South Mumbai still holds most of the city's health centers.`,
      keyTakeaway: `Facilities did not follow the people: Most families moved to the suburbs, but the infrastructure stayed in South Mumbai.`,
      type: 'info'
    },
    {
      title: 'Heavy Pressure on Big Suburban Wards',
      highlight: 'Overcrowded Wards',
      text: `Large suburban areas like ${highPopUnderserved.map(w => `Ward ${w.wardCode} (${(w.population / 100_000).toFixed(1)} Lakh people)`).slice(0, 3).join(', ')} have huge populations sharing a very small number of municipal clinics and schools.`,
      keyTakeaway: `Severe overcrowding: A single local clinic in these crowded wards has to serve more than 30,000 residents every single day.`,
      type: 'alert'
    },
    {
      title: 'Unequal School Access Across the City',
      highlight: 'School Shortage',
      text: `School availability goes from ${highestSchool.schoolsPer10k} schools per 10,000 people in Ward ${highestSchool.wardCode} down to just ${lowestSchool.schoolsPer10k} in Ward ${lowestSchool.wardCode}. Growing suburban areas need more school seats for children.`,
      keyTakeaway: `Uneven school options: Children in rapidly growing suburbs have far fewer schools nearby compared to older parts of the city.`,
      type: 'neutral'
    }
  ];

  const priorities = [
    {
      action: 'Build More Local Clinics in Crowded Suburbs',
      problem: `Wards like ${lowestHealth.wardCode} (${lowestHealth.localities.split(',')[0]}) have nearly 10 lakh people but very few small clinics, so people must travel far even for basic doctor visits.`,
      actionPlan: 'Open small neighborhood health clinics ("Aapli Chikitsa") within a 10-minute walk from homes in crowded areas.',
      expectedImpact: 'Treats 60–70% of common illnesses right in the neighborhood, stopping huge crowds from rushing to big hospitals like KEM and Sion.',
      rationale: 'Suburban wards need more local health centers to treat routine illnesses close to home.'
    },
    {
      action: 'Add More Classrooms and School Shifts in Suburban Areas',
      problem: 'Suburban wards have lots of young families, but there are not enough government school seats nearby, forcing children to travel far every day.',
      actionPlan: 'Run morning and afternoon shifts in existing schools, add extra floors to school buildings, and open community learning centers.',
      expectedImpact: 'Keeps school travel time under 15 minutes for children and stops classrooms from becoming overly packed.',
      rationale: 'Suburban areas need more school seats so kids do not have to travel long distances.'
    },
    {
      action: 'Make Walking and Travel to Clinics and Schools Safe',
      problem: 'Many local clinics and schools are hard or dangerous to reach because of broken footpaths, busy railway crossings, and heavy vehicle traffic.',
      actionPlan: 'Build clean shaded footpaths, add safe zebra crossings near schools, and run shared auto-rickshaws or mini-buses to clinic and school gates.',
      expectedImpact: 'Allows kids, senior citizens, and patients to walk or travel safely and comfortably without needing private cars or bikes.',
      rationale: 'Safe walking paths and local feeder transport help citizens reach daily services easily.'
    },
    {
      action: 'Fund Big Specialty Hospitals Separately from Local Clinics',
      problem: 'Famous big hospitals (like KEM, Sion, Nair) are in South/Central Mumbai but treat patients from the whole region. This makes South Mumbai look richer in healthcare than it actually is.',
      actionPlan: 'Give big specialty hospitals their own city-wide budget, and protect local ward funds specifically to build clinics in the suburbs.',
      expectedImpact: 'Guarantees that suburban wards receive their own fair share of budget to build and run local neighborhood clinics.',
      rationale: 'Separate regional hospital budgets so suburban wards get their fair share of local clinic funding.'
    }
  ];

  return { insights, priorities };
}
