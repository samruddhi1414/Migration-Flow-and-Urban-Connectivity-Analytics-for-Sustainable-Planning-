import React from 'react';
import { RotateCcw, Search, Layers, SlidersHorizontal } from 'lucide-react';
import { CANONICAL_WARDS, WARD_METADATA } from '../utils/wardMatcher';

export default function FilterPanel({
  filters,
  onFilterChange,
  onResetFilters
}) {
  const {
    serviceCategory,
    selectedWard,
    mapMetric,
    schoolCategory,
    searchQuery
  } = filters;

  const showSchoolCategory = serviceCategory === 'All' || serviceCategory === 'Schools';

  const handleSearchChange = (e) => {
    const val = e.target.value;
    onFilterChange('searchQuery', val);
    const trimmed = val.trim().toUpperCase();
    if (CANONICAL_WARDS.includes(trimmed)) {
      onFilterChange('selectedWard', trimmed);
    }
  };

  return (
    <section className="filter-panel-card" aria-label="Dashboard Filters">
      <div className="filter-header-bar">
        <div className="filter-title-wrap">
          <SlidersHorizontal size={17} className="text-teal" />
          <span className="filter-title">Filter Data</span>
          <span className="filter-count-badge">
            {selectedWard !== 'ALL' ? `Ward ${selectedWard} Selected` : 'Viewing All 24 Wards'}
          </span>
        </div>

        <button
          type="button"
          className="btn-reset-filters"
          onClick={onResetFilters}
          title="Reset all filters to default"
        >
          <RotateCcw size={13} />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="filter-controls-grid">
        {/* Search by Ward or Locality */}
        <div className="filter-group">
          <label htmlFor="filter-search" className="filter-label">
            <Search size={13} className="filter-icon" />
            Search Ward or Area
          </label>
          <div className="search-input-wrapper">
            <input
              id="filter-search"
              type="text"
              className="filter-input"
              placeholder="e.g. Bandra, Andheri, Malad, Colaba..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => onFilterChange('searchQuery', '')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Ward Selector */}
        <div className="filter-group">
          <label htmlFor="filter-ward" className="filter-label">
            Choose a Ward
          </label>
          <select
            id="filter-ward"
            className="filter-select"
            value={selectedWard}
            onChange={(e) => onFilterChange('selectedWard', e.target.value)}
          >
            <option value="ALL">All 24 Municipal Wards</option>
            <optgroup label="South Mumbai (Island City)">
              {['A', 'B', 'C', 'D', 'E', 'F/N', 'F/S', 'G/N', 'G/S'].map(w => (
                <option key={w} value={w}>
                  Ward {w} ({WARD_METADATA[w]?.localities.split(',')[0]})
                </option>
              ))}
            </optgroup>
            <optgroup label="Western Suburbs">
              {['H/E', 'H/W', 'K/E', 'K/W', 'P/S', 'P/N', 'R/S', 'R/C', 'R/N'].map(w => (
                <option key={w} value={w}>
                  Ward {w} ({WARD_METADATA[w]?.localities.split(',')[0]})
                </option>
              ))}
            </optgroup>
            <optgroup label="Eastern Suburbs">
              {['L', 'M/E', 'M/W', 'N', 'S', 'T'].map(w => (
                <option key={w} value={w}>
                  Ward {w} ({WARD_METADATA[w]?.localities.split(',')[0]})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Service Category */}
        <div className="filter-group">
          <label htmlFor="filter-service" className="filter-label">
            Service Type
          </label>
          <select
            id="filter-service"
            className="filter-select"
            value={serviceCategory}
            onChange={(e) => onFilterChange('serviceCategory', e.target.value)}
          >
            <option value="All">All Services (Healthcare &amp; Schools)</option>
            <option value="Healthcare">Healthcare Facilities Only</option>
            <option value="Schools">Schools Only</option>
            <option value="Parks">Public Parks &amp; Gardens</option>
          </select>
        </div>

        {/* Map Choropleth Metric Selector */}
        <div className="filter-group">
          <label htmlFor="filter-metric" className="filter-label">
            <Layers size={13} className="filter-icon" />
            Color Map By
          </label>
          <select
            id="filter-metric"
            className="filter-select"
            value={mapMetric}
            onChange={(e) => onFilterChange('mapMetric', e.target.value)}
          >
            <option value="healthcarePer10k">Clinics per 10,000 People</option>
            <option value="schoolsPer10k">Schools per 10,000 People</option>
            <option value="population">Total Population</option>
            <option value="density">Population Density (People / sq km)</option>
            <option value="healthcareCount">Total Healthcare Facilities</option>
            <option value="schoolsCount">Total Schools</option>
            <option value="parksCount">Total Parks &amp; Gardens</option>
          </select>
        </div>

        {/* School Category (Conditional) */}
        {showSchoolCategory && (
          <div className="filter-group">
            <label htmlFor="filter-school-category" className="filter-label">
              School Type
            </label>
            <select
              id="filter-school-category"
              className="filter-select"
              value={schoolCategory}
              onChange={(e) => onFilterChange('schoolCategory', e.target.value)}
            >
              <option value="All">All School Types</option>
              <option value="Municipal">Municipal Schools (BMC Public)</option>
              <option value="Aided">Government-Aided Schools</option>
              <option value="Unaided">Private Unaided Schools</option>
            </select>
          </div>
        )}
      </div>
    </section>
  );
}
