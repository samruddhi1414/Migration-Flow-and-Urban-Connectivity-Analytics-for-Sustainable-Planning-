import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { 
  BarChart3, 
  ScatterChart as ScatterIcon, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Building2, 
  GraduationCap,
  Info
} from 'lucide-react';

export default function PopulationScatterChart({
  wardRows = [],
  selectedWardCode,
  onSelectWard
}) {
  const [sector, setSector] = useState('healthcare'); // 'healthcare' | 'schools'
  const [viewMode, setViewMode] = useState('bars'); // 'bars' | 'quadrants' | 'scatter'

  // Compute needs and metrics for each ward
  const { chartData, quadrantGroups, topDeficitWards, cityTotals } = useMemo(() => {
    if (!wardRows || wardRows.length === 0) {
      return { chartData: [], quadrantGroups: {}, topDeficitWards: [], cityTotals: {} };
    }

    const items = wardRows
      .filter(w => w.population > 0)
      .map(w => {
        const actual = sector === 'healthcare' ? w.healthcareCount : w.schoolsCount;
        // Standard: 1 clinic per 15k pop (UDPFI), 1 school per 4k pop
        const needed = sector === 'healthcare' 
          ? Math.ceil(w.population / 15000) 
          : Math.ceil(w.population / 4000);
        const deficit = needed - actual;
        const rate = sector === 'healthcare' ? w.healthcarePer10k : w.schoolsPer10k;
        const popLakh = Number((w.population / 100000).toFixed(1));

        return {
          wardCode: w.wardCode,
          displayName: `Ward ${w.wardCode}`,
          fullName: w.displayName,
          localities: w.localities,
          zone: w.zone,
          population: w.population,
          popLakh,
          actual,
          needed,
          deficit, // positive means shortage, negative means surplus
          rate,
          isSelected: selectedWardCode === w.wardCode
        };
      });

    // Sort chart data from highest deficit (worst off) to surplus (best off)
    const sortedByDeficit = [...items].sort((a, b) => b.deficit - a.deficit);

    // City Totals
    const totalPop = items.reduce((s, i) => s + i.population, 0);
    const totalActual = items.reduce((s, i) => s + i.actual, 0);
    const totalNeeded = items.reduce((s, i) => s + i.needed, 0);
    const avgPop = Math.round(totalPop / items.length);
    const avgActual = Number((totalActual / items.length).toFixed(1));

    // Quadrant grouping
    const q1Critical = items.filter(i => i.population >= avgPop && i.actual < avgActual);
    const q2Pressured = items.filter(i => i.population >= avgPop && i.actual >= avgActual);
    const q3Moderate = items.filter(i => i.population < avgPop && i.actual < avgActual);
    const q4WellServed = items.filter(i => i.population < avgPop && i.actual >= avgActual);

    return {
      chartData: sortedByDeficit,
      quadrantGroups: {
        critical: q1Critical,
        pressured: q2Pressured,
        moderate: q3Moderate,
        wellServed: q4WellServed
      },
      topDeficitWards: sortedByDeficit.slice(0, 3),
      cityTotals: { totalPop, totalActual, totalNeeded, avgPop, avgActual }
    };
  }, [wardRows, sector, selectedWardCode]);

  // Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const isDeficit = d.deficit > 0;
      return (
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xl text-xs max-w-xs">
          <div className="font-bold text-slate-900 text-sm mb-0.5">
            {d.displayName} — {d.fullName}
          </div>
          <p className="text-slate-500 text-[11px] mb-2">{d.localities} ({d.zone})</p>

          <div className="space-y-1.5 border-t border-slate-100 pt-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Population:</span>
              <strong className="text-slate-900">{d.population.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Available Facilities:</span>
              <strong className="text-teal-700">{d.actual} units</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Needed:</span>
              <strong className="text-slate-800">{d.needed} units</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Service Status:</span>
              <strong className={`font-bold ${isDeficit ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isDeficit ? `Shortage: -${d.deficit} units` : `Adequate (+${Math.abs(d.deficit)})`}
              </strong>
            </div>
          </div>
          <p className="text-[10px] text-teal-600 font-medium mt-2">Click bar to select this ward</p>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="chart-card-panel border border-slate-200 bg-white rounded-2xl p-6 shadow-sm text-slate-800" aria-label="Infrastructure Provision vs Population Scale">
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Facility Shortages by Ward
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Clear comparison showing which wards have enough facilities and which ones have shortages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sector Toggle: Healthcare vs Schools */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sector === 'healthcare'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setSector('healthcare')}
            >
              <Building2 size={13} className="text-teal-600" />
              <span>Healthcare</span>
            </button>
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sector === 'schools'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setSector('schools')}
            >
              <GraduationCap size={13} className="text-emerald-600" />
              <span>Schools</span>
            </button>
          </div>

          {/* View Mode Toggle: Bar Chart vs 4-Tier Cards vs Scatter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'bars'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewMode('bars')}
              title="Shortage Bar Chart"
            >
              Shortage Bar Chart
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'quadrants'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewMode('quadrants')}
              title="Group by 4 Categories"
            >
              Group by 4 Categories
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'scatter'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewMode('scatter')}
              title="Scatter Plot"
            >
              Scatter Plot
            </button>
          </div>
        </div>
      </div>

      {/* Summary Highlight Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold mb-0.5">
            <Flame size={14} className="text-rose-600" />
            <span>Wards with Biggest Shortage</span>
          </div>
          <p className="text-xs text-rose-900 font-medium">
            {topDeficitWards.map(w => `${w.displayName} (-${w.deficit})`).join(', ')}
          </p>
          <span className="text-[10px] text-rose-700">Densely populated suburbs with severe facility shortage</span>
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold mb-0.5">
            <Building2 size={14} className="text-teal-600" />
            <span>City Total Available vs. Needed</span>
          </div>
          <p className="text-xs text-teal-900 font-bold">
            {cityTotals.totalActual} available vs {cityTotals.totalNeeded} needed
          </p>
          <span className="text-[10px] text-teal-700">
            City-wide shortfall of -{cityTotals.totalNeeded - cityTotals.totalActual} {sector === 'healthcare' ? 'clinics' : 'schools'}
          </span>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-0.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Wards with Best Access</span>
          </div>
          <p className="text-xs text-emerald-900 font-medium">
            Ward E, Ward G/S, Ward F/S
          </p>
          <span className="text-[10px] text-emerald-700">South Mumbai wards with compact coverage</span>
        </div>
      </div>

      {/* VIEW 1: RANKED DEFICIT BAR CHART (DEFAULT & EASIEST TO UNDERSTAND) */}
      {viewMode === 'bars' && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              🔴 Red / Orange bars = <strong>Shortage of facilities</strong> relative to ward population • 🟢 Green = <strong>Sufficient capacity</strong>
            </span>
            <span className="font-semibold text-slate-700">Sorted from Largest Shortage to Surplus</span>
          </div>

          <div style={{ height: 460 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 40, left: 10 }}
                onClick={(state) => {
                  if (state && state.activePayload && state.activePayload[0]) {
                    onSelectWard(state.activePayload[0].payload.wardCode);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="wardCode"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  label={{ value: 'BMC Administrative Ward', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{
                    value: sector === 'healthcare' ? 'Available Clinics / Healthcare' : 'Available Schools',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11
                  }}
                />
                <Tooltip content={<CustomBarTooltip />} />

                <Bar dataKey="actual" name="Available Facilities" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => {
                    const isSelected = selectedWardCode === entry.wardCode;
                    let fill = '#0d9488'; // teal
                    if (entry.deficit > 20) fill = '#e11d48'; // critical rose
                    else if (entry.deficit > 0) fill = '#f59e0b'; // amber
                    else fill = '#059669'; // emerald

                    if (isSelected) fill = '#0284c7'; // highlight blue

                    return (
                      <Cell
                        key={`cell-${entry.wardCode}`}
                        fill={fill}
                        cursor="pointer"
                        stroke={isSelected ? '#0369a1' : 'none'}
                        strokeWidth={2}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Severe Shortage (&gt;20 deficit)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Moderate Deficit</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> Sufficient Coverage</span>
            </div>
            <span>Click any bar to inspect that ward in detail</span>
          </div>
        </div>
      )}

      {/* VIEW 2: 4-TIER CATEGORY CARDS */}
      {viewMode === 'quadrants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tier 1: Critical Shortage */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                <Flame size={15} className="text-rose-600" />
                <span>Tier 1: Critical Pressure (High Population, Severe Deficit)</span>
              </h4>
              <span className="text-[11px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                {quadrantGroups.critical?.length || 0} Wards
              </span>
            </div>
            <p className="text-[11px] text-rose-950/80 mb-3">
              Large outer suburban wards where population has exploded past existing municipal facilities.
            </p>
            <div className="space-y-1.5">
              {quadrantGroups.critical?.map(w => (
                <div
                  key={w.wardCode}
                  onClick={() => onSelectWard(w.wardCode)}
                  className={`flex items-center justify-between p-2 rounded-lg bg-white border border-rose-100 cursor-pointer hover:border-rose-400 transition-colors text-xs ${
                    selectedWardCode === w.wardCode ? 'ring-2 ring-rose-500' : ''
                  }`}
                >
                  <div>
                    <strong className="text-slate-900">Ward {w.wardCode}</strong>
                    <span className="text-slate-500 ml-1.5">({w.fullName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-600 font-bold block">{w.actual} units</span>
                    <span className="text-[10px] text-slate-400">{w.popLakh} Lakh pop</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2: Emerging Pressure */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-amber-600" />
                <span>Tier 2: High Scale Wards (High Population, Active Provision)</span>
              </h4>
              <span className="text-[11px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                {quadrantGroups.pressured?.length || 0} Wards
              </span>
            </div>
            <p className="text-[11px] text-amber-950/80 mb-3">
              Major population centers with substantial facility networks that still face rapid commuter demand.
            </p>
            <div className="space-y-1.5">
              {quadrantGroups.pressured?.map(w => (
                <div
                  key={w.wardCode}
                  onClick={() => onSelectWard(w.wardCode)}
                  className={`flex items-center justify-between p-2 rounded-lg bg-white border border-amber-100 cursor-pointer hover:border-amber-400 transition-colors text-xs ${
                    selectedWardCode === w.wardCode ? 'ring-2 ring-amber-500' : ''
                  }`}
                >
                  <div>
                    <strong className="text-slate-900">Ward {w.wardCode}</strong>
                    <span className="text-slate-500 ml-1.5">({w.fullName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-700 font-bold block">{w.actual} units</span>
                    <span className="text-[10px] text-slate-400">{w.popLakh} Lakh pop</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 3: Moderate Coverage */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Info size={15} className="text-slate-500" />
                <span>Tier 3: Moderate Scale (Moderate Population &amp; Supply)</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {quadrantGroups.moderate?.length || 0} Wards
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mb-3">
              Stable residential areas with localized service networks keeping pace with residents.
            </p>
            <div className="space-y-1.5">
              {quadrantGroups.moderate?.map(w => (
                <div
                  key={w.wardCode}
                  onClick={() => onSelectWard(w.wardCode)}
                  className={`flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-400 transition-colors text-xs ${
                    selectedWardCode === w.wardCode ? 'ring-2 ring-slate-500' : ''
                  }`}
                >
                  <div>
                    <strong className="text-slate-900">Ward {w.wardCode}</strong>
                    <span className="text-slate-500 ml-1.5">({w.fullName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-700 font-bold block">{w.actual} units</span>
                    <span className="text-[10px] text-slate-400">{w.popLakh} Lakh pop</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 4: Well-Served Island City */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Tier 4: Optimal Ratio (Compact Population, High Access)</span>
              </h4>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {quadrantGroups.wellServed?.length || 0} Wards
              </span>
            </div>
            <p className="text-[11px] text-emerald-950/80 mb-3">
              Historic South Mumbai wards with compact geography and highest per-capita public infrastructure.
            </p>
            <div className="space-y-1.5">
              {quadrantGroups.wellServed?.map(w => (
                <div
                  key={w.wardCode}
                  onClick={() => onSelectWard(w.wardCode)}
                  className={`flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-100 cursor-pointer hover:border-emerald-400 transition-colors text-xs ${
                    selectedWardCode === w.wardCode ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div>
                    <strong className="text-slate-900">Ward {w.wardCode}</strong>
                    <span className="text-slate-500 ml-1.5">({w.fullName})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold block">{w.actual} units</span>
                    <span className="text-[10px] text-slate-400">{w.popLakh} Lakh pop</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SCATTER PLOT WITH LABELED COLORED QUADRANT REGIONS */}
      {viewMode === 'scatter' && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              Each circle shows a ward. Points in the bottom-right represent <strong>high population with few facilities</strong>.
            </span>
          </div>

          <div style={{ height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 40, left: 10 }}
                onClick={(state) => {
                  if (state && state.activePayload && state.activePayload[0]) {
                    onSelectWard(state.activePayload[0].payload.wardCode);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="population"
                  name="Population"
                  tickFormatter={(v) => `${(v / 100_000).toFixed(1)}L`}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{ value: 'Ward Population (in Lakhs)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="actual"
                  name="Facilities"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{
                    value: sector === 'healthcare' ? 'Healthcare Facilities Count' : 'Schools Count',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11
                  }}
                />
                <ZAxis range={[90, 160]} />
                <Tooltip content={<CustomBarTooltip />} />

                <ReferenceLine
                  x={cityTotals.avgPop}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                  label={{ value: 'City Avg Population', fill: '#64748b', fontSize: 10, position: 'top' }}
                />
                <ReferenceLine
                  y={cityTotals.avgActual}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                  label={{ value: 'City Avg Facilities', fill: '#64748b', fontSize: 10, position: 'right' }}
                />

                <Scatter
                  name="Wards"
                  data={chartData}
                  fill="#0d9488"
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    const isSelected = selectedWardCode === payload.wardCode;
                    const isDeficit = payload.deficit > 10;
                    return (
                      <g cursor="pointer">
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 10 : 7}
                          fill={isSelected ? '#0284c7' : isDeficit ? '#f43f5e' : '#0d9488'}
                          stroke="white"
                          strokeWidth={2}
                          opacity={0.9}
                        />
                        <text
                          x={cx + 9}
                          y={cy + 3}
                          fill={isSelected ? '#0369a1' : '#334155'}
                          fontSize={11}
                          fontWeight={isSelected ? 800 : 600}
                        >
                          {payload.wardCode}
                        </text>
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </article>
  );
}
