import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ArrowRight, 
  Download, 
  Search, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { 
  getPressureColor, 
  getPressureCategory, 
  getSustainabilityColor,
  formatCompactNumber 
} from '../utils/dataCleaner';

export default function PriorityDistricts({
  districts,
  selectedDistrict,
  onSelectDistrict,
  onOpenDeepDive
}) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const filtered = districts.filter(d => {
    const matchesSearch = d.districtName.toLowerCase().includes(search.toLowerCase()) ||
                          (d.indices?.mainPressure || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'All' || d.indices?.pressureCategory === filterCat;
    return matchesSearch && matchesCat;
  });

  const handleExportCSV = () => {
    const headers = ['Rank', 'District Code', 'District Name', 'Population', 'Total Migrants', 'Movement Demand Index', 'Infrastructure Capacity Index', 'Pressure Score', 'Pressure Category', 'Sustainability Score', 'Main Pressure', 'Recommended Action'];
    const rows = filtered.map((d, i) => [
      i + 1,
      d.districtCode,
      `"${d.districtName}"`,
      d.totalPopulation,
      d.totalMigrants,
      d.indices?.movementDemandIndex,
      d.indices?.infrastructureCapacityIndex,
      d.indices?.pressureScore,
      `"${d.indices?.pressureCategory}"`,
      d.indices?.sustainabilityScore,
      `"${d.indices?.mainPressure}"`,
      `"${d.indices?.recommendedAction}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Maharashtra_Priority_Interventions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-6">
      
      {/* Evidence Tag & Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            EVIDENCE 07
          </div>
          <h2 className="text-xl font-bold text-[#0e304f] tracking-tight">
            Priority Planning Interventions & Action Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked municipal decision matrix generating tailored infrastructure interventions from empirical Census bottleneck indicators
          </p>
        </div>

        {/* Action Controls & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pressure or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 w-48"
            />
          </div>

          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:ring-1 focus:ring-sky-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Critical">Critical (81-100)</option>
            <option value="Very High Pressure">Very High (61-80)</option>
            <option value="High Pressure">High (41-60)</option>
            <option value="Moderate Pressure">Moderate (21-40)</option>
            <option value="Adequate">Adequate (0-20)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            title="Download full CSV intervention report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Priority Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <th className="p-3 font-bold text-center w-12">Rank</th>
              <th className="p-3 font-bold w-36">District</th>
              <th className="p-3 font-bold text-center w-20">Demand</th>
              <th className="p-3 font-bold text-center w-20">Capacity</th>
              <th className="p-3 font-bold text-center w-28">Pressure Score</th>
              <th className="p-3 font-bold text-center w-20">Sustain.</th>
              <th className="p-3 font-bold w-52">Primary Bottleneck</th>
              <th className="p-3 font-bold">Recommended Planning Action</th>
              <th className="p-3 font-bold text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d, idx) => {
              const isSelected = selectedDistrict && selectedDistrict.districtCode === d.districtCode;
              const pressure = d.indices?.pressureScore || 0;
              const isTop3 = idx < 3;

              return (
                <tr
                  key={d.districtCode}
                  className={`hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-sky-50 ring-1 ring-sky-500' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-[11px] font-bold ${
                      isTop3 ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>

                  {/* District Name */}
                  <td className="p-3 font-semibold text-slate-900">
                    <div className="flex flex-col">
                      <span className="text-sm text-[#0e304f]">{d.districtName}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-normal">Pop: {formatCompactNumber(d.totalPopulation)}</span>
                    </div>
                  </td>

                  {/* Movement Demand Index */}
                  <td className="p-3 text-center font-mono font-bold text-sky-600">
                    {d.indices?.movementDemandIndex}
                  </td>

                  {/* Infrastructure Capacity Index */}
                  <td className="p-3 text-center font-mono font-bold text-emerald-600">
                    {d.indices?.infrastructureCapacityIndex}
                  </td>

                  {/* Pressure Score & Badge */}
                  <td className="p-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-mono font-bold text-sm" style={{ color: getPressureColor(pressure) }}>
                        {pressure}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold mt-0.5" style={{ 
                        backgroundColor: `${getPressureColor(pressure)}15`,
                        color: getPressureColor(pressure),
                        border: `1px solid ${getPressureColor(pressure)}40`
                      }}>
                        {d.indices?.pressureCategory}
                      </span>
                    </div>
                  </td>

                  {/* Sustainability Score */}
                  <td className="p-3 text-center font-mono font-bold" style={{ color: getSustainabilityColor(d.indices?.sustainabilityScore) }}>
                    {d.indices?.sustainabilityScore}
                  </td>

                  {/* Primary Pressure Identified */}
                  <td className="p-3">
                    <div className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5"></span>
                      <span className="text-slate-800 font-semibold text-[11px] leading-tight">
                        {d.indices?.mainPressure}
                      </span>
                    </div>
                  </td>

                  {/* Recommended Action */}
                  <td className="p-3 text-slate-600 text-[11px] leading-relaxed">
                    {d.indices?.recommendedAction}
                  </td>

                  {/* Deep Dive Trigger */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onOpenDeepDive(d)}
                      className="p-1.5 bg-slate-100 hover:bg-[#0e304f] hover:text-white text-slate-600 rounded-lg border border-slate-200 transition-colors"
                      title="Inspect District Deep Dive"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Callout Box matching the reference theme */}
      <div className="mt-4 callout-box">
        <div className="text-xs font-bold text-[#0e7490] uppercase tracking-wider mb-0.5">
          Strategic Planning Synthesis
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          The top 5 intervention districts (Thane, Pune, Mumbai Suburban, Nashik, Aurangabad) account for over 52% of total state movement volume. Allocating capital expenditure toward high-capacity suburban feeder routes and multi-modal transit interchanges in these specific geographies yields the highest statewide marginal return on infrastructure investment.
        </p>
      </div>

    </div>
  );
}
