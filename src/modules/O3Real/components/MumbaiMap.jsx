import React, { useMemo, useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  Circle,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { WARD_METADATA } from '../utils/wardMatcher';

// Custom SVG div icons that never break Vite bundler
function createCustomIcon(type, subcategory) {
  let bgColor = '#0d9488'; // teal default
  let symbol = '+';

  if (type === 'Healthcare') {
    if (subcategory === 'Public Hospital') {
      bgColor = '#1e3a8a'; // deep navy
      symbol = 'H';
    } else if (subcategory === 'UPHC') {
      bgColor = '#0284c7'; // cyan
      symbol = '+';
    } else if (subcategory === 'Maternity Home') {
      bgColor = '#e11d48'; // rose
      symbol = 'M';
    } else {
      bgColor = '#0d9488'; // teal
      symbol = '+';
    }
  } else if (type === 'Education') {
    if (subcategory === 'Municipal') {
      bgColor = '#059669'; // emerald
      symbol = 'B';
    } else if (subcategory === 'Aided') {
      bgColor = '#4f46e5'; // indigo
      symbol = 'A';
    } else {
      bgColor = '#d97706'; // amber
      symbol = 'U';
    }
  } else if (type === 'Recreation') {
    bgColor = '#16a34a'; // green
    symbol = 'P';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.35);
        color: white;
        font-weight: 700;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        line-height: 1;
      ">${symbol}</div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });
}

// Helper component to auto-fit map view to Mumbai or selected ward
function MapAutoFit({ geojson, selectedWardCode, wardRows }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedWardCode && selectedWardCode !== 'ALL') {
      const wardRow = wardRows?.find(w => w.wardCode === selectedWardCode);
      if (wardRow && wardRow.centroid) {
        map.flyTo(wardRow.centroid, 13, { duration: 1.2 });
        return;
      }
    }

    if (geojson && geojson.features && geojson.features.length > 0) {
      try {
        const geoLayer = L.geoJSON(geojson);
        const bounds = geoLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (err) {
        console.warn('Map fit bounds warning:', err);
      }
    }
  }, [map, geojson, selectedWardCode, wardRows]);

  return null;
}

export default function MumbaiMap({
  geojson,
  wardRows,
  allHealthcare,
  allSchools,
  allParks,
  selectedWardCode,
  onSelectWard,
  mapMetric,
  onMetricChange
}) {
  const [showHealthMarkers, setShowHealthMarkers] = useState(true);
  const [showSchoolMarkers, setShowSchoolMarkers] = useState(true);
  const [showParkMarkers, setShowParkMarkers] = useState(false);
  const [showBuffers, setShowBuffers] = useState(false);

  const wardMetricsMap = useMemo(() => {
    const map = {};
    (wardRows || []).forEach(w => {
      map[w.wardCode] = w;
    });
    return map;
  }, [wardRows]);

  const { colorBreaks, metricTitle, formatMetricVal } = useMemo(() => {
    if (!wardRows || wardRows.length === 0) {
      return { colorBreaks: [], metricTitle: '', formatMetricVal: (v) => v };
    }

    const values = wardRows.map(w => Number(w[mapMetric]) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min) / 5 || 1;

    let title = 'Metric';
    let fmt = (v) => v;

    if (mapMetric === 'healthcarePer10k') {
      title = 'Healthcare per 10,000 People';
      fmt = (v) => `${v} per 10k`;
    } else if (mapMetric === 'schoolsPer10k') {
      title = 'Schools per 10,000 People';
      fmt = (v) => `${v} per 10k`;
    } else if (mapMetric === 'population') {
      title = 'Total Ward Population';
      fmt = (v) => Number(v).toLocaleString('en-IN');
    } else if (mapMetric === 'density') {
      title = 'Population Density (People / sq km)';
      fmt = (v) => `${Number(v).toLocaleString('en-IN')}/km²`;
    } else if (mapMetric === 'healthcareCount') {
      title = 'Healthcare Facilities Count';
      fmt = (v) => `${v} units`;
    } else if (mapMetric === 'schoolsCount') {
      title = 'Schools Count';
      fmt = (v) => `${v} schools`;
    } else if (mapMetric === 'parksCount') {
      title = 'Parks & Gardens Count';
      fmt = (v) => `${v} parks`;
    }

    const breaks = [
      { min: min, max: min + step, color: '#f0fdfa' },
      { min: min + step, max: min + step * 2, color: '#99f6e4' },
      { min: min + step * 2, max: min + step * 3, color: '#2dd4bf' },
      { min: min + step * 3, max: min + step * 4, color: '#0d9488' },
      { min: min + step * 4, max: max, color: '#134e4a' }
    ];

    return { colorBreaks: breaks, metricTitle: title, formatMetricVal: fmt };
  }, [wardRows, mapMetric]);

  const getWardFillColor = (wardCode) => {
    const wardData = wardMetricsMap[wardCode];
    if (!wardData) return '#cbd5e1';

    const val = Number(wardData[mapMetric]) || 0;
    for (let i = colorBreaks.length - 1; i >= 0; i--) {
      if (val >= colorBreaks[i].min) {
        return colorBreaks[i].color;
      }
    }
    return colorBreaks[0]?.color || '#f0fdfa';
  };

  const styleFeature = (feature) => {
    const wardCode = feature.properties.wardCode;
    const isSelected = selectedWardCode === wardCode;

    return {
      fillColor: getWardFillColor(wardCode),
      weight: isSelected ? 3.5 : 1.5,
      opacity: 1,
      color: isSelected ? '#f59e0b' : '#334155',
      dashArray: isSelected ? '' : '2',
      fillOpacity: isSelected ? 0.85 : 0.65
    };
  };

  const onEachFeature = (feature, layer) => {
    const wardCode = feature.properties.wardCode;
    const wardData = wardMetricsMap[wardCode];

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 3,
          color: '#0f766e',
          fillOpacity: 0.85
        });
        l.bringToFront();
      },
      mouseout: (e) => {
        const l = e.target;
        const isSelected = selectedWardCode === wardCode;
        l.setStyle({
          weight: isSelected ? 3.5 : 1.5,
          color: isSelected ? '#f59e0b' : '#334155',
          fillOpacity: isSelected ? 0.85 : 0.65
        });
      },
      click: () => {
        onSelectWard(wardCode);
      }
    });

    if (wardData) {
      const popupHtml = `
        <div class="leaflet-ward-popup">
          <div class="popup-header">
            <h4>Ward ${wardCode} (${wardData.zone})</h4>
            <span class="popup-tag">${wardData.areaKm2} sq km</span>
          </div>
          <p class="popup-localities"><strong>Key Areas:</strong> ${wardData.localities}</p>
          <div class="popup-grid">
            <div>
              <span class="popup-lbl">Population:</span>
              <span class="popup-val">${wardData.population?.toLocaleString('en-IN') || 'N/A'}</span>
            </div>
            <div>
              <span class="popup-lbl">Density:</span>
              <span class="popup-val">${wardData.density?.toLocaleString('en-IN') || 0}/km²</span>
            </div>
            <div>
              <span class="popup-lbl">Healthcare:</span>
              <span class="popup-val">${wardData.healthcareCount} units (${wardData.healthcarePer10k}/10k)</span>
            </div>
            <div>
              <span class="popup-lbl">Schools:</span>
              <span class="popup-val">${wardData.schoolsCount} schools (${wardData.schoolsPer10k}/10k)</span>
            </div>
          </div>
          <div class="popup-action-hint">Click to focus dashboard on Ward ${wardCode}</div>
        </div>
      `;
      layer.bindPopup(popupHtml);
    }
  };

  const visibleHealth = useMemo(() => {
    if (!showHealthMarkers) return [];
    if (selectedWardCode === 'ALL') return allHealthcare || [];
    return (allHealthcare || []).filter(h => h.ward === selectedWardCode);
  }, [allHealthcare, selectedWardCode, showHealthMarkers]);

  const visibleSchools = useMemo(() => {
    if (!showSchoolMarkers) return [];
    if (selectedWardCode === 'ALL') return allSchools || [];
    return (allSchools || []).filter(s => s.ward === selectedWardCode);
  }, [allSchools, selectedWardCode, showSchoolMarkers]);

  const visibleParks = useMemo(() => {
    if (!showParkMarkers) return [];
    if (selectedWardCode === 'ALL') return (allParks || []).slice(0, 300);
    return (allParks || []).filter(p => p.ward === selectedWardCode);
  }, [allParks, selectedWardCode, showParkMarkers]);

  const selectedWardDetails = wardMetricsMap[selectedWardCode];

  return (
    <section id="section-map" className="map-section-panel" aria-label="Interactive Mumbai GIS Map">
      <div className="map-toolbar-bar">
        <div className="map-toolbar-title-wrap">
          <Compass size={20} className="text-teal" />
          <div>
            <h2 className="map-section-title">Where Are Services Located in Mumbai?</h2>
            <p className="map-section-subtitle">
              Darker teal indicates higher {metricTitle.toLowerCase()}. Click any ward polygon to inspect its local numbers.
            </p>
          </div>
        </div>

        <div className="map-controls-group">
          {/* Choropleth metric selector */}
          <div className="map-metric-pill">
            <span className="map-metric-label">Color Wards By:</span>
            <select
              className="map-metric-select"
              value={mapMetric}
              onChange={(e) => onMetricChange(e.target.value)}
            >
              <option value="healthcarePer10k">Healthcare / 10k</option>
              <option value="schoolsPer10k">Schools / 10k</option>
              <option value="population">Population</option>
              <option value="density">Density</option>
              <option value="healthcareCount">Healthcare Count</option>
              <option value="schoolsCount">School Count</option>
              <option value="parksCount">Parks Count</option>
            </select>
          </div>

          {/* Layer toggles */}
          <div className="layer-toggle-btn-group">
            <button
              type="button"
              className={`btn-layer-toggle ${showHealthMarkers ? 'active' : ''}`}
              onClick={() => setShowHealthMarkers(prev => !prev)}
              title="Show/hide healthcare clinics & hospitals"
            >
              <span className="legend-dot dot-health"></span>
              <span>Health ({visibleHealth.length})</span>
            </button>

            <button
              type="button"
              className={`btn-layer-toggle ${showSchoolMarkers ? 'active' : ''}`}
              onClick={() => setShowSchoolMarkers(prev => !prev)}
              title="Show/hide schools"
            >
              <span className="legend-dot dot-school"></span>
              <span>Schools ({visibleSchools.length})</span>
            </button>

            <button
              type="button"
              className={`btn-layer-toggle ${showParkMarkers ? 'active' : ''}`}
              onClick={() => setShowParkMarkers(prev => !prev)}
              title="Show/hide parks & open spaces"
            >
              <span className="legend-dot dot-park"></span>
              <span>Parks ({visibleParks.length})</span>
            </button>

            <button
              type="button"
              className={`btn-layer-toggle ${showBuffers ? 'active' : ''}`}
              onClick={() => setShowBuffers(prev => !prev)}
              title="Show 500-meter walking rings around facilities"
            >
              <span>500m Walking Rings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Ward Focus Banner */}
      {selectedWardDetails && (
        <div className="ward-focus-banner">
          <div className="ward-focus-info">
            <MapPin size={16} className="text-amber" />
            <span className="focus-ward-title">Ward {selectedWardDetails.wardCode}: {selectedWardDetails.displayName}</span>
            <span className="focus-ward-sub">({selectedWardDetails.zone} • {selectedWardDetails.localities})</span>
          </div>

          <div className="ward-focus-stats">
            <span className="focus-stat-item">
              <strong>{selectedWardDetails.population?.toLocaleString('en-IN')}</strong> People
            </span>
            <span className="focus-stat-item">
              <strong>{selectedWardDetails.healthcareCount}</strong> Health ({selectedWardDetails.healthcarePer10k}/10k)
            </span>
            <span className="focus-stat-item">
              <strong>{selectedWardDetails.schoolsCount}</strong> Schools ({selectedWardDetails.schoolsPer10k}/10k)
            </span>
            <button
              type="button"
              className="btn-clear-ward-focus"
              onClick={() => onSelectWard('ALL')}
            >
              Reset to All Wards
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="leaflet-map-wrapper">
        {!geojson ? (
          <div className="map-empty-state">
            <AlertCircle size={32} className="text-amber" />
            <p>Ward boundaries GeoJSON is loading or unavailable.</p>
          </div>
        ) : (
          <MapContainer
            center={[19.0760, 72.8777]}
            zoom={11}
            scrollWheelZoom={true}
            className="leaflet-actual-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            <MapAutoFit
              geojson={geojson}
              selectedWardCode={selectedWardCode}
              wardRows={wardRows}
            />

            {/* Ward Polygons */}
            <GeoJSON
              key={`geojson-${mapMetric}-${selectedWardCode}`}
              data={geojson}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />

            {/* Healthcare Facility Markers */}
            {visibleHealth.map((item, idx) => {
              if (!item.lat || !item.lon) return null;
              return (
                <React.Fragment key={`health-${item.id || idx}`}>
                  <Marker
                    position={[item.lat, item.lon]}
                    icon={createCustomIcon('Healthcare', item.subcategory)}
                  >
                    <Popup>
                      <div className="leaflet-facility-popup">
                        <span className="popup-category-badge badge-teal">{item.subcategory}</span>
                        <h4 className="popup-facility-name">{item.name}</h4>
                        <p className="popup-facility-addr">{item.address || 'Address not listed'}</p>
                        <p className="popup-facility-meta">
                          <strong>Ward:</strong> {item.ward || 'Unassigned'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  {showBuffers && (
                    <Circle
                      center={[item.lat, item.lon]}
                      radius={500}
                      pathOptions={{ color: '#e11d48', weight: 1, fillOpacity: 0.08 }}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* School Markers */}
            {visibleSchools.map((item, idx) => {
              if (!item.lat || !item.lon) return null;
              return (
                <React.Fragment key={`school-${item.id || idx}`}>
                  <Marker
                    position={[item.lat, item.lon]}
                    icon={createCustomIcon('Education', item.subcategory)}
                  >
                    <Popup>
                      <div className="leaflet-facility-popup">
                        <span className="popup-category-badge badge-emerald">{item.subcategory} School</span>
                        <h4 className="popup-facility-name">{item.name}</h4>
                        <p className="popup-facility-addr">{item.address || 'Address not listed'}</p>
                        <p className="popup-facility-meta">
                          <strong>Ward:</strong> {item.ward || 'Unassigned'} • <strong>Type:</strong> {item.rawType || 'General'}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  {showBuffers && (
                    <Circle
                      center={[item.lat, item.lon]}
                      radius={500}
                      pathOptions={{ color: '#059669', weight: 1, fillOpacity: 0.06 }}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Parks Markers */}
            {visibleParks.map((item, idx) => {
              if (!item.lat || !item.lon) return null;
              return (
                <Marker
                  key={`park-${item.id || idx}`}
                  position={[item.lat, item.lon]}
                  icon={createCustomIcon('Recreation', item.subcategory)}
                >
                  <Popup>
                    <div className="leaflet-facility-popup">
                      <span className="popup-category-badge badge-neutral">Public Garden / Park</span>
                      <h4 className="popup-facility-name">{item.name}</h4>
                      <p className="popup-facility-addr">{item.address || 'Municipal Garden'}</p>
                      <p className="popup-facility-meta">Ward: {item.ward || 'Unassigned'}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* Floating Map Legend */}
        <div className="map-legend-overlay">
          <span className="legend-title">{metricTitle}</span>
          <div className="legend-scale-bars">
            {colorBreaks.map((b, i) => (
              <div key={i} className="legend-step-row">
                <span className="legend-color-box" style={{ backgroundColor: b.color }}></span>
                <span className="legend-step-label">
                  {formatMetricVal(Number(b.min.toFixed(1)))} – {formatMetricVal(Number(b.max.toFixed(1)))}
                </span>
              </div>
            ))}
          </div>
          <div className="legend-buffer-note">
            <em>Click any ward on the map to filter charts below.</em>
          </div>
        </div>
      </div>
    </section>
  );
}
