import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  RotateCcw, 
  Layers, 
  Info, 
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  getPressureColor, 
  getPressureCategory, 
  getSustainabilityColor,
  formatNumber, 
  formatCompactNumber,
  formatPercent 
} from '../utils/dataCleaner';
import { matchDistrictToData } from '../utils/geoJsonMatcher';

function MapController({ selectedDistrictData, resetTrigger, geoJsonData }) {
  const map = useMap();

  useEffect(() => {
    if (resetTrigger) {
      map.flyTo([19.25, 76.2], 7, { duration: 1 });
    }
  }, [resetTrigger, map]);

  useEffect(() => {
    if (selectedDistrictData && geoJsonData) {
      const matchingFeature = geoJsonData.features.find(f => {
        const dtCode = String(f.properties.dt_code || '').trim().padStart(3, '0');
        return dtCode === String(selectedDistrictData.districtCode).padStart(3, '0');
      });

      if (matchingFeature) {
        const layer = L.geoJSON(matchingFeature);
        map.fitBounds(layer.getBounds(), { maxZoom: 9, padding: [40, 40], duration: 1.2 });
      }
    }
  }, [selectedDistrictData, geoJsonData, map]);

  return null;
}

export default function PressureMap({
  districts,
  selectedDistrict,
  onSelectDistrict,
  onOpenDeepDive
}) {
  const [geoData, setGeoData] = useState(null);
  const [colorMode, setColorMode] = useState('pressure'); // 'pressure', 'demand', 'capacity', 'sustainability'
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [mappedCount, setMappedCount] = useState(0);
  const geoJsonRef = useRef(null);

  useEffect(() => {
    fetch('/data/maharashtra_districts.geojson')
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        if (data && data.features && districts) {
          const matched = data.features.filter(f => matchDistrictToData(f.properties, districts));
          setMappedCount(matched.length);
        }
      })
      .catch(err => console.error('Failed to load GeoJSON:', err));
  }, [districts]);

  const getFeatureColor = (districtData) => {
    if (!districtData || !districtData.indices) return '#cbd5e1';
    
    if (colorMode === 'pressure') {
      return getPressureColor(districtData.indices.pressureScore);
    } else if (colorMode === 'demand') {
      const d = districtData.indices.movementDemandIndex;
      if (d > 75) return '#ef4444';
      if (d > 55) return '#f97316';
      if (d > 35) return '#f59e0b';
      return '#3b82f6';
    } else if (colorMode === 'capacity') {
      const c = districtData.indices.infrastructureCapacityIndex;
      if (c >= 70) return '#10b981';
      if (c >= 50) return '#06b6d4';
      if (c >= 30) return '#f59e0b';
      return '#ef4444';
    } else if (colorMode === 'sustainability') {
      return getSustainabilityColor(districtData.indices.sustainabilityScore);
    }
    return '#94a3b8';
  };

  const styleFeature = (feature) => {
    const dData = matchDistrictToData(feature.properties, districts);
    const isSelected = selectedDistrict && dData && selectedDistrict.districtCode === dData.districtCode;
    const isHovered = hoveredDistrict && dData && hoveredDistrict.districtCode === dData.districtCode;

    return {
      fillColor: getFeatureColor(dData),
      weight: isSelected ? 3.5 : isHovered ? 2.5 : 1.2,
      opacity: 1,
      color: isSelected ? '#0e304f' : isHovered ? '#1e293b' : '#ffffff',
      dashArray: isSelected ? '2' : '',
      fillOpacity: isSelected ? 0.95 : isHovered ? 0.9 : 0.82
    };
  };

  const onEachFeature = (feature, layer) => {
    const dData = matchDistrictToData(feature.properties, districts);
    
    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({
          weight: 2.8,
          color: '#0e304f',
          fillOpacity: 0.95
        });
        l.bringToFront();
        if (dData) setHoveredDistrict(dData);
      },
      mouseout: (e) => {
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
        setHoveredDistrict(null);
      },
      click: () => {
        if (dData) {
          onSelectDistrict(dData);
        }
      }
    });

    if (dData) {
      const popupContent = `
        <div style="padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 230px; font-size: 12px; color: #1e293b; line-height: 1.4;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="font-size: 14px; color: #0e304f;">${dData.districtName}</strong>
            <span style="font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #64748b; border: 1px solid #cbd5e1;">Code ${dData.districtCode}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
            <div>
              <div style="font-size: 10px; color: #64748b;">Population</div>
              <div style="font-weight: 700; color: #0e304f;">${formatCompactNumber(dData.totalPopulation)}</div>
            </div>
            <div>
              <div style="font-size: 10px; color: #64748b;">Total Migrants</div>
              <div style="font-weight: 700; color: #0e304f;">${formatCompactNumber(dData.totalMigrants)}</div>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #475569;">Movement Demand Index:</span>
              <strong style="color: #0284c7;">${dData.indices?.movementDemandIndex} / 100</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #475569;">Infrastructure Capacity:</span>
              <strong style="color: #059669;">${dData.indices?.infrastructureCapacityIndex} / 100</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
              <span style="font-weight: 600; color: #0e304f;">Pressure Proxy Score:</span>
              <strong style="color: ${getPressureColor(dData.indices?.pressureScore)}; font-size: 13px;">${dData.indices?.pressureScore} (${dData.indices?.pressureCategory})</strong>
            </div>
          </div>

          <div style="font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <div>• All-Weather Road: <strong style="color: #0e304f;">${dData.transport?.allWeatherRoadPct}%</strong></div>
            <div>• Public Bus Coverage: <strong style="color: #0e304f;">${dData.transport?.publicBusPct}%</strong></div>
            <div>• Treated Water Supply: <strong style="color: #0e304f;">${dData.services?.treatedWaterPct}%</strong></div>
          </div>

          <div style="margin-top: 8px; text-align: center;">
            <span style="font-size: 10px; color: #0284c7; cursor: pointer; text-decoration: underline; font-weight: 600;">Click polygon to inspect full deep dive →</span>
          </div>
        </div>
      `;
      layer.bindPopup(popupContent, { maxWidth: 300 });
    }
  };

  const totalDistrictsCount = geoData ? geoData.features.length : 35;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-6 relative isolate z-0">
      
      {/* Evidence Tag & Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            EVIDENCE 01
          </div>
          <h2 className="text-xl font-bold text-[#0e304f] tracking-tight">
            Spatial Pressure Distribution Across Maharashtra
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial choropleth displaying calculated infrastructure pressure score across 36 district boundaries
          </p>
        </div>

        {/* Color Mode Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Layer Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setColorMode('pressure')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                colorMode === 'pressure' ? 'bg-[#0e304f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pressure Score
            </button>
            <button
              onClick={() => setColorMode('demand')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                colorMode === 'demand' ? 'bg-[#0e304f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demand Index
            </button>
            <button
              onClick={() => setColorMode('capacity')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                colorMode === 'capacity' ? 'bg-[#0e304f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Capacity Index
            </button>
            <button
              onClick={() => setColorMode('sustainability')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                colorMode === 'sustainability' ? 'bg-[#0e304f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sustainability
            </button>
          </div>

          {/* Reset Map View */}
          <button
            onClick={() => setResetTrigger(prev => prev + 1)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-300 text-xs font-semibold shadow-sm transition-colors"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          {/* District Match Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mapped: {mappedCount}/{totalDistrictsCount}</span>
          </div>

        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative isolate z-0 h-[480px] w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
        
        {geoData ? (
          <MapContainer
            center={[19.25, 76.2]}
            zoom={7}
            scrollWheelZoom={false}
            className="h-full w-full relative z-0"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            <GeoJSON
              key={`${colorMode}-${selectedDistrict?.districtCode || 'none'}`}
              ref={geoJsonRef}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
            <MapController
              selectedDistrictData={selectedDistrict}
              resetTrigger={resetTrigger}
              geoJsonData={geoData}
            />
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
            Loading Maharashtra District Boundaries...
          </div>
        )}

        {/* Floating Hover Card */}
        {hoveredDistrict && (
          <div className="absolute top-4 right-4 z-20 p-3.5 rounded-xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur text-xs w-64 pointer-events-none transition-all">
            <div className="flex items-center justify-between mb-1.5 border-b border-slate-100 pb-1.5">
              <span className="font-bold text-[#0e304f] text-sm">{hoveredDistrict.districtName}</span>
              <span className="font-mono text-[10px] text-slate-500">Code: {hoveredDistrict.districtCode}</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Pressure Score:</span>
                <span className="font-bold font-mono" style={{ color: getPressureColor(hoveredDistrict.indices?.pressureScore) }}>
                  {hoveredDistrict.indices?.pressureScore} ({hoveredDistrict.indices?.pressureCategory})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Demand Index:</span>
                <span className="font-bold font-mono text-sky-600">{hoveredDistrict.indices?.movementDemandIndex} / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Capacity Index:</span>
                <span className="font-bold font-mono text-emerald-600">{hoveredDistrict.indices?.infrastructureCapacityIndex} / 100</span>
              </div>
              <div className="flex justify-between">
                <span>Total Migrants:</span>
                <span className="text-[#0e304f] font-mono font-semibold">{formatCompactNumber(hoveredDistrict.totalMigrants)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Legend */}
        <div className="absolute bottom-4 left-4 z-10 p-3 rounded-xl bg-white/95 border border-slate-200 shadow-md backdrop-blur text-xs max-w-xs">
          <div className="font-bold text-[#0e304f] mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {colorMode === 'pressure' && 'Pressure Proxy Score'}
              {colorMode === 'demand' && 'Movement Demand Index'}
              {colorMode === 'capacity' && 'Infrastructure Capacity Index'}
              {colorMode === 'sustainability' && 'Sustainability Score'}
            </span>
          </div>

          {colorMode === 'pressure' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#ef4444] border border-red-400"></span>
                <span className="text-slate-700 font-medium">81–100: Critical Pressure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#f97316] border border-orange-400"></span>
                <span className="text-slate-700 font-medium">61–80: Very High Pressure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#f59e0b] border border-amber-400"></span>
                <span className="text-slate-700 font-medium">41–60: High Pressure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#06b6d4] border border-cyan-400"></span>
                <span className="text-slate-700 font-medium">21–40: Moderate Pressure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#10b981] border border-emerald-400"></span>
                <span className="text-slate-700 font-medium">0–20: Adequate Availability</span>
              </div>
            </div>
          )}

          {colorMode === 'sustainability' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#10b981]"></span>
                <span className="text-slate-700 font-medium">80–100: High Sustainability</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#f59e0b]"></span>
                <span className="text-slate-700 font-medium">50–79: Moderate Sustainability</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#ef4444]"></span>
                <span className="text-slate-700 font-medium">&lt;50: Low / Urgent Action</span>
              </div>
            </div>
          )}

          {(colorMode === 'demand' || colorMode === 'capacity') && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-500">Low (0)</span>
              <div className="h-2.5 flex-1 rounded bg-gradient-to-r from-blue-500 via-amber-500 to-rose-500 border border-slate-300"></div>
              <span className="text-[10px] text-slate-500">High (100)</span>
            </div>
          )}
        </div>

        {/* Selected District Floating Quick Action */}
        {selectedDistrict && (
          <div className="absolute bottom-4 right-4 z-20 p-3 rounded-xl bg-white border border-slate-200 shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
            <div>
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Selected District</div>
              <div className="font-bold text-[#0e304f] text-sm">{selectedDistrict.districtName}</div>
            </div>
            <button
              onClick={() => onOpenDeepDive(selectedDistrict)}
              className="px-3 py-1.5 bg-[#0e304f] text-white font-semibold rounded-lg text-xs hover:bg-navy-800 flex items-center gap-1 shadow transition-colors"
            >
              <span>View Deep Dive</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

      </div>

      {/* Bottom Callout Box matching the reference theme */}
      <div className="mt-4 callout-box">
        <div className="text-xs font-bold text-[#0e7490] uppercase tracking-wider mb-0.5">
          Spatial finding & Planning signal
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Pressure is intensely concentrated in the Mumbai Metropolitan Region (Thane, Mumbai Suburban, Mumbai City) and the Western Industrial Belt (Pune, Nashik). High migrant influx in these districts creates acute strain on public transit, town road surfaces, and treated municipal water systems.
        </p>
      </div>

    </div>
  );
}
