import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Flame
} from 'lucide-react';

export default function WardScorecardTable({
  wardRows = [],
  cityBenchmarks,
  selectedWardCode,
  onSelectWard
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [sortField, setSortField] = useState('population');
  const [sortAsc, setSortAsc] = useState(false);

  const zones = ['ALL', 'Island City', 'Western Suburbs', 'Eastern Suburbs'];

  // Handle sort column click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...wardRows];

    // Filter by Zone
    if (zoneFilter !== 'ALL') {
      result = result.filter(w => w.zone === zoneFilter);
    }

    // Filter by Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(w => 
        w.wardCode.toLowerCase().includes(q) ||
        w.displayName.toLowerCase().includes(q) ||
        (w.localities && w.localities.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let vA = a[sortField];
      let vB = b[sortField];
      if (typeof vA === 'string') {
        return sortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      return sortAsc ? (vA || 0) - (vB || 0) : (vB || 0) - (vA || 0);
    });

    return result;
  }, [wardRows, zoneFilter, searchTerm, sortField, sortAsc]);

  const getStatusBadge = (ward) => {
    const healthRate = ward.healthcarePer10k;
    const schoolRate = ward.schoolsPer10k;
    const avgH = cityBenchmarks?.cityHealthPer10k || 0.37;
    const avgS = cityBenchmarks?.citySchoolsPer10k || 1.81;

    if (healthRate < (avgH * 0.6) || schoolRate < (avgS * 0.6)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <Flame className="w-3 h-3 text-rose-500" />
          <span>High Shortage</span>
        </span>
      );
    }
    if (healthRate < avgH || schoolRate < avgS) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Below Average</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Good Access</span>
      </span>
    );
  };

  return (
    <div className="ward-scorecard-card border border-slate-200 bg-white rounded-2xl p-6 shadow-sm text-slate-800">
      {/* Title & Description */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-teal-600" />
            <span>All 24 Wards Scorecard</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Click any ward or column to compare population, clinics, schools, and status across Mumbai.
          </p>
        </div>

        {/* Zone Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {zones.map(z => (
            <button
              key={z}
              type="button"
              onClick={() => setZoneFilter(z)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                zoneFilter === z
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {z === 'ALL' ? 'All Zones' : z}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by ward code (e.g. A, P/N, M/E) or locality name (e.g. Bandra, Malad, Colaba)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-500/20 transition-all"
        />
      </div>

      {/* Interactive Light Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold select-none">
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('wardCode')}>
                <div className="flex items-center gap-1">
                  <span>Ward</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('displayName')}>
                <div className="flex items-center gap-1">
                  <span>Name &amp; Localities</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900" onClick={() => handleSort('zone')}>
                <div className="flex items-center gap-1">
                  <span>Zone</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right" onClick={() => handleSort('population')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Population</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right" onClick={() => handleSort('healthcareCount')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Clinics</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right" onClick={() => handleSort('healthcarePer10k')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Clinics / 10k</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right" onClick={() => handleSort('schoolsCount')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Schools</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right" onClick={() => handleSort('schoolsPer10k')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Schools / 10k</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-slate-900 text-right" onClick={() => handleSort('nearestHealthMeters')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Walk Dist</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSorted.map((w) => {
              const isSelected = selectedWardCode === w.wardCode;
              return (
                <tr
                  key={w.wardCode}
                  onClick={() => onSelectWard(w.wardCode)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected 
                      ? 'bg-teal-50/80 text-slate-900 font-medium' 
                      : 'hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs ${
                      isSelected ? 'bg-teal-700 text-white shadow-sm' : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {w.wardCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{w.displayName}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{w.localities}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-slate-500 text-[11px]">{w.zone}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                    {w.population.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-teal-700">
                    {w.healthcareCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-teal-800">
                    {w.healthcarePer10k}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                    {w.schoolsCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                    {w.schoolsPer10k}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {w.nearestHealthMeters ? `${w.nearestHealthMeters}m` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {getStatusBadge(w)}
                  </td>
                  <td className="py-2.5 px-2 text-slate-400 group-hover:text-teal-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
        <span>Showing {filteredAndSorted.length} of {wardRows.length} wards</span>
        <span>Click any row to open the complete ward deep dive profile</span>
      </div>
    </div>
  );
}
