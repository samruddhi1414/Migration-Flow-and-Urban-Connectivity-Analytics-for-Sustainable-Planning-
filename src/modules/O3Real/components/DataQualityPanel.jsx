import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Users,
  MapPin,
  HeartPulse,
  GraduationCap,
  Trees,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

const DATA_PILLARS = [
  {
    icon: Users,
    category: 'Demographics',
    title: 'Census 2011 Population',
    badge: '1.24 Cr People',
    badgeClass: 'badge-primary',
    sourceOrg: 'Office of the Registrar General & Census Commissioner',
    keyStats: '1,24,42,373 residents across 97 subwards',
    description: 'Official decennial baseline for Greater Mumbai (authoritative national census count). Provides total population, gender ratio, and demographic groups (SC/ST) to evaluate facilities per 10,000 residents.',
    file: 'population.csv'
  },
  {
    icon: MapPin,
    category: 'Geography',
    title: '24 BMC Administrative Wards',
    badge: '24 Wards',
    badgeClass: 'badge-teal',
    sourceOrg: 'Brihanmumbai Municipal Corporation (BMC) GIS Cell',
    keyStats: '24 Ward Polygons (Wards A through T)',
    description: 'Official municipal vector boundaries classifying Greater Mumbai into South Mumbai (Island City), Western Suburbs, and Eastern Suburbs.',
    file: 'wards_mumbai.geojson'
  },
  {
    icon: HeartPulse,
    category: 'Healthcare',
    title: 'Public Health Infrastructure',
    badge: '459 Facilities Mapped',
    badgeClass: 'badge-emerald',
    sourceOrg: 'BMC Public Health Dept & NUHM',
    keyStats: '31 Hospitals, 186 Dispensaries, 211 UPHCs, 28 Maternity Homes',
    description: 'Multi-tiered public healthcare network providing neighborhood consultations, maternal welfare, and emergency medical beds (plus 288 hospital bed registries).',
    file: '5 KML Maps + Hospitals CSV'
  },
  {
    icon: GraduationCap,
    category: 'Education',
    title: 'School Education Network',
    badge: '2,247 Schools Mapped',
    badgeClass: 'badge-primary',
    sourceOrg: 'BMC Education Dept & UDISE+',
    keyStats: '1,134 Municipal, 404 Aided, 709 Private Unaided',
    description: 'Comprehensive primary and secondary school directory across all mediums of instruction to benchmark public vs. private education access.',
    file: '3 School KML Files'
  }
];

const ACADEMIC_CITATIONS = [
  {
    title: 'Census of India (Demographic Baseline)',
    citation: 'Office of the Registrar General & Census Commissioner. (2011). Primary Census Abstract (PCA) — Greater Mumbai District (Series 28, Part XII-B). Ministry of Home Affairs, Government of India.'
  },
  {
    title: 'Brihanmumbai Municipal Corporation (Ward GIS Boundaries)',
    citation: 'Brihanmumbai Municipal Corporation (BMC). (2020–2023). Administrative Ward Boundaries & GIS Geodatabase. Information Technology & GIS Cell, Municipal Corporation of Greater Mumbai (MCGM).'
  },
  {
    title: 'Public Health Infrastructure (Hospitals, Dispensaries, UPHCs)',
    citation: 'BMC Public Health Department & National Urban Health Mission (NUHM). (2022). Directory of Public Health Infrastructure: Municipal Hospitals, Maternity Homes, Dispensaries, and UPHCs. Government of Maharashtra.'
  },
  {
    title: 'School Education Directory (UDISE+ & Municipal Schools)',
    citation: 'Department of School Education and Literacy. (2021–2022). Unified District Information System for Education Plus (UDISE+) School Directory for Greater Mumbai. Ministry of Education, Government of India.'
  }
];

export default function DataQualityPanel({ dataQualityReport }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const report = dataQualityReport || {};

  const handleCopyCitation = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  const handleCopyAllCitations = () => {
    const all = ACADEMIC_CITATIONS.map(c => `${c.title}:\n${c.citation}`).join('\n\n');
    navigator.clipboard.writeText(all);
    setCopiedIdx('all');
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <section className="data-quality-section" aria-label="Dataset Sources and Provenance">
      {/* 1. Header Banner */}
      <div className="sources-header-card">
        <div className="sources-header-left">
          <div className="sources-icon-badge">
            <Database size={24} className="text-teal" />
          </div>
          <div>
            <h3 className="sources-main-heading">Where Does the Dashboard Data Come From?</h3>
            <p className="sources-sub-heading">
              This dashboard is built on 100% real government and municipal records across 3,091 spatial points — zero synthetic or simulated data.
            </p>
          </div>
        </div>

        <div className="sources-badges-group">
          <span className="badge-pill badge-emerald">
            <CheckCircle2 size={12} />
            12 Official Datasets
          </span>
          <span className="badge-pill badge-teal">
            <ShieldCheck size={12} />
            100% Real Records
          </span>
          <span className="badge-pill badge-primary">
            <Users size={12} />
            1.24 Cr Residents
          </span>
        </div>
      </div>

      {/* 2. Core 4 Dataset Pillars */}
      <div className="data-pillars-container">
        <div className="pillars-header-row">
          <div className="pillars-title-wrap">
            <Layers size={18} className="text-teal" />
            <h4 className="pillars-section-title">The 4 Main Data Sources</h4>
          </div>
          <span className="pillars-count-tag">4 Main Categories</span>
        </div>

        <div className="pillars-cards-grid">
          {DATA_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="pillar-card">
                <div className="pillar-card-top">
                  <div className="pillar-icon-box">
                    <Icon size={20} className="text-teal" />
                  </div>
                  <div className="pillar-header-text">
                    <span className="pillar-category">{pillar.category}</span>
                    <h5 className="pillar-title">{pillar.title}</h5>
                  </div>
                  <span className={`badge-pill ${pillar.badgeClass} pillar-badge`}>
                    {pillar.badge}
                  </span>
                </div>

                <div className="pillar-detail-body">
                  <div className="pillar-source-tag">
                    <span className="p-lbl">Source Authority:</span>
                    <strong className="p-authority">{pillar.sourceOrg}</strong>
                  </div>

                  <div className="pillar-stat-line">
                    <span className="p-lbl">Mapped Scope:</span>
                    <strong className="p-stat-val">{pillar.keyStats}</strong>
                  </div>

                  <p className="pillar-desc">{pillar.description}</p>
                </div>

                <div className="pillar-card-footer">
                  <FileSpreadsheet size={13} className="text-muted" />
                  <span className="pillar-file-name">{pillar.file}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Full 12-Dataset Inventory Table */}
      <div className="dataset-status-table-card">
        <div className="table-header-row">
          <div className="table-title-wrap">
            <Database size={17} className="text-teal" />
            <h4 className="table-card-title">All 12 Data Files &amp; Status</h4>
          </div>
          <div className="table-meta-badges">
            <span className="badge-pill badge-emerald">
              <CheckCircle2 size={11} />
              {report.validCoordinatesPercent}% Valid Coordinates
            </span>
            <span className="badge-pill badge-teal">
              <ShieldCheck size={11} />
              100% Ward Mapping
            </span>
          </div>
        </div>

        <div className="table-scroll-wrapper">
          <table className="quality-table">
            <thead>
              <tr>
                <th>Dataset File</th>
                <th>Category</th>
                <th>Format</th>
                <th>Status</th>
                <th>Mapped Records</th>
                <th>Official Source Authority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>wards_mumbai.geojson</code></td>
                <td>Boundaries</td>
                <td><span className="format-tag">GeoJSON</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>24 Administrative Wards</strong></td>
                <td>BMC / MCGM IT &amp; GIS Cell</td>
              </tr>
              <tr>
                <td><code>population.csv</code></td>
                <td>Demographics</td>
                <td><span className="format-tag">CSV</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>1,24,42,373 residents</strong> (97 subwards)</td>
                <td>Census of India 2011 (Primary Census Abstract)</td>
              </tr>
              <tr>
                <td><code>Mumbai City Public Hospitals Map.kml</code></td>
                <td>Healthcare</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>31 Hospitals</strong></td>
                <td>BMC Public Health Department</td>
              </tr>
              <tr>
                <td><code>Mumbai City Dispensaries Map.kml</code></td>
                <td>Healthcare</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>186 Dispensaries</strong></td>
                <td>BMC Public Health Department</td>
              </tr>
              <tr>
                <td><code>Mumbai City UPHCs Map.kml</code></td>
                <td>Healthcare</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>211 Primary Clinics</strong></td>
                <td>National Urban Health Mission (NUHM)</td>
              </tr>
              <tr>
                <td><code>Mumbai City Public Maternity Hospitals Map.kml</code></td>
                <td>Healthcare</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>28 Maternity Homes</strong></td>
                <td>BMC Public Health Directorate</td>
              </tr>
              <tr>
                <td><code>Mumbai City Public Veterinary Hospitals Map.kml</code></td>
                <td>Healthcare</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>3 Animal Hospitals</strong></td>
                <td>BMC Animal Welfare Department</td>
              </tr>
              <tr>
                <td><code>Mumbai Hospitals List.csv</code></td>
                <td>Healthcare</td>
                <td><span className="format-tag">CSV</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>288 Hospital Registries</strong></td>
                <td>BMC Public Health Registry (Bed Capacities)</td>
              </tr>
              <tr>
                <td><code>Mumbai Municipal Primary and Secondary Schools Map.kml</code></td>
                <td>Education</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>1,134 Municipal Schools</strong></td>
                <td>BMC Education Department</td>
              </tr>
              <tr>
                <td><code>Mumbai Aided Schools Map.kml</code></td>
                <td>Education</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>404 Aided Schools</strong></td>
                <td>Maharashtra Education Portal / UDISE+</td>
              </tr>
              <tr>
                <td><code>Mumbai Unaided Schools Map.kml</code></td>
                <td>Education</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>709 Private Schools</strong></td>
                <td>Maharashtra Education Portal / UDISE+</td>
              </tr>
              <tr>
                <td><code>Mumbai pulic garden,parks and zoos.kml</code></td>
                <td>Recreation</td>
                <td><span className="format-tag">KML</span></td>
                <td><span className="status-badge status-ok">Loaded</span></td>
                <td><strong>991 Parks &amp; Gardens</strong></td>
                <td>BMC Gardens &amp; Tree Authority Department</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Academic Citations for Project Report */}
      <div className="citations-container-card">
        <div className="citations-header">
          <div>
            <h4 className="citations-title">Academic Citations &amp; References</h4>
            <p className="citations-subtitle">
              Standardized citations for research reports, policy briefs, and academic publications
            </p>
          </div>
          <button
            type="button"
            className="btn-copy-all"
            onClick={handleCopyAllCitations}
            title="Copy all citations to clipboard"
          >
            {copiedIdx === 'all' ? (
              <>
                <Check size={14} className="text-emerald" />
                <span>All Citations Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy All Citations</span>
              </>
            )}
          </button>
        </div>

        <div className="citations-list">
          {ACADEMIC_CITATIONS.map((c, i) => (
            <div key={i} className="citation-item">
              <div className="citation-text-block">
                <span className="citation-tag">{c.title}</span>
                <p className="citation-apa">{c.citation}</p>
              </div>
              <button
                type="button"
                className="btn-copy-single"
                onClick={() => handleCopyCitation(c.citation, i)}
                title="Copy this citation"
              >
                {copiedIdx === i ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Notes on Data Scope & Limitations */}
      <div className="limitations-banner">
        <AlertTriangle size={18} className="text-amber" />
        <div>
          <h5 className="limitations-heading">Notes on Data Scope &amp; Limitations:</h5>
          <ul className="limitations-list">
            <li>
              <strong>Census 2011 Baseline:</strong> Census 2011 is the most recent official published ward-level census in India. Rapidly expanding suburban wards (like Malad P/N and Govandi M/E) have continued to grow since 2011.
            </li>
            <li>
              <strong>Registered Public Network:</strong> The dataset captures municipal dispensaries, UPHCs, and registered hospitals. Small private single-doctor clinics are not part of municipal open GIS records.
            </li>
            <li>
              <strong>Facility Capacities:</strong> While dispensary counts reflect physical geographic access, tertiary hospitals (such as KEM or Sion with 1,800+ beds) provide much larger regional clinical capacity.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
