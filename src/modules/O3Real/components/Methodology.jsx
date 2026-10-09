import React from 'react';
import { BookOpen, Calculator, MapPin, Layers, Scale } from 'lucide-react';

export default function Methodology() {
  return (
    <footer id="section-methodology" className="methodology-card-panel" aria-label="Methodology and Explanations">
      <div className="section-title-wrap">
        <BookOpen size={22} className="text-teal" />
        <div>
          <h2 className="section-main-title">How This Data Was Built &amp; Calculated</h2>
          <p className="section-sub-title">
            Simple explanation of data sources, formulas, and ward boundaries
          </p>
        </div>
      </div>

      <div className="methodology-grid">
        {/* 1. Geographic Unit */}
        <div className="method-box">
          <div className="method-icon-title">
            <MapPin size={18} className="text-teal" />
            <h4>1. The 24 Mumbai Wards</h4>
          </div>
          <p className="method-text">
            Mumbai is managed by the Brihanmumbai Municipal Corporation (BMC) across <strong>24 administrative wards (A through T)</strong>. These are grouped into <em>South Mumbai (Island City)</em>, <em>Western Suburbs</em>, and <em>Eastern Suburbs</em>. All charts and map layers use these 24 verified ward boundaries.
          </p>
        </div>

        {/* 2. Demographic Aggregation */}
        <div className="method-box">
          <div className="method-icon-title">
            <Layers size={18} className="text-teal" />
            <h4>2. Official Census Population</h4>
          </div>
          <p className="method-text">
            Population numbers come from the official <strong>Census of India 2011 Primary Census Abstract</strong> (the authoritative decennial municipal baseline published by the Government of India). Census enumeration blocks were aggregated to corresponding BMC administrative wards to compute true resident populations.
          </p>
        </div>

        {/* 3. Availability Formula */}
        <div className="method-box">
          <div className="method-icon-title">
            <Calculator size={18} className="text-teal" />
            <h4>3. Calculating Facilities per 10,000 People</h4>
          </div>
          <p className="method-text">
            To compare wards fairly, we calculate the number of facilities per 10,000 residents:
          </p>
          <div className="formula-callout">
            <code>Facilities per 10,000 People = (Total Facilities ÷ Ward Population) × 10,000</code>
          </div>
          <p className="method-text">
            This prevents small wards from looking disadvantaged simply because they have smaller absolute counts.
          </p>
        </div>

        {/* 4. Spatial Join */}
        <div className="method-box">
          <div className="method-icon-title">
            <Scale size={18} className="text-teal" />
            <h4>4. Matching Locations to Wards</h4>
          </div>
          <p className="method-text">
            Each hospital and school has exact GPS coordinates (latitude and longitude). We use a geometric algorithm to verify which ward boundary polygon each facility falls inside.
          </p>
        </div>
      </div>

      <div className="academic-citation-bar">
        <p>
          <strong>Urban Analytics &amp; Public Policy Platform:</strong> Mumbai Urban Accessibility &amp; Service Equity Studio • Architecture: React, Vite, Leaflet, and Recharts • Baseline Data: Census of India &amp; BMC Municipal Open Data.
        </p>
      </div>
    </footer>
  );
}
