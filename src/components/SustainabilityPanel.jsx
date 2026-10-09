import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  Leaf, 
  Droplets, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { getSustainabilityColor, formatPercent, formatCompactNumber } from '../utils/dataCleaner';

export default function SustainabilityPanel({
  districts,
  selectedDistrict,
  onSelectDistrict
}) {
  // Ranked list by sustainability score ascending (urgent intervention first)
  const urgentInterventionList = [...districts]
    .sort((a, b) => (a.indices?.sustainabilityScore || 0) - (b.indices?.sustainabilityScore || 0))
    .slice(0, 10)
    .map(d => ({
      name: d.districtName,
      sustainabilityScore: d.indices?.sustainabilityScore || 0,
      yearRoundWater: d.services?.yearRoundWaterPct || 0,
      treatedWater: d.services?.treatedWaterPct || 0,
      sanitation: d.services?.sanitationTscPct || 0,
      drainage: d.services?.drainagePct || 0,
      wasteDisposal: d.services?.wasteDisposalPct || 0,
      allWeatherRoad: d.transport?.allWeatherRoadPct || 0,
      publicBus: d.transport?.publicBusPct || 0,
      raw: d
    }));

  // Active district radar or State average
  const activeDistrict = selectedDistrict || districts[0];
  const s = activeDistrict.services || {};
  const t = activeDistrict.transport || {};

  const radarData = [
    { subject: 'Year-Round Water', value: s.yearRoundWaterPct || 0, fullMark: 100 },
    { subject: 'Treated Water', value: s.treatedWaterPct || 0, fullMark: 100 },
    { subject: 'Sanitation (TSC)', value: s.sanitationTscPct || 0, fullMark: 100 },
    { subject: 'Pucca Drainage', value: s.drainagePct || 0, fullMark: 100 },
    { subject: 'Waste Disposal', value: s.wasteDisposalPct || 0, fullMark: 100 },
    { subject: 'All-Weather Road', value: t.allWeatherRoadPct || 0, fullMark: 100 },
    { subject: 'Public Transit', value: t.publicBusPct || 0, fullMark: 100 },
    { subject: 'Digital Kiosks', value: s.internetCscPct || 0, fullMark: 100 },
  ];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden mb-6 p-5">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Leaf className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Sustainable Infrastructure & Ecological Resilience
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            0–100 Sustainable Planning Score tracking water security, drainage, waste recycling, clean transit, and basic sanitation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
            Separate Metric from Movement Pressure
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Top 10 Districts Requiring Greatest Sustainability Intervention */}
        <div className="lg:col-span-7 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Districts Requiring Greatest Sustainability Intervention (Lowest Scores)
              </h3>
              <p className="text-[11px] text-slate-400">Ranked by lowest combined sustainable utility coverage</p>
            </div>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={urgentInterventionList}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" pts" />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#e2e8f0', fontSize: 11 }} />
                <Tooltip 
                  formatter={(val, name) => [`${val} / 100`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar 
                  dataKey="sustainabilityScore" 
                  name="Sustainability Score" 
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  onClick={(entry) => onSelectDistrict(entry.raw)}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Sustainability Radar Chart for Selected District */}
        <div className="lg:col-span-5 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-200">
                Sustainability Spider Profile: <span className="text-emerald-400">{activeDistrict.districtName}</span>
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeDistrict.indices?.sustainabilityScore} / 100
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">8-Pillar ecological resilience and basic civic infrastructure audit</p>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 8 }} />
                  <Radar name={activeDistrict.districtName} dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.45} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                    formatter={(val) => [`${val}%`, 'Coverage']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Treated Tap Water</span>
              <strong className="text-white font-mono">{activeDistrict.services?.treatedWaterPct}%</strong>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Waste Disposal System</span>
              <strong className="text-white font-mono">{activeDistrict.services?.wasteDisposalPct}%</strong>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
