import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell,
  Label,
  CartesianGrid
} from 'recharts';
import { Compass, Info, ArrowUpRight } from 'lucide-react';
import { getPressureColor, formatCompactNumber } from '../utils/dataCleaner';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xl text-xs text-slate-800 max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
          <strong className="text-sm font-bold text-[#0e304f]">{data.districtName}</strong>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-semibold">
            Code: {data.districtCode}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Movement Demand Index:</span>
            <span className="font-bold text-sky-600">{data.x} / 100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Infrastructure Capacity:</span>
            <span className="font-bold text-emerald-600">{data.y} / 100</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-1">
            <span className="text-slate-500">Pressure Score:</span>
            <span className="font-bold font-mono" style={{ color: getPressureColor(data.pressureScore) }}>
              {data.pressureScore} ({data.pressureCategory})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Classification Zone:</span>
            <span className="font-semibold text-purple-700">{data.scatterZone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Migrants:</span>
            <span className="font-mono font-semibold text-slate-700">{formatCompactNumber(data.totalMigrants)}</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-sky-600 font-semibold flex items-center gap-0.5 justify-end">
          Click to inspect district <ArrowUpRight className="w-2.5 h-2.5" />
        </div>
      </div>
    );
  }
  return null;
};

export default function DemandCapacityScatter({
  districts,
  selectedDistrict,
  onSelectDistrict
}) {
  const chartData = districts.map(d => ({
    districtCode: d.districtCode,
    districtName: d.districtName,
    x: d.indices?.movementDemandIndex || 0,
    y: d.indices?.infrastructureCapacityIndex || 0,
    z: d.totalPopulation || 100000,
    pressureScore: d.indices?.pressureScore || 0,
    pressureCategory: d.indices?.pressureCategory || 'N/A',
    scatterZone: d.indices?.scatterZone || 'N/A',
    totalMigrants: d.totalMigrants,
    rawDistrict: d
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-6">
      
      {/* Evidence Tag & Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            EVIDENCE 02
          </div>
          <h2 className="text-xl font-bold text-[#0e304f] tracking-tight">
            Does Infrastructure Meet Movement Demand?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            4-Quadrant diagnostic matrix evaluating Movement Demand Index against Infrastructure Capacity Index
          </p>
        </div>

        {/* Quadrant Legend Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            🔴 Critical Gap (High Demand, Low Capacity)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
            🔵 Keeping Pace (High Demand, High Capacity)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            🟢 Relatively Adequate (Low Demand, High Capacity)
          </span>
        </div>
      </div>

      {/* Top Quadrant Label Indicators */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-center text-xs font-semibold">
        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 flex items-center justify-center gap-1.5">
          <span>Quadrant II: Relatively Adequate</span>
          <span className="text-[11px] text-emerald-600 font-normal">(Capacity &gt; 50, Demand &lt; 50)</span>
        </div>
        <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-200 text-sky-800 flex items-center justify-center gap-1.5">
          <span>Quadrant I: Keeping Pace</span>
          <span className="text-[11px] text-sky-600 font-normal">(Capacity &gt; 50, Demand &gt; 50)</span>
        </div>
      </div>

      {/* Scatter Plot Canvas */}
      <div className="h-[430px] w-full bg-slate-50/50 rounded-xl p-2 border border-slate-200/80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, bottom: 40, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            
            {/* Reference Threshold Lines */}
            <ReferenceLine x={50} stroke="#94a3b8" strokeDasharray="4 4">
              <Label value="Demand Threshold (50)" position="insideTopRight" fill="#64748b" fontSize={11} fontWeight={600} />
            </ReferenceLine>
            <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 4">
              <Label value="Capacity Threshold (50)" position="insideTopLeft" fill="#64748b" fontSize={11} fontWeight={600} />
            </ReferenceLine>

            <XAxis 
              type="number" 
              dataKey="x" 
              name="Movement Demand Index" 
              domain={[0, 100]} 
              stroke="#64748b"
              tick={{ fill: '#475569', fontSize: 11 }}
            >
              <Label value="Movement Demand Index (0 = Low Demand, 100 = Severe Mobility Demand)" offset={-25} position="insideBottom" fill="#334155" fontSize={12} fontWeight={600} />
            </XAxis>

            <YAxis 
              type="number" 
              dataKey="y" 
              name="Infrastructure Capacity Index" 
              domain={[0, 100]} 
              stroke="#64748b"
              tick={{ fill: '#475569', fontSize: 11 }}
            >
              <Label value="Infrastructure Capacity Index (0 = Deficit, 100 = Robust Availability)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#334155" fontSize={12} fontWeight={600} />
            </YAxis>

            <ZAxis type="number" dataKey="z" range={[90, 450]} name="Population" />

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} />

            <Scatter 
              name="Districts" 
              data={chartData} 
              onClick={(node) => {
                if (node && node.rawDistrict) {
                  onSelectDistrict(node.rawDistrict);
                }
              }}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => {
                const isSelected = selectedDistrict && selectedDistrict.districtCode === entry.districtCode;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getPressureColor(entry.pressureScore)}
                    stroke={isSelected ? '#0e304f' : '#ffffff'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    opacity={isSelected ? 1 : 0.9}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Quadrant Label Indicators */}
      <div className="grid grid-cols-2 gap-3 mt-3 text-center text-xs font-semibold">
        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-800 flex items-center justify-center gap-1.5">
          <span>Quadrant III: Development Gap</span>
          <span className="text-[11px] text-amber-600 font-normal">(Capacity &lt; 50, Demand &lt; 50)</span>
        </div>
        <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-800 flex items-center justify-center gap-1.5">
          <span>Quadrant IV: Critical Infrastructure Gap</span>
          <span className="text-[11px] text-rose-600 font-normal">(Capacity &lt; 50, Demand &gt; 50)</span>
        </div>
      </div>

      {/* Bottom Callout Box matching the reference theme */}
      <div className="mt-4 callout-box">
        <div className="text-xs font-bold text-[#0e7490] uppercase tracking-wider mb-0.5">
          Planning signal
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Districts falling into Quadrant IV (High Demand, Low Capacity) experience acute deficits between population movement volume and physical utility availability. Planning priorities must prioritize dedicated bus priority corridors, all-weather road upgrades, and decentralized water infrastructure to close the gap.
        </p>
      </div>

    </div>
  );
}
