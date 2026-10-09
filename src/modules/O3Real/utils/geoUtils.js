/**
 * GIS and Geometric Utilities for Mumbai Urban Analytics
 */

/**
 * Standard Ray-Casting algorithm for Point-in-Polygon detection.
 * Point: [lat, lon] or [lon, lat] depending on coordIndex.
 * Ring: array of points.
 */
export function isPointInRing(point, ring, isLatLon = true) {
  let inside = false;
  const x = isLatLon ? point[0] : point[1]; // lat
  const y = isLatLon ? point[1] : point[0]; // lon

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = isLatLon ? ring[i][0] : ring[i][1];
    const yi = isLatLon ? ring[i][1] : ring[i][0];
    const xj = isLatLon ? ring[j][0] : ring[j][1];
    const yj = isLatLon ? ring[j][1] : ring[j][0];

    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Check if a point [lat, lon] is inside a GeoJSON geometry (Polygon or MultiPolygon).
 * Note: Assumes geometry coordinates have been normalized to standard [lon, lat]
 */
export function isPointInFeature(lat, lon, geometry) {
  if (!geometry || !geometry.coordinates) return false;
  const pt = [lon, lat]; // standard GeoJSON [lon, lat]

  if (geometry.type === 'Polygon') {
    return isPointInRing(pt, geometry.coordinates[0], false);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      if (isPointInRing(pt, polygon[0], false)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Haversine formula to calculate the great-circle distance between two points in meters.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the geographic centroid of a polygon or multi-polygon.
 * Returns [lat, lon].
 */
export function getFeatureCentroid(geometry) {
  if (!geometry || !geometry.coordinates) return [19.0760, 72.8777];

  let totalLat = 0;
  let totalLon = 0;
  let totalPoints = 0;

  function processRing(ring) {
    for (const pt of ring) {
      // standard normalized GeoJSON has [lon, lat]
      totalLon += pt[0];
      totalLat += pt[1];
      totalPoints++;
    }
  }

  if (geometry.type === 'Polygon') {
    processRing(geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      processRing(poly[0]);
    }
  }

  if (totalPoints === 0) return [19.0760, 72.8777];
  return [totalLat / totalPoints, totalLon / totalPoints];
}

/**
 * Normalizes GeoJSON coordinates so that they conform to RFC 7946 GeoJSON standard [lon, lat].
 * Automatically detects if raw coordinates are [lat, lon] (where lat is ~19 and lon is ~72).
 */
export function normalizeGeoJSON(geojson) {
  if (!geojson || !geojson.features) return geojson;

  return {
    ...geojson,
    features: geojson.features.map(f => {
      const rawName = (f.properties?.Name || f.properties?.NAME2 || '').trim();
      const wardCode = rawName.replace(/[\r\n\t]/g, '').trim();

      const normalizeRing = ring => ring.map(pt => {
        // If coordinate 0 is < 50 (lat ~ 19) and coordinate 1 is > 50 (lon ~ 72), flip to [lon, lat]
        if (pt[0] < 50 && pt[1] > 50) {
          return [pt[1], pt[0]];
        }
        return [pt[0], pt[1]];
      });

      let normalizedCoords;
      if (f.geometry.type === 'Polygon') {
        normalizedCoords = f.geometry.coordinates.map(normalizeRing);
      } else if (f.geometry.type === 'MultiPolygon') {
        normalizedCoords = f.geometry.coordinates.map(poly => poly.map(normalizeRing));
      } else {
        normalizedCoords = f.geometry.coordinates;
      }

      const geom = {
        type: f.geometry.type,
        coordinates: normalizedCoords
      };

      const centroid = getFeatureCentroid(geom);

      return {
        ...f,
        properties: {
          ...f.properties,
          wardCode,
          wardName: wardCode,
          centroid
        },
        geometry: geom
      };
    })
  };
}

/**
 * Categorize distance into proximity bands
 */
export function getDistanceBand(meters) {
  if (meters < 500) return '< 500m (High Walkability)';
  if (meters <= 1000) return '500m – 1km (Moderate Walkability)';
  if (meters <= 2000) return '1km – 2km (Transit / Cycling Dependent)';
  return '> 2km (Significant Distance)';
}
