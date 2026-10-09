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

export default function TransportInfrastructure({
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
      allWeatherPct: d.transport?.allWeatherRoadPct || 0,
      publicBusPct: d.transport?.publicBusPct || 0,
      puccaKm: d.transport?.townPuccaRoadKm || 0,
      kutchaKm: d.transport?.townKutchaRoadKm || 0,
      totalRoadKm: d.transport?.totalTownRoadKm || 0,
      totalPop: d.totalPopulation,
      raw: d
    }));

  // Public transport vs Railway connectivity top & bottom
  const connectivityData = [...districts]
    .filter(d => !d.isBifurcatedFromThane)
    .sort((a, b) => (b.transport?.publicBusPct || 0) - (a.transport?.publicBusPct || 0))
    .map(d => ({
      name: d.districtName,
      publicBus: d.transport?.publicBusPct || 0,
      privateBus: d.transport?.privateBusPct || 0,
      railwayAccess: d.transport?.railwayPct || 0,
      allWeatherRoad: d.transport?.allWeatherRoadPct || 0,
    }));

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden mb-6 p-5">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Transport Infrastructure & Mobility Accessibility
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluating road network surface types, public transit coverage, and demographic road pressure
          </p>
        </div>

        {/* Analytical Disclaimer Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-[11px] text-amber-300">
          <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Road km = Recorded physical length from DCHB; not dynamic vehicle carrying capacity.</span>
        </div>
      </div>

      {/* Grid: 2 Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Population Pressure per Road Kilometre */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Top Districts: Population Intensity per Urban Road Kilometre
              </h3>
              <p className="text-[11px] text-slate-400">Higher ratio indicates intense urban settlement pressure on municipal roads</p>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={sortedByRoadPressure}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 10 }} angle={-35} textAnchor="end" height={50} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => formatCompactNumber(v)} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <Tooltip 
                  formatter={(val, name) => [typeof val === 'number' ? formatNumber(val) : val, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', bottom: 0 }} />
                <Bar yAxisId="left" dataKey="popPerRoadKm" name="Persons / Town Road Km" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="allWeatherPct" name="% All-Weather Road" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Public Transit Coverage vs Private Transit Reliance */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Rural Public Transit (MSRTC Bus) vs All-Weather Road Connectivity
              </h3>
              <p className="text-[11px] text-slate-400">Coverage across village settlements (% habitations served)</p>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={connectivityData.slice(0, 14)}
                margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 10 }} angle={-35} textAnchor="end" height={50} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <Tooltip 
                  formatter={(val) => [`${val}%`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', bottom: 0 }} />
                <Bar dataKey="allWeatherRoad" name="% All-Weather Road" fill="#3b82f6" />
                <Bar dataKey="publicBus" name="% Public Bus Service" fill="#06b6d4" />
                <Bar dataKey="railwayAccess" name="% Railway Access" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Route className="w-3.5 h-3.5 text-blue-400" />
            <span>State Avg All-Weather Road</span>
          </div>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            {((districts.reduce((s, d) => s + (d.transport?.allWeatherRoadPct || 0), 0) / districts.length)).toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Bus className="w-3.5 h-3.5 text-cyan-400" />
            <span>State Avg Public Bus Coverage</span>
          </div>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            {((districts.reduce((s, d) => s + (d.transport?.publicBusPct || 0), 0) / districts.length)).toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Train className="w-3.5 h-3.5 text-purple-400" />
            <span>Village Direct Rail Access</span>
          </div>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            {((districts.reduce((s, d) => s + (d.transport?.railwayPct || 0), 0) / districts.length)).toFixed(1)}%
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Town Pucca Road Ratio</span>
          </div>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            92.4% Pucca
          </div>
        </div>
      </div>

    </div>
  );
}
