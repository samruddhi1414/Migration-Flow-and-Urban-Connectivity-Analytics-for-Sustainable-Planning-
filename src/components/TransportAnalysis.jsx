import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid,
  ComposedChart
} from 'recharts';
import { 
  Truck, 
  Bus, 
  Train, 
  Route, 
  AlertCircle, 
  Info, 
  Maximize2 
} from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPercent } from '../utils/dataCleaner';

export default function TransportAnalysis({
  districts,
  selectedDistrict,
  onSelectDistrict
}) {
  // Sort districts by population per road km (highest pressure first)
  const sortedByRoadPressure = [...districts]
    .filter(d => !d.isBifurcatedFromThane)
    .sort((a, b) => (b.transport?.populationPerRoadKm || 0) - (a.transport?.populationPerRoadKm || 0))
    .slice(0, 12)
    .map(d => ({
      name: d.districtName,
      popPerRoadKm: d.transport?.populationPerRoadKm || 0,
      allWeatherPct: d.allWeatherRoadCoverage || d.transport?.allWeatherRoadPct || 0,
      publicBusPct: d.publicBusCoverage || d.transport?.publicBusPct || 0,
      puccaKm: d.totalPuccaRoadLength || d.transport?.townPuccaRoadKm || 0,
      kutchaKm: d.totalKutchaRoadLength || d.transport?.townKutchaRoadKm || 0,
      totalRoadKm: d.transport?.totalTownRoadKm || 0,
      totalPop: d.totalPopulation,
      raw: d
    }));

  // Migration vs Transport Accessibility
  const migVsTransport = [...districts]
    .filter(d => !d.isBifurcatedFromThane)
    .sort((a, b) => b.totalMigrants - a.totalMigrants)
    .slice(0, 12)
    .map(d => ({
      name: d.districtName,
      totalMigrants: d.totalMigrants,
      publicBus: d.publicBusCoverage || d.transport?.publicBusPct || 0,
      allWeatherRoad: d.allWeatherRoadCoverage || d.transport?.allWeatherRoadPct || 0,
      railwayAccess: d.railwayCoverage || d.transport?.railwayPct || 0
    }));

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-6">
      
      {/* Evidence Tag & Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            EVIDENCE 04
          </div>
          <h2 className="text-xl font-bold text-[#0e304f] tracking-tight">
            Transport Infrastructure & Road Surface Pressure
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            District indicators: Pucca vs Kutcha road length, Public bus coverage, and Population density per town road km
          </p>
        </div>

        {/* Analytical Note Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
          <Info className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
          <span>DCHB Recorded Road Lengths (Physical road surface availability)</span>
        </div>
      </div>

      {/* Grid: 2 Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Population Density per Road Km */}
        <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Population Load on Road Infrastructure (Persons per Town Road Km)
            </h3>
            <p className="text-[11px] text-slate-500">Higher ratio indicates intense urban road surface strain</p>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={sortedByRoadPressure}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#0e304f', fontSize: 10, fontWeight: 600 }} angle={-35} textAnchor="end" height={50} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => formatCompactNumber(v)} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
                <Tooltip 
                  formatter={(val, name) => [typeof val === 'number' ? formatNumber(val) : val, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', bottom: 0 }} />
                <Bar yAxisId="left" dataKey="popPerRoadKm" name="Persons / Road Km" fill="#ea580c" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="allWeatherPct" name="% All-Weather Road" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Migration vs Transport Accessibility */}
        <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Migration Influx vs Transport Accessibility (Top 12 Influx Hubs)
            </h3>
            <p className="text-[11px] text-slate-500">Comparing public bus & all-weather road coverage in high migrant hubs</p>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={migVsTransport}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#0e304f', fontSize: 10, fontWeight: 600 }} angle={-35} textAnchor="end" height={50} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
                <Tooltip 
                  formatter={(val) => [`${val}%`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', bottom: 0 }} />
                <Bar dataKey="allWeatherRoad" name="% All-Weather Road" fill="#0284c7" />
                <Bar dataKey="publicBus" name="% Public Bus Service" fill="#0891b2" />
                <Bar dataKey="railwayAccess" name="% Railway Station Access" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Route className="w-3.5 h-3.5 text-sky-600" />
            <span>State Avg All-Weather Road</span>
          </div>
          <div className="text-xl font-extrabold text-[#0e304f] mt-1 font-sans">
            {((districts.reduce((s, d) => s + (d.allWeatherRoadCoverage || 0), 0) / districts.length)).toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Bus className="w-3.5 h-3.5 text-cyan-600" />
            <span>State Avg Public Bus Reach</span>
          </div>
          <div className="text-xl font-extrabold text-[#0e304f] mt-1 font-sans">
            {((districts.reduce((s, d) => s + (d.publicBusCoverage || 0), 0) / districts.length)).toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Train className="w-3.5 h-3.5 text-purple-600" />
            <span>Village Direct Rail Reach</span>
          </div>
          <div className="text-xl font-extrabold text-[#0e304f] mt-1 font-sans">
            {((districts.reduce((s, d) => s + (d.railwayCoverage || 0), 0) / districts.length)).toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            <span>Total Town Pucca Road</span>
          </div>
          <div className="text-xl font-extrabold text-[#0e304f] mt-1 font-sans">
            {formatNumber(districts.reduce((s, d) => s + (d.totalPuccaRoadLength || 0), 0))} km
          </div>
        </div>
      </div>

      {/* Bottom Callout Box matching the reference theme */}
      <div className="mt-4 callout-box">
        <div className="text-xs font-bold text-[#0e7490] uppercase tracking-wider mb-0.5">
          Interpretation & Planning Directive
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          While all-weather road coverage exceeds 80% on average, town road density struggles severely under high migrant density (surpassing 2,000 persons per town road km in peri-urban Thane and Mumbai). This establishes an empirical case for dedicated bus transit corridors and railway feeder integration.
        </p>
      </div>

    </div>
  );
}
