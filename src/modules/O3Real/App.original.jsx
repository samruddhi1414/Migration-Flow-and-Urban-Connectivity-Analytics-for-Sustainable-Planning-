import React, { useState, useEffect, useMemo, useRef } from 'react';
import { loadAllDashboardData } from './utils/dataLoader';
import { aggregateWardMetrics, generateInsights } from './utils/dataProcessor';
import { exportWardSummaryCSV } from './utils/exportUtils';

import DashboardHeader from './components/DashboardHeader';
import FilterPanel from './components/FilterPanel';
import KPICards from './components/KPICards';
import MumbaiMap from './components/MumbaiMap';
import ServiceAvailabilityChart from './components/ServiceAvailabilityChart';
import ServiceAvailabilityPer10kChart from './components/ServiceAvailabilityPer10kChart';
import ZoneComparisonChart from './components/ZoneComparisonChart';
import ServiceCompositionChart from './components/ServiceCompositionChart';
import WardGapRanking from './components/WardGapRanking';
import GeographicAccessibilityPanel from './components/GeographicAccessibilityPanel';
import InsightsPanel from './components/InsightsPanel';
import DataQualityPanel from './components/DataQualityPanel';
import Methodology from './components/Methodology';

import {
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Map as MapIcon,
  BarChart2,
  AlertTriangle,
  Target,
  FileText,
  Download,
  Sparkles,
  Info
} from 'lucide-react';
import './App.css';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Active Tab: 'overview' | 'map' | 'comparison' | 'gaps' | 'recommendations' | 'sources'
  const [activeTab, setActiveTab] = useState('overview');

  // Filters State
  const [filters, setFilters] = useState({
    serviceCategory: 'All',
    selectedWard: 'ALL',
    mapMetric: 'healthcarePer10k',
    schoolCategory: 'All',
    searchQuery: ''
  });

  // Load all 12 datasets on initial mount
  useEffect(() => {
    let isMounted = true;
    loadAllDashboardData()
      .then((data) => {
        if (isMounted) {
          setDashboardData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
        if (isMounted) {
          setError(err.message || 'Error initializing spatial datasets');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Process and aggregate all ward metrics
  const processed = useMemo(() => {
    if (!dashboardData) return null;
    return aggregateWardMetrics(dashboardData);
  }, [dashboardData]);

  // Generate dynamic data insights
  const { insights, priorities } = useMemo(() => {
    if (!processed) return { insights: [], priorities: [] };
    return generateInsights(processed.wardRows, processed.cityBenchmarks);
  }, [processed]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      serviceCategory: 'All',
      selectedWard: 'ALL',
      mapMetric: 'healthcarePer10k',
      schoolCategory: 'All',
      searchQuery: ''
    });
  };

  const handleSelectWard = (wardCode) => {
    setFilters(prev => ({
      ...prev,
      selectedWard: prev.selectedWard === wardCode ? 'ALL' : wardCode
    }));
  };

  // Filter facilities based on category choices
  const filteredFacilities = useMemo(() => {
    if (!processed) return { healthcare: [], schools: [], parks: [] };

    let health = processed.facilitiesMap?.allHealthcare || [];
    let sch = processed.facilitiesMap?.allSchools || [];
    let prk = processed.facilitiesMap?.allParks || [];

    if (filters.schoolCategory !== 'All') {
      sch = sch.filter(s => s.subcategory === filters.schoolCategory);
    }

    if (filters.serviceCategory === 'Healthcare') {
      sch = [];
      prk = [];
    } else if (filters.serviceCategory === 'Schools') {
      health = [];
      prk = [];
    } else if (filters.serviceCategory === 'Parks') {
      health = [];
      sch = [];
    }

    return { healthcare: health, schools: sch, parks: prk };
  }, [processed, filters.serviceCategory, filters.schoolCategory]);

  // Search and ward filtered rows
  const filteredWardRows = useMemo(() => {
    if (!processed) return [];
    let rows = processed.wardRows;

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      rows = rows.filter(w =>
        w.wardCode.toLowerCase().includes(q) ||
        w.displayName.toLowerCase().includes(q) ||
        w.localities.toLowerCase().includes(q) ||
        w.zone.toLowerCase().includes(q)
      );
    }

    return rows;
  }, [processed, filters.searchQuery]);

  const selectedWardRow = useMemo(() => {
    if (filters.selectedWard === 'ALL' || !processed) return null;
    return processed.wardRows.find(w => w.wardCode === filters.selectedWard) || null;
  }, [processed, filters.selectedWard]);

  // CSV Export action
  const handleExportCSV = () => {
    if (!processed) return;
    const rowsToExport = filters.selectedWard !== 'ALL'
      ? processed.wardRows.filter(w => w.wardCode === filters.selectedWard)
      : filteredWardRows;

    const dateStr = new Date().toISOString().slice(0, 10);
    exportWardSummaryCSV(rowsToExport, `mumbai_urban_accessibility_summary_${dateStr}.csv`);
  };

  // Scroll to top when changing tabs
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Map Studio', icon: MapIcon },
    { id: 'comparison', label: 'Ward Comparison', icon: BarChart2 },
    { id: 'gaps', label: 'Service Gaps', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'sources', label: 'Data & Sources', icon: FileText }
  ];

  return (
    <div className="dashboard-app-root">
      <main className="dashboard-content-wrapper">
        {/* Header */}
        <DashboardHeader />

        {/* Global Loading Spinner */}
        {loading && (
          <div className="dashboard-loading-overlay">
            <Loader2 size={36} className="spinner-icon text-teal" />
            <h3>Loading Mumbai Datasets...</h3>
            <p>Ingesting Census 2011 population records, 24 ward boundaries, and school &amp; healthcare locations</p>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="dashboard-error-banner">
            <AlertCircle size={22} className="error-icon" />
            <div>
              <h4>Unable to Load Datasets</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loaded Main Dashboard */}
        {!loading && !error && processed && (
          <>
            {/* Sticky Modern Tab Bar */}
            <nav className="studio-tabs-bar" aria-label="Studio navigation tabs">
              <div className="tabs-container">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`studio-tab-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleTabChange(t.id)}
                    >
                      <Icon size={16} className="tab-icon" />
                      <span className="tab-label">{t.label}</span>
                      {isActive && <span className="tab-active-indicator" />}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <section className="tab-page-container fade-in">
                <div className="tab-hero-intro">
                  <div className="intro-text-block">
                    <h2 className="tab-page-title">City-Wide Urban Overview</h2>
                    <p className="tab-page-subtitle">
                      Essential summary metrics across Mumbai's 24 administrative municipal wards covering ~1.24 Crore residents.
                    </p>
                  </div>
                </div>

                {/* KPI Cards */}
                <KPICards
                  benchmarks={processed.cityBenchmarks}
                  selectedWardRow={selectedWardRow}
                  selectedWardCode={filters.selectedWard}
                />

                {/* Filter Controls */}
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  totalResults={filteredWardRows.length}
                />

                {/* Executive Summary Card */}
                <div className="overview-summary-card">
                  <div className="summary-left-col">
                    <h3 className="summary-card-heading">Executive Summary</h3>
                    <p className="summary-card-p">
                      This project evaluates the spatial distribution of <strong>459 healthcare facilities</strong> (hospitals, dispensaries, and primary clinics) and <strong>2,247 schools</strong> (municipal, private, and aided) across Brihanmumbai Municipal Corporation (BMC).
                    </p>
                    <p className="summary-card-p">
                      While older South Mumbai wards enjoy compact access and higher per-person availability, large rapidly-expanding suburban wards like <strong>Ward P/N (Malad)</strong> and <strong>Ward M/E (Govandi)</strong> face severe pressure, with municipal infrastructure lagging behind residential population growth.
                    </p>
                  </div>

                  <div className="summary-right-col">
                    <div className="summary-stat-box">
                      <span className="s-stat-lbl">Average Healthcare Availability</span>
                      <strong className="s-stat-val text-rose">{processed.cityBenchmarks.cityHealthPer10k} per 10k</strong>
                      <span className="s-stat-sub">~1 clinic per 27,000 residents</span>
                    </div>

                    <div className="summary-stat-box">
                      <span className="s-stat-lbl">Average School Availability</span>
                      <strong className="s-stat-val text-emerald">{processed.cityBenchmarks.citySchoolsPer10k} per 10k</strong>
                      <span className="s-stat-sub">~1 school per 5,500 residents</span>
                    </div>
                  </div>
                </div>

              </section>
            )}

            {/* TAB 2: MAP STUDIO */}
            {activeTab === 'map' && (
              <section className="tab-page-container fade-in">
                <div className="tab-hero-intro">
                  <div className="intro-text-block">
                    <h2 className="tab-page-title">Interactive Mumbai GIS Map Studio</h2>
                    <p className="tab-page-subtitle">
                      Visualize the geographic distribution of facilities across Mumbai's 24 wards. Click any ward to inspect its local figures.
                    </p>
                  </div>
                </div>

                {/* Map Component */}
                <MumbaiMap
                  geojson={dashboardData.geojson}
                  wardRows={processed.wardRows}
                  allHealthcare={filteredFacilities.healthcare}
                  allSchools={filteredFacilities.schools}
                  allParks={filteredFacilities.parks}
                  selectedWardCode={filters.selectedWard}
                  onSelectWard={handleSelectWard}
                  mapMetric={filters.mapMetric}
                  onMetricChange={(val) => handleFilterChange('mapMetric', val)}
                />

              </section>
            )}

            {/* TAB 3: WARD COMPARISON */}
            {activeTab === 'comparison' && (
              <section className="tab-page-container fade-in">
                <div className="tab-hero-intro">
                  <div className="intro-text-block">
                    <h2 className="tab-page-title">Ward-by-Ward Comparison</h2>
                    <p className="tab-page-subtitle">
                      Compare facility counts, population-adjusted ratios (per 10,000 residents), supply vs demand, and facility types.
                    </p>
                  </div>
                </div>

                <div className="visualizations-grid">
                  <div className="charts-row-split">
                    <ServiceAvailabilityChart
                      wardRows={filteredWardRows}
                      selectedWardCode={filters.selectedWard}
                      onSelectWard={handleSelectWard}
                    />

                    <ServiceAvailabilityPer10kChart
                      wardRows={filteredWardRows}
                      cityBenchmarks={processed.cityBenchmarks}
                      selectedWardCode={filters.selectedWard}
                      onSelectWard={handleSelectWard}
                    />
                  </div>

                  <div className="charts-row-split">
                    <ZoneComparisonChart
                      wardRows={filteredWardRows}
                    />

                    <ServiceCompositionChart
                      healthComposition={processed.healthComposition}
                      schoolComposition={processed.schoolComposition}
                    />
                  </div>
                </div>

              </section>
            )}

            {/* TAB 4: SERVICE GAPS */}
            {activeTab === 'gaps' && (
              <section className="tab-page-container fade-in">
                <div className="tab-hero-intro">
                  <div className="intro-text-block">
                    <h2 className="tab-page-title">Service Gaps &amp; Walking Distance</h2>
                    <p className="tab-page-subtitle">
                      Pinpoint areas with the lowest access per person and see how far residents have to walk to reach essential centers.
                    </p>
                  </div>
                </div>

                <div className="visualizations-grid">
                  <div className="charts-row-full">
                    <WardGapRanking
                      wardRows={filteredWardRows}
                      cityBenchmarks={processed.cityBenchmarks}
                      selectedWardCode={filters.selectedWard}
                      onSelectWard={handleSelectWard}
                    />
                  </div>
                </div>

                {/* Geographic Proximity & Walking Distances */}
                <GeographicAccessibilityPanel
                  wardRows={processed.wardRows}
                  allHealthcare={dashboardData.healthcare?.facilities}
                  allSchools={dashboardData.schools?.facilities}
                  selectedWardCode={filters.selectedWard}
                />

              </section>
            )}

            {/* TAB 5: RECOMMENDATIONS */}
            {activeTab === 'recommendations' && (
              <section className="tab-page-container fade-in">
                <div className="tab-hero-intro">
                  <div className="intro-text-block">
                    <h2 className="tab-page-title">Key Findings &amp; Planning Priorities</h2>
                    <p className="tab-page-subtitle">
                      Data-backed takeaways and actionable recommendations for municipal decision makers and urban planners.
                    </p>
                  </div>
                </div>

                <InsightsPanel
                  insights={insights}
                  priorities={priorities}
                />

              </section>
            )}

            {/* TAB 6: DATA & SOURCES */}
            {activeTab === 'sources' && (
              <section className="tab-page-container fade-in">
                <div className="tab-hero-intro">
                  <div className="intro-text-block">
                    <h2 className="tab-page-title">Dataset Sources, Provenance &amp; Methodology</h2>
                    <p className="tab-page-subtitle">
                      Official government sources, data architecture summary, core dataset pillars, and academic citations.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-header btn-primary"
                    onClick={handleExportCSV}
                    title="Download the full 24-ward summary table as CSV"
                  >
                    <Download size={15} />
                    <span>Export Ward Summary CSV</span>
                  </button>
                </div>

                {/* Data Quality Audit */}
                <DataQualityPanel
                  dataQualityReport={dashboardData.dataQualityReport}
                  healthcareSources={dashboardData.healthcare?.loadedSources}
                  schoolSources={dashboardData.schools?.loadedSources}
                />

                {/* Methodology */}
                <Methodology />

              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
