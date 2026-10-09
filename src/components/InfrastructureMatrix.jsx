import React, { useState } from 'react';
import { 
  Table, 
  ArrowUpDown, 
  Search, 
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { formatPercent } from '../utils/dataCleaner';

export default function InfrastructureMatrix({
  districts,
  selectedDistrict,
  onSelectDistrict
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('districtName');
  const [sortOrder, setSortOrder] = useState('asc');

  const columns = [
    { key: 'districtName', label: 'District', isString: true },
    { key: 'publicBusCoverage', label: 'Public Bus' },
    { key: 'railwayCoverage', label: 'Railway Access' },
    { key: 'allWeatherRoadCoverage', label: 'All-Weather Road' },
    { key: 'puccaRoadCoverage', label: 'Pucca Road' },
    { key: 'treatedWaterCoverage', label: 'Treated Water' },
    { key: 'yearRoundWaterCoverage', label: 'Year-Round Water' },
    { key: 'sanitationCoverage', label: 'Sanitation (TSC)' },
    { key: 'drainageCoverage', label: 'Covered Drainage' },
    { key: 'wasteManagementCoverage', label: 'Waste Disposal' },
    { key: 'healthFacilityCoverage', label: 'Health Facility' },
    { key: 'schoolCoverage', label: 'Primary School' },
    { key: 'mobileCoverage', label: 'Mobile Network' },
    { key: 'internetCoverage', label: 'Internet / CSC' },
    { key: 'bankCoverage', label: 'Banking Access' },
    { key: 'marketCoverage', label: 'Regular Market' },
  ];

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Color helper for matrix cells
  const getCellBg = (val) => {
    if (val >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (val >= 65) return 'bg-teal-50 text-teal-800 border-teal-200';
    if (val >= 45) return 'bg-sky-50 text-sky-800 border-sky-200';
    if (val >= 30) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  const filteredDistricts = districts.filter(d => 
    d.districtName.toLowerCase().includes(search.toLowerCase()) ||
    d.districtCode.includes(search)
  );

  const sortedDistricts = [...filteredDistricts].sort((a, b) => {
    const col = columns.find(c => c.key === sortKey) || columns[0];
    const valA = a[col.key] || 0;
    const valB = b[col.key] || 0;
    if (col.isString) {
      return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    }
    return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-6">
      
      {/* Evidence Tag & Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            EVIDENCE 05
          </div>
          <h2 className="text-xl font-bold text-[#0e304f] tracking-tight">
            Essential Civic & Transport Coverage Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            District percentage availability across 15 essential village & town infrastructure indicators
          </p>
        </div>

        {/* Search & Heatmap Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">&lt;30%</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">30-45%</span>
            <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">45-65%</span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">65-85%</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">&gt;85%</span>
          </div>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <th className="p-3 font-bold sticky left-0 bg-slate-50 z-10 w-44">
                <button 
                  onClick={() => handleSort('districtName')}
                  className="flex items-center gap-1 hover:text-[#0e304f]"
                >
                  <span>District Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              {columns.slice(1).map(col => (
                <th key={col.key} className="p-2.5 font-bold text-center whitespace-nowrap">
                  <button 
                    onClick={() => handleSort(col.key)}
                    className="flex items-center justify-center gap-1 hover:text-[#0e304f] mx-auto"
                  >
                    <span>{col.label}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {sortedDistricts.map((district) => {
              const isSelected = selectedDistrict && selectedDistrict.districtCode === district.districtCode;
              return (
                <tr 
                  key={district.districtCode}
                  onClick={() => onSelectDistrict(district)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-sky-50 ring-1 ring-sky-500' : ''
                  }`}
                >
                  <td className="p-2.5 font-sans font-semibold text-slate-800 sticky left-0 bg-white z-10 flex items-center justify-between">
                    <span>{district.districtName}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">#{district.districtCode}</span>
                  </td>

                  {columns.slice(1).map(col => {
                    const val = district[col.key] !== undefined ? district[col.key] : 0;
                    return (
                      <td key={col.key} className="p-2 text-center">
                        <div className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getCellBg(val)}`}>
                          {Number(val).toFixed(1)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Callout Box matching the reference theme */}
      <div className="mt-4 callout-box">
        <div className="text-xs font-bold text-[#0e7490] uppercase tracking-wider mb-0.5">
          Coverage Matrix Finding
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Primary school and mobile connectivity show high uniform coverage across all districts (&gt;90%), whereas covered pucca drainage and treated year-round tap water exhibit the highest spatial inequality, falling below 25% in several rural tribal districts like Gadchiroli and Nandurbar.
        </p>
      </div>

    </div>
  );
}
