import React, { useState } from 'react';
import { 
  Table, 
  ArrowUpDown, 
  Search, 
  Sparkles, 
  SlidersHorizontal,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatPercent } from '../utils/dataCleaner';

export default function InfrastructureCoverage({
  districts,
  selectedDistrict,
  onSelectDistrict
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('districtName');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const columns = [
    { key: 'districtName', label: 'District', isString: true },
    { key: 'allWeatherRoad', label: 'All-Weather Road', path: ['transport', 'allWeatherRoadPct'] },
    { key: 'publicBus', label: 'Public Bus', path: ['transport', 'publicBusPct'] },
    { key: 'railway', label: 'Railway Access', path: ['transport', 'railwayPct'] },
    { key: 'treatedWater', label: 'Treated Water', path: ['services', 'treatedWaterPct'] },
    { key: 'healthFacility', label: 'Health Facility', path: ['services', 'healthFacilityPct'] },
    { key: 'primarySchool', label: 'Primary School', path: ['services', 'primarySchoolPct'] },
    { key: 'mobileCoverage', label: 'Mobile Coverage', path: ['services', 'mobileCoveragePct'] },
    { key: 'internetCsc', label: 'Internet / CSC', path: ['services', 'internetCscPct'] },
    { key: 'bank', label: 'Banking Access', path: ['services', 'bankPct'] },
    { key: 'market', label: 'Regular Market', path: ['services', 'marketPct'] },
  ];

  const getValue = (district, col) => {
    if (col.isString) return district[col.key] || '';
    if (col.path) {
      return district[col.path[0]]?.[col.path[1]] || 0;
    }
    return 0;
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Color helper for heatmap matrix cells
  const getCellBg = (val) => {
    if (val >= 85) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (val >= 65) return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    if (val >= 45) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    if (val >= 30) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  // Filter & Sort
  const filteredDistricts = districts.filter(d => 
    d.districtName.toLowerCase().includes(search.toLowerCase()) ||
    d.districtCode.includes(search)
  );

  const sortedDistricts = [...filteredDistricts].sort((a, b) => {
    const col = columns.find(c => c.key === sortKey) || columns[0];
    const valA = getValue(a, col);
    const valB = getValue(b, col);
    if (col.isString) {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden mb-6 p-5">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
              <Table className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Essential Infrastructure Coverage Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive district-level heatmap comparing 10 essential infrastructure availability indicators (% village & town coverage)
          </p>
        </div>

        {/* Search & Heatmap Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">&lt;30%</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">30-45%</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">45-65%</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">65-85%</span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">&gt;85%</span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
              <th className="p-3 font-semibold sticky left-0 bg-slate-950 z-10 w-44">
                <button 
                  onClick={() => handleSort('districtName')}
                  className="flex items-center gap-1 hover:text-white"
                >
                  <span>District Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              {columns.slice(1).map(col => (
                <th key={col.key} className="p-2.5 font-semibold text-center whitespace-nowrap">
                  <button 
                    onClick={() => handleSort(col.key)}
                    className="flex items-center justify-center gap-1 hover:text-white mx-auto"
                  >
                    <span>{col.label}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {sortedDistricts.map((district) => {
              const isSelected = selectedDistrict && selectedDistrict.districtCode === district.districtCode;
              return (
                <tr 
                  key={district.districtCode}
                  onClick={() => onSelectDistrict(district)}
                  className={`hover:bg-slate-800/70 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-950/50 ring-1 ring-blue-500' : ''
                  }`}
                >
                  <td className="p-2.5 font-sans font-medium text-white sticky left-0 bg-slate-900/95 z-10 flex items-center justify-between">
                    <span>{district.districtName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">#{district.districtCode}</span>
                  </td>

                  {columns.slice(1).map(col => {
                    const val = getValue(district, col);
                    return (
                      <td key={col.key} className="p-2 text-center">
                        <div className={`px-2 py-1 rounded text-[11px] font-semibold border ${getCellBg(val)}`}>
                          {val.toFixed(1)}%
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

      <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Showing {sortedDistricts.length} Maharashtra districts. Click any row to view full district profile.</span>
        <span className="text-slate-500">Source: Census DCHB 2700 Village & Town Modules</span>
      </div>

    </div>
  );
}
