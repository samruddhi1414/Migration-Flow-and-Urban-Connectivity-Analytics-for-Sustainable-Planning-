import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Briefcase, 
  Truck
} from 'lucide-react';

export default function Filters({
  filters,
  setFilters,
  districtsList,
  onReset
}) {
  const pressureCategories = ['All', 'Critical', 'Very High Pressure', 'High Pressure', 'Moderate Pressure', 'Adequate'];
  const sustainabilityCategories = ['All', 'High Sustainability', 'Moderate Sustainability', 'Low Sustainability / Urgent Action'];
  const migrationReasons = ['All', 'workEmployment', 'education', 'business', 'marriage', 'movedWithHousehold'];
  const migrationReasonLabels = {
    All: 'All Reasons',
    workEmployment: 'Work / Employment',
    education: 'Education',
    business: 'Business',
    marriage: 'Marriage',
    movedWithHousehold: 'Household Movement'
  };
  const infrastructureFocuses = ['All', 'road', 'publicBus', 'railway', 'water', 'health', 'digital'];
  const infrastructureLabels = {
    All: 'All Infrastructure',
    road: 'Road Connectivity',
    publicBus: 'Public Bus Transit',
    railway: 'Railway Network',
    water: 'Treated Water Supply',
    health: 'Healthcare Facilities',
    digital: 'Digital & CSC Network'
  };

  return (
    <div className="mb-6 p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg border border-sky-200">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0e304f]">Interactive Analytical Filters</h3>
            <p className="text-[11px] text-slate-500">Dynamically slice and filter all 36 districts across maps, charts, and priority matrices</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* District Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            District Focus
          </label>
          <select
            value={filters.selectedDistrict}
            onChange={(e) => setFilters(prev => ({ ...prev, selectedDistrict: e.target.value }))}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="All">All Maharashtra Districts (36)</option>
            {districtsList.map(d => (
              <option key={d.districtCode} value={d.districtCode}>
                {d.districtName} (Score: {d.indices?.pressureScore})
              </option>
            ))}
          </select>
        </div>

        {/* Demographic Split */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Demographic Scope
          </label>
          <select
            value={filters.demographicScope}
            onChange={(e) => setFilters(prev => ({ ...prev, demographicScope: e.target.value }))}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="Total">Total (Urban + Rural)</option>
            <option value="Rural">Rural Dominant (&gt;50% Rural)</option>
            <option value="Urban">Urbanized (&gt;50% Urban)</option>
          </select>
        </div>

        {/* Pressure Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Pressure Category
          </label>
          <select
            value={filters.pressureCategory}
            onChange={(e) => setFilters(prev => ({ ...prev, pressureCategory: e.target.value }))}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {pressureCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sustainability Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Sustainability
          </label>
          <select
            value={filters.sustainabilityCategory}
            onChange={(e) => setFilters(prev => ({ ...prev, sustainabilityCategory: e.target.value }))}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {sustainabilityCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Migration Reason */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Migration Reason
          </label>
          <select
            value={filters.migrationReason}
            onChange={(e) => setFilters(prev => ({ ...prev, migrationReason: e.target.value }))}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {migrationReasons.map(r => (
              <option key={r} value={r}>{migrationReasonLabels[r]}</option>
            ))}
          </select>
        </div>

        {/* Infrastructure Focus */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Infrastructure Type
          </label>
          <select
            value={filters.infrastructureFocus}
            onChange={(e) => setFilters(prev => ({ ...prev, infrastructureFocus: e.target.value }))}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {infrastructureFocuses.map(inf => (
              <option key={inf} value={inf}>{infrastructureLabels[inf]}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
