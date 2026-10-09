import Papa from 'papaparse';
import { normalizeWardName, CANONICAL_WARDS } from './wardMatcher';
import { normalizeGeoJSON, isPointInFeature } from './geoUtils';

/**
 * Lightweight XML/KML parser for Google Earth Placemarks.
 * Extracts Name, Coordinates, ExtendedData SimpleData fields.
 */
function parseKMLPlacemarks(kmlText, category, subcategory) {
  const placemarks = [];
  const pRegex = /<Placemark[\s\S]*?<\/Placemark>/g;
  let match;

  while ((match = pRegex.exec(kmlText)) !== null) {
    const p = match[0];
    const nameMatch = p.match(/<name>([\s\S]*?)<\/name>/);
    const coordMatch = p.match(/<coordinates>([\s\S]*?)<\/coordinates>/);

    const simpleData = {};
    const sdRegex = /<SimpleData name="([^"]+)">([\s\S]*?)<\/SimpleData>/g;
    let sdm;
    while ((sdm = sdRegex.exec(p)) !== null) {
      simpleData[sdm[1]] = sdm[2].trim();
    }

    let lat = null;
    let lon = null;
    if (coordMatch) {
      const parts = coordMatch[1].trim().split(',').map(s => parseFloat(s.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // In standard KML Point coordinates: lon, lat, alt
        lon = parts[0];
        lat = parts[1];
      }
    }

    const rawWard = simpleData.Ward || simpleData.WARD || simpleData.Ward_s || simpleData['Ward Name'] || simpleData.VillageNam || '';
    const rawType = simpleData.TYPE || simpleData.School_Typ || simpleData.Sch_Type || simpleData.Owner_Dept || subcategory;
    const address = simpleData.Address || simpleData.ADDRESS || simpleData.UPHC_Addre || simpleData.LOCATION || '';

    placemarks.push({
      id: `${category}-${subcategory}-${placemarks.length + 1}`,
      name: nameMatch ? nameMatch[1].trim().replace(/&amp;/g, '&') : 'Unnamed Facility',
      category,
      subcategory,
      rawType,
      address,
      lat,
      lon,
      rawWard,
      ward: normalizeWardName(rawWard),
      metadata: simpleData
    });
  }

  return placemarks;
}

/**
 * Load Census 2011 population data from CSV
 */
export async function loadPopulationData() {
  try {
    const response = await fetch('/O3_data/population.csv');
    if (!response.ok) throw new Error('population.csv not found');
    const text = await response.text();
    if (text.trimStart().toLowerCase().startsWith('<!doctype')) {
      throw new Error('Received HTML instead of CSV');
    }

    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    const subwards = [];
    const wardMap = {};

    CANONICAL_WARDS.forEach(w => {
      wardMap[w] = {
        wardCode: w,
        totalPopulation: 0,
        males: 0,
        females: 0,
        scPopulation: 0,
        stPopulation: 0,
        censusUnitsCount: 0
      };
    });

    parsed.data.forEach(row => {
      const rawWard = row['Ward Name'];
      const wardCode = normalizeWardName(rawWard);
      const pop = Number(row['Total Population']) || 0;
      const males = Number(row['Total Males']) || 0;
      const females = Number(row['Total Females']) || 0;
      const sc = Number(row['SC Population']) || 0;
      const st = Number(row['ST Population']) || 0;

      subwards.push({
        censusWardCode: row['Ward Code'],
        townName: row['Town Name'],
        rawWard,
        matchedWard: wardCode,
        totalPopulation: pop,
        males,
        females,
        sc,
        st
      });

      if (wardCode && wardMap[wardCode]) {
        wardMap[wardCode].totalPopulation += pop;
        wardMap[wardCode].males += males;
        wardMap[wardCode].females += females;
        wardMap[wardCode].scPopulation += sc;
        wardMap[wardCode].stPopulation += st;
        wardMap[wardCode].censusUnitsCount += 1;
      }
    });

    return {
      status: 'loaded',
      byWard: wardMap,
      subwards,
      totalPopulation: Object.values(wardMap).reduce((s, w) => s + w.totalPopulation, 0),
      wardCount: Object.keys(wardMap).length,
      source: 'Census of India 2011 (Primary Census Abstract for Greater Mumbai)'
    };
  } catch (err) {
    console.warn('Population load warning:', err.message);
    return {
      status: 'error',
      message: err.message,
      byWard: {},
      subwards: [],
      totalPopulation: 0,
      wardCount: 0
    };
  }
}

/**
 * Load Mumbai Wards GeoJSON
 */
export async function loadWardsGeoJSON() {
  try {
    const response = await fetch('/O3_data/wards_mumbai.geojson');
    if (!response.ok) throw new Error('wards_mumbai.geojson not found');
    const rawData = await response.json();
    const normalized = normalizeGeoJSON(rawData);
    return {
      status: 'loaded',
      data: normalized,
      featuresCount: normalized.features.length,
      source: 'Brihanmumbai Municipal Corporation (BMC) Ward Boundary Geographic Dataset'
    };
  } catch (err) {
    console.warn('Wards GeoJSON load warning:', err.message);
    return {
      status: 'error',
      message: err.message,
      data: null,
      featuresCount: 0
    };
  }
}

/**
 * Spatial join: assign missing ward codes using point-in-polygon against GeoJSON features
 */
function assignWardsWithGeoJSON(items, geojson) {
  if (!geojson || !geojson.features) return items;

  return items.map(item => {
    if (item.ward) return item;
    if (item.lat != null && item.lon != null) {
      for (const feature of geojson.features) {
        if (isPointInFeature(item.lat, item.lon, feature.geometry)) {
          return {
            ...item,
            ward: feature.properties.wardCode,
            spatialMatched: true
          };
        }
      }
    }
    return item;
  });
}

/**
 * Load Healthcare Datasets (KMLs + CSV)
 */
export async function loadHealthcareData(geojson) {
  const sources = [
    { file: 'Mumbai City Public Hospitals Map.kml', subcategory: 'Public Hospital' },
    { file: 'Mumbai City Dispensaries Map.kml', subcategory: 'Dispensary' },
    { file: 'Mumbai City UPHCs Map.kml', subcategory: 'UPHC' },
    { file: 'Mumbai City Public Maternity Hospitals Map.kml', subcategory: 'Maternity Home' },
    { file: 'Mumbai City Public Veterinary Hospitals Map.kml', subcategory: 'Veterinary Hospital' }
  ];

  let allKMLItems = [];
  const loadedSources = [];

  for (const src of sources) {
    try {
      const resp = await fetch(`/O3_data/${encodeURIComponent(src.file)}`);
      if (resp.ok) {
        const text = await resp.text();
        const items = parseKMLPlacemarks(text, 'Healthcare', src.subcategory);
        allKMLItems = allKMLItems.concat(items);
        loadedSources.push({ name: src.file, count: items.length });
      }
    } catch (e) {
      console.warn(`Could not load ${src.file}:`, e);
    }
  }

  // Load Mumbai Hospitals List CSV for bed counts & registry
  let csvHospitals = [];
  try {
    const csvResp = await fetch('/O3_data/Mumbai%20Hospitals%20List.csv');
    if (csvResp.ok) {
      const text = await csvResp.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      csvHospitals = parsed.data.map((row, idx) => ({
        id: `csv-hospital-${idx + 1}`,
        name: row['Hospital Name'] || 'Unknown Hospital',
        ward: normalizeWardName(row['Ward Name']),
        type: row['Type of Hospital/Health facility'] || 'General Hospital',
        beds: parseInt(row['No. of Beds'] || '0', 10) || 0,
        address: row['Address'] || '',
        contact: row['Contact'] || ''
      }));
      loadedSources.push({ name: 'Mumbai Hospitals List.csv', count: csvHospitals.length });
    }
  } catch (e) {
    console.warn('Could not load Mumbai Hospitals List.csv:', e);
  }

  const assignedHealth = assignWardsWithGeoJSON(allKMLItems, geojson);

  return {
    status: assignedHealth.length > 0 ? 'loaded' : 'unavailable',
    facilities: assignedHealth,
    csvHospitals,
    totalCount: assignedHealth.length,
    loadedSources
  };
}

/**
 * Load School Datasets (KMLs)
 */
export async function loadSchoolsData(geojson) {
  const sources = [
    { file: 'Mumbai Municipal Primary and Secondary Schools Map.kml', subcategory: 'Municipal' },
    { file: 'Mumbai Aided Schools Map.kml', subcategory: 'Aided' },
    { file: 'Mumbai Unaided Schools Map.kml', subcategory: 'Unaided' }
  ];

  let allSchools = [];
  const loadedSources = [];

  for (const src of sources) {
    try {
      const resp = await fetch(`/O3_data/${encodeURIComponent(src.file)}`);
      if (resp.ok) {
        const text = await resp.text();
        const items = parseKMLPlacemarks(text, 'Education', src.subcategory);
        allSchools = allSchools.concat(items);
        loadedSources.push({ name: src.file, count: items.length });
      }
    } catch (e) {
      console.warn(`Could not load ${src.file}:`, e);
    }
  }

  const assignedSchools = assignWardsWithGeoJSON(allSchools, geojson);

  return {
    status: assignedSchools.length > 0 ? 'loaded' : 'unavailable',
    facilities: assignedSchools,
    totalCount: assignedSchools.length,
    loadedSources
  };
}

/**
 * Load Parks and Open Spaces Data (KML)
 */
export async function loadParksData(geojson) {
  try {
    const resp = await fetch('/O3_data/Mumbai%20pulic%20garden%2Cparks%20and%20zoos.kml');
    if (!resp.ok) throw new Error('Parks KML not found');
    const text = await resp.text();
    const items = parseKMLPlacemarks(text, 'Recreation', 'Public Garden / Park');
    const assignedParks = assignWardsWithGeoJSON(items, geojson);
    return {
      status: 'loaded',
      facilities: assignedParks,
      totalCount: assignedParks.length
    };
  } catch (e) {
    console.warn('Parks data not available:', e.message);
    return {
      status: 'unavailable',
      facilities: [],
      totalCount: 0
    };
  }
}

/**
 * Master Loader: Coordinates all datasets, produces unified data model & audit metrics
 */
export async function loadAllDashboardData() {
  const startTime = performance.now();

  // Load GeoJSON and Population first
  const [geojsonRes, populationRes] = await Promise.all([
    loadWardsGeoJSON(),
    loadPopulationData()
  ]);

  const geojson = geojsonRes.status === 'loaded' ? geojsonRes.data : null;

  // Load facilities with spatial join support
  const [healthRes, schoolsRes, parksRes] = await Promise.all([
    loadHealthcareData(geojson),
    loadSchoolsData(geojson),
    loadParksData(geojson)
  ]);

  const loadDurationMs = Math.round(performance.now() - startTime);

  // Compile Data Quality Audit
  const allFacilities = [
    ...healthRes.facilities,
    ...schoolsRes.facilities,
    ...parksRes.facilities
  ];

  const totalPoints = allFacilities.length;
  const validCoordinates = allFacilities.filter(f => f.lat != null && f.lon != null && !isNaN(f.lat) && !isNaN(f.lon)).length;
  const matchedToWards = allFacilities.filter(f => f.ward != null && CANONICAL_WARDS.includes(f.ward)).length;
  const missingCoordinates = totalPoints - validCoordinates;
  const unmatchedWards = totalPoints - matchedToWards;

  const dataQualityReport = {
    totalRecordsLoaded: totalPoints + (populationRes.subwards?.length || 0) + (healthRes.csvHospitals?.length || 0),
    totalFacilitiesWithCoords: totalPoints,
    validCoordinatesCount: validCoordinates,
    validCoordinatesPercent: totalPoints > 0 ? ((validCoordinates / totalPoints) * 100).toFixed(1) : 0,
    matchedWardsCount: matchedToWards,
    matchedWardsPercent: totalPoints > 0 ? ((matchedToWards / totalPoints) * 100).toFixed(1) : 0,
    missingCoordinatesCount: missingCoordinates,
    unmatchedWardsCount: unmatchedWards,
    loadDurationMs,
    datasetsStatus: {
      geojson: geojsonRes.status,
      population: populationRes.status,
      healthcare: healthRes.status,
      schools: schoolsRes.status,
      parks: parksRes.status
    }
  };

  return {
    geojson,
    population: populationRes,
    healthcare: healthRes,
    schools: schoolsRes,
    parks: parksRes,
    dataQualityReport
  };
}