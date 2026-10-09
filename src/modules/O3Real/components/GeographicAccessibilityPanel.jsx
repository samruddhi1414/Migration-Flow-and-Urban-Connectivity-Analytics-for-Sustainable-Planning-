import React, { useMemo } from 'react';
import { Footprints, ShieldAlert, CheckCircle2, Gauge } from 'lucide-react';

export default function GeographicAccessibilityPanel({
  wardRows,
  allHealthcare,
  allSchools,
  selectedWardCode
}) {
  const isFiltered = selectedWardCode !== 'ALL';
  const targetWards = isFiltered
    ? (wardRows || []).filter(w => w.wardCode === selectedWardCode)
    : (wardRows || []);

  const proximityStats = useMemo(() => {
    let under500 = 0;
    let b500to1000 = 0;
    let b1000to2000 = 0;
    let over2000 = 0;

    targetWards.forEach(w => {
      const hDist = w.nearestHealthMeters;
      const sDist = w.nearestSchoolMeters;

      [hDist, sDist].forEach(d => {
        if (d != null) {
          if (d < 500) under500++;
          else if (d <= 1000) b500to1000++;
          else if (d <= 2000) b1000to2000++;
          else over2000++;
        }
      });
    });

    const totalCalculated = under500 + b500to1000 + b1000to2000 + over2000 || 1;

    return {
      under500,
      b500to1000,
      b1000to2000,
      over2000,
      pctUnder1km: (((under500 + b500to1000) / totalCalculated) * 100).toFixed(1)
    };
  }, [targetWards]);

  const highestHealthDensityWard = [...targetWards].sort((a, b) => b.healthcareDensity - a.healthcareDensity)[0];
  const lowestHealthDensityWard = [...targetWards].sort((a, b) => a.healthcareDensity - b.healthcareDensity)[0];

  return (
    <section id="section-gaps" className="geo-accessibility-panel" aria-label="Walking Distance and Geographic Accessibility">
      <div className="section-title-wrap">
        <Footprints size={22} className="text-teal" />
        <div>
          <h2 className="section-main-title">Walking Distance to Nearest Facility</h2>
          <p className="section-sub-title">
            How far do residents have to walk to reach a clinic or school?
          </p>
        </div>
      </div>

      <div className="geo-cards-grid">
        {/* Proximity Band Breakdown */}
        <div className="geo-feature-card">
          <div className="card-top-header">
            <Footprints size={18} className="text-teal" />
            <h4 className="geo-card-heading">Walking Distance from Ward Centers</h4>
          </div>
          <p className="geo-card-desc">
            Estimated distance to the nearest clinic or school across all 24 wards:
          </p>

          <div className="proximity-bars-stack">
            <div className="proximity-bar-item">
              <div className="bar-labels">
                <span>&lt; 500m (About a 5-minute walk)</span>
                <strong>{proximityStats.under500} wards</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-teal"
                  style={{ width: `${(proximityStats.under500 / 48) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="proximity-bar-item">
              <div className="bar-labels">
                <span>500m – 1,000m (About a 10–15 min walk)</span>
                <strong>{proximityStats.b500to1000} wards</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-emerald"
                  style={{ width: `${(proximityStats.b500to1000 / 48) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="proximity-bar-item">
              <div className="bar-labels">
                <span>1,000m – 2,000m (Short bus or auto ride)</span>
                <strong>{proximityStats.b1000to2000} wards</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-amber"
                  style={{ width: `${(proximityStats.b1000to2000 / 48) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="proximity-bar-item">
              <div className="bar-labels">
                <span>&gt; 2,000m (Far away, requires bus or train)</span>
                <strong>{proximityStats.over2000} wards</strong>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-rose"
                  style={{ width: `${(proximityStats.over2000 / 48) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Density Comparison */}
        <div className="geo-feature-card">
          <div className="card-top-header">
            <Gauge size={18} className="text-teal" />
            <h4 className="geo-card-heading">Clinics per Square Kilometer</h4>
          </div>
          <p className="geo-card-desc">
            How closely packed are health facilities in each ward:
          </p>

          <div className="density-kpi-pair">
            <div className="density-box">
              <span className="density-lbl">Ward with Most Clinics per sq km</span>
              <strong className="density-val text-teal">
                {highestHealthDensityWard?.healthcareDensity || 0} clinics / km²
              </strong>
              <span className="density-sub">
                Ward {highestHealthDensityWard?.wardCode} ({highestHealthDensityWard?.localities.split(',')[0]} • {highestHealthDensityWard?.areaKm2} sq km)
              </span>
            </div>

            <div className="density-box">
              <span className="density-lbl">Ward with Fewest Clinics per sq km</span>
              <strong className="density-val text-rose">
                {lowestHealthDensityWard?.healthcareDensity || 0} clinics / km²
              </strong>
              <span className="density-sub">
                Ward {lowestHealthDensityWard?.wardCode} ({lowestHealthDensityWard?.localities.split(',')[0]} • {lowestHealthDensityWard?.areaKm2} sq km)
              </span>
            </div>
          </div>

          <div className="density-callout-note">
            <CheckCircle2 size={14} className="text-emerald" />
            <span>
              Older South Mumbai wards are physically compact, meaning facilities are close together. In contrast, large suburban wards like Malad (P/N) and Andheri (K/E) cover broad areas where residents may need to travel farther.
            </span>
          </div>
        </div>
      </div>

      {/* Clear Note on Straight-Line Distance vs Real Travel Time */}
      <div className="methodological-distinction-banner">
        <ShieldAlert size={20} className="distinction-icon" />
        <div>
          <h4 className="distinction-heading">
            Analytical Context: Straight-Line Map Proximity vs. Ground Travel Realities in Mumbai
          </h4>
          <p className="distinction-body">
            This analysis uses straight-line distance on a map. However, in Mumbai, real travel time is often longer due to railway lines dividing neighborhoods, congested market roads, lack of pedestrian footpaths, and monsoon flooding. A clinic 1 km away on paper might actually take 25 minutes to reach on foot.
          </p>
        </div>
      </div>
    </section>
  );
}
