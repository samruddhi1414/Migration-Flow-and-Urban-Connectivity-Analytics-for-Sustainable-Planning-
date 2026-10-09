import React from 'react';
import { 
  X, 
  Building2, 
  Users, 
  ArrowRightLeft, 
  Truck, 
  Bus, 
  Train, 
  HeartPulse, 
  Droplets, 
  Wifi, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle
} from 'lucide-react';
import { 
  formatNumber, 
  formatCompactNumber, 
  formatPercent,
  getPressureColor,
  getSustainabilityColor
} from '../utils/dataCleaner';
import { generateDistrictRecommendations } from '../utils/recommendations';

export default function DistrictDeepDive({
  district,
  isOpen,
  onClose
}) {
  if (!isOpen || !district) return null;

  const t = district.transport || {};
  const s = district.services || {};
  const ind = district.indices || {};
  const mr = district.migrationReasons || {};
  const d = district.demographics || {};

  const rec = generateDistrictRecommendations(district);

  const totalMig = district.totalMigrants || 1;

  const migrationBreakdown = [
    { label: 'Work / Employment', count: mr.workEmployment || 0, pct: ((mr.workEmployment || 0) / totalMig * 100).toFixed(1), color: 'bg-sky-600' },
    { label: 'Marriage', count: mr.marriage || 0, pct: ((mr.marriage || 0) / totalMig * 100).toFixed(1), color: 'bg-pink-600' },
    { label: 'Moved with Household', count: mr.movedWithHousehold || 0, pct: ((mr.movedWithHousehold || 0) / totalMig * 100).toFixed(1), color: 'bg-purple-600' },
    { label: 'Moved After Birth', count: mr.movedAfterBirth || 0, pct: ((mr.movedAfterBirth || 0) / totalMig * 100).toFixed(1), color: 'bg-emerald-600' },
    { label: 'Education', count: mr.education || 0, pct: ((mr.education || 0) / totalMig * 100).toFixed(1), color: 'bg-amber-600' },
    { label: 'Business', count: mr.business || 0, pct: ((mr.business || 0) / totalMig * 100).toFixed(1), color: 'bg-cyan-600' },
    { label: 'Others', count: mr.others || 0, pct: ((mr.others || 0) / totalMig * 100).toFixed(1), color: 'bg-slate-400' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-900/60 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      
      {/* Slide-over Drawer Panel */}
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col overflow-y-auto z-[10000]">
        
        {/* Drawer Navy Header */}
        <div className="p-5 bg-[#0e304f] text-white sticky top-0 z-20 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500 rounded-xl text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">{district.districtName}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-navy-800 text-sky-200 border border-sky-400/40">
                  Code: {district.districtCode}
                </span>
                {district.isBifurcatedFromThane && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-400 text-slate-900">
                    2014 Bifurcation
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Comprehensive Census 2011 & DCHB Infrastructure Profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 space-y-6 bg-[#f4f7fa] flex-1">
          
          {/* Key Score Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Pressure Score */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Pressure Score</span>
              <div className="text-2xl font-extrabold mt-1 font-mono" style={{ color: getPressureColor(ind.pressureScore) }}>
                {ind.pressureScore}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold mt-1 inline-block" style={{
                backgroundColor: `${getPressureColor(ind.pressureScore)}15`,
                color: getPressureColor(ind.pressureScore)
              }}>
                {ind.pressureCategory}
              </span>
            </div>

            {/* Movement Demand */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Demand Index</span>
              <div className="text-2xl font-extrabold mt-1 font-mono text-sky-600">
                {ind.movementDemandIndex}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Scale: 0-100</span>
            </div>

            {/* Infrastructure Capacity */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Infra Capacity</span>
              <div className="text-2xl font-extrabold mt-1 font-mono text-emerald-600">
                {ind.infrastructureCapacityIndex}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Scale: 0-100</span>
            </div>

            {/* Sustainability Score */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Sustainability</span>
              <div className="text-2xl font-extrabold mt-1 font-mono text-teal-600">
                {ind.sustainabilityScore}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">{ind.sustainabilityCategory}</span>
            </div>

          </div>

          {/* Evidence-based Planning Recommendation Box */}
          <div className="callout-box">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#0e7490]" />
              <h3 className="text-xs font-bold text-[#0e7490] uppercase tracking-wider">
                Evidence-Based Strategic Planning Directives
              </h3>
            </div>
            <div className="mb-2">
              <span className="text-xs font-bold text-slate-900 block">Primary Bottleneck Identified:</span>
              <p className="text-xs text-slate-700 mt-0.5">{rec.mainPressure}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Recommended Planning Action:</span>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{rec.recommendedAction}</p>
            </div>

            {rec.priorityInterventions.length > 1 && (
              <div className="mt-3 pt-3 border-t border-sky-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800">Detailed Sector Interventions:</span>
                {rec.priorityInterventions.map((item, idx) => (
                  <div key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0e7490] mt-1.5 flex-shrink-0"></span>
                    <span><strong>{item.sector}:</strong> {item.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demographic & Administrative Overview */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-[#0e304f] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Demographic & Settlement Structure</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Total Population</span>
                <strong className="text-[#0e304f] text-sm font-mono">{formatNumber(district.totalPopulation)}</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Rural Population</span>
                <strong className="text-[#0e304f] text-sm font-mono">{formatNumber(district.ruralPopulation)} ({((district.ruralPopulation/district.totalPopulation)*100).toFixed(1)}%)</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Urban Population</span>
                <strong className="text-[#0e304f] text-sm font-mono">{formatNumber(district.urbanPopulation)} ({((district.urbanPopulation/district.totalPopulation)*100).toFixed(1)}%)</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Villages Evaluated</span>
                <strong className="text-[#0e304f] text-sm font-mono">{district.villagesCount} villages</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Towns Evaluated</span>
                <strong className="text-[#0e304f] text-sm font-mono">{district.townsCount} towns</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Average Density</span>
                <strong className="text-[#0e304f] text-sm font-mono">{d.avgDensity} persons/km²</strong>
              </div>
            </div>
          </div>

          {/* Transport Infrastructure Details */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-[#0e304f] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-600" />
              <span>Transport & Accessibility Infrastructure</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">All-Weather Road</span>
                <strong className="text-emerald-700 text-sm font-mono">{t.allWeatherRoadPct}% villages</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Public Bus Service</span>
                <strong className="text-sky-700 text-sm font-mono">{t.publicBusPct}% villages</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Railway Access</span>
                <strong className="text-purple-700 text-sm font-mono">{t.railwayPct}% villages</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Town Pucca Road</span>
                <strong className="text-[#0e304f] text-sm font-mono">{t.townPuccaRoadKm} km</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Town Kutcha Road</span>
                <strong className="text-amber-700 text-sm font-mono">{t.townKutchaRoadKm} km</strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Pop / Town Road Km</span>
                <strong className="text-[#0e304f] text-sm font-mono">{formatNumber(t.populationPerRoadKm)} persons/km</strong>
              </div>
            </div>
          </div>

          {/* Essential Services & Utilities */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-[#0e304f] uppercase tracking-wider mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Essential Civic Utilities & Services</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Primary Schools</span>
                <strong className="text-[#0e304f] font-mono text-sm">{s.primarySchoolPct}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Health Facilities</span>
                <strong className="text-[#0e304f] font-mono text-sm">{s.healthFacilityPct}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Treated Water</span>
                <strong className="text-[#0e304f] font-mono text-sm">{s.treatedWaterPct}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Year-Round Water</span>
                <strong className="text-[#0e304f] font-mono text-sm">{s.yearRoundWaterPct}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Pucca Drainage</span>
                <strong className="text-[#0e304f] font-mono text-sm">{s.drainagePct}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Waste Disposal</span>
                <strong className="text-[#0e304f] font-mono text-sm">{s.wasteDisposalPct}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Banking Access</span>
                <strong className="text-[#0e304f] font-mono text-sm">{s.bankPct}%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Internet / CSC</span>
                <strong className="text-[#0e304f] font-mono text-sm">{s.internetCscPct}%</strong>
              </div>
            </div>
          </div>

          {/* Migration Breakdown */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-[#0e304f] uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <span>Migration Influx Breakdown</span>
              </h3>
              <span className="text-xs font-mono text-[#0e304f] font-extrabold">
                Total: {formatNumber(district.totalMigrants)}
              </span>
            </div>

            <div className="space-y-2.5">
              {migrationBreakdown.map(item => (
                <div key={item.label} className="text-xs">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-mono text-slate-500 font-medium">
                      {formatCompactNumber(item.count)} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
