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
  AlertTriangle
} from 'lucide-react';
import { getSustainabilityColor, formatPercent } from '../utils/dataCleaner';

export default function SustainabilityAnalysis({
  districts,
  selectedDistrict,
  onSelectDistrict
}) {
  const urgentInterventionList = [...districts]
    .sort((a, b) => (a.sustainabilityScore || 0) - (b.sustainabilityScore || 0))
    .slice(0, 10)
    .map(d => ({
      name: d.districtName,
      sustainabilityScore: d.sustainabilityScore || 0,
      yearRoundWater: d.yearRoundWaterCoverage || 0,
      treatedWater: d.treatedWaterCoverage || 0,
      sanitation: d.sanitationCoverage || 0,
      drainage: d.drainageCoverage || 0,
      wasteDisposal: d.wasteManagementCoverage || 0,
      allWeatherRoad: d.allWeatherRoadCoverage || 0,
      publicBus: d.publicBusCoverage || 0,
      raw: d
    }));

  const activeDistrict = selectedDistrict || districts[0];

  const radarData = [
    { subject: 'Year-Round Water', value: activeDistrict.yearRoundWaterCoverage || 0, fullMark: 100 },
    { subject: 'Treated Water', value: activeDistrict.treatedWaterCoverage || 0, fullMark: 100 },
    { subject: 'Sanitation (TSC)', value: activeDistrict.sanitationCoverage || 0, fullMark: 100 },
    { subject: 'Pucca Drainage', value: activeDistrict.drainageCoverage || 0, fullMark: 100 },
    { subject: 'Waste Disposal', value: activeDistrict.wasteManagementCoverage || 0, fullMark: 100 },
    { subject: 'All-Weather Road', value: activeDistrict.allWeatherRoadCoverage || 0, fullMark: 100 },
    { subject: 'Public Bus', value: activeDistrict.publicBusCoverage || 0, fullMark: 100 },
    { subject: 'Digital / CSC', value: activeDistrict.internetCoverage || 0, fullMark: 100 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-6">
      
      {/* Evidence Tag & Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            EVIDENCE 06
          </div>
          <h2 className="text-xl font-bold text-[#0e304f] tracking-tight">
            Sustainable Planning & Ecological Resilience
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            0–100 Sustainable Planning Score tracking year-round treated water, sanitation, covered drainage, and clean transit
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            Independent Score from Movement Pressure
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Top 10 Districts Requiring Greatest Sustainability Intervention */}
        <div className="lg:col-span-7 bg-slate-50/70 rounded-xl p-5 border border-slate-200">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Districts Requiring Greatest Sustainability Intervention (Lowest Scores)
            </h3>
            <p className="text-[11px] text-slate-500">Ranked by lowest combined sustainable utility coverage</p>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={urgentInterventionList}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} unit=" pts" />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#0e304f', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  formatter={(val, name) => [`${val} / 100`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar 
                  dataKey="sustainabilityScore" 
                  name="Sustainability Score" 
                  fill="#059669"
                  radius={[0, 4, 4, 0]}
                  onClick={(entry) => onSelectDistrict(entry.raw)}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Sustainability Radar Profile */}
        <div className="lg:col-span-5 bg-slate-50/70 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Spider Profile: <span className="text-[#0e304f]">{activeDistrict.districtName}</span>
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {activeDistrict.sustainabilityScore} / 100
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">8-Pillar ecological resilience and basic civic infrastructure audit</p>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fill: '#334155', fontSize: 10, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 9 }} />
                  <Radar name={activeDistrict.districtName} dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.35} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`${val}%`, 'Coverage']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Treated Tap Water</span>
              <strong className="text-[#0e304f] font-mono text-sm">{activeDistrict.treatedWaterCoverage}%</strong>
            </div>
            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Waste Disposal System</span>
              <strong className="text-[#0e304f] font-mono text-sm">{activeDistrict.wasteManagementCoverage}%</strong>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Callout Box matching the reference theme */}
      <div className="mt-4 callout-box">
        <div className="text-xs font-bold text-[#0e7490] uppercase tracking-wider mb-0.5">
          Planning signal
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Districts with low sustainability scores often coincide with severe dry-season water stress and lack of closed drainage networks. Future municipal budget allocations must bundle transport capital expenditure with wastewater management and year-round treated water security.
        </p>
      </div>

    </div>
  );
}
