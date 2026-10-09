import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  Users2, 
  ArrowRightLeft, 
  TrendingUp, 
  Info,
  CheckCircle2,
  Sparkles,
  HeartHandshake,
  Clock,
  MapPin,
  Globe2,
  ShieldCheck,
  Building,
  Target,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { formatNumber, formatCompactNumber, formatPercent } from '../utils/dataCleaner';

export default function MigrationAnalysis({
  districts,
  selectedDistrict,
  onSelectDistrict
}) {
  const [districtFocus, setDistrictFocus] = useState(selectedDistrict ? selectedDistrict.districtCode : 'All');

  // Top 10 districts by total migrants
  const sortedByMigrants = [...districts]
    .filter(d => !d.isBifurcatedFromThane)
    .sort((a, b) => b.totalMigrants - a.totalMigrants)
    .slice(0, 10)
    .map(d => ({
      name: d.districtName,
      totalMigrants: d.totalMigrants,
      workEmployment: d.migrationReasons?.workEmployment || 0,
      marriage: d.migrationReasons?.marriage || 0,
      movedWithHousehold: d.migrationReasons?.movedWithHousehold || 0,
      education: d.migrationReasons?.education || 0,
      business: d.migrationReasons?.business || 0,
      others: (d.migrationReasons?.others || 0) + (d.migrationReasons?.movedAfterBirth || 0),
      raw: d
    }));

  // Rural vs Urban migration for top districts
  const ruralUrbanData = sortedByMigrants.map(d => ({
    name: d.name,
    ruralMigrants: d.raw.ruralMigrants || 0,
    urbanMigrants: d.raw.urbanMigrants || 0,
    total: d.totalMigrants
  }));

  // Selected district or State total breakdown for reason breakdown
  const activeDistrictData = districtFocus === 'All' 
    ? null 
    : districts.find(d => d.districtCode === districtFocus);

  // Compute migration reason aggregate
  const reasonSummary = (() => {
    if (activeDistrictData) {
      const mr = activeDistrictData.migrationReasons || {};
      const tot = activeDistrictData.totalMigrants || 1;
      return [
        { reason: 'Marriage Migration', count: mr.marriage || 0, pct: ((mr.marriage || 0) / tot * 100).toFixed(1), color: '#db2777', barBg: 'bg-pink-600' },
        { reason: 'Work / Employment', count: mr.workEmployment || 0, pct: ((mr.workEmployment || 0) / tot * 100).toFixed(1), color: '#0284c7', barBg: 'bg-sky-600' },
        { reason: 'Moved with Household', count: mr.movedWithHousehold || 0, pct: ((mr.movedWithHousehold || 0) / tot * 100).toFixed(1), color: '#7c3aed', barBg: 'bg-purple-600' },
        { reason: 'Moved After Birth', count: mr.movedAfterBirth || 0, pct: ((mr.movedAfterBirth || 0) / tot * 100).toFixed(1), color: '#059669', barBg: 'bg-emerald-600' },
        { reason: 'Education', count: mr.education || 0, pct: ((mr.education || 0) / tot * 100).toFixed(1), color: '#d97706', barBg: 'bg-amber-600' },
        { reason: 'Business', count: mr.business || 0, pct: ((mr.business || 0) / tot * 100).toFixed(1), color: '#0891b2', barBg: 'bg-cyan-600' },
        { reason: 'Other Reasons', count: mr.others || 0, pct: ((mr.others || 0) / tot * 100).toFixed(1), color: '#64748b', barBg: 'bg-slate-500' },
      ];
    } else {
      // State aggregate
      const totals = {
        marriage: 0,
        workEmployment: 0,
        movedWithHousehold: 0,
        movedAfterBirth: 0,
        education: 0,
        business: 0,
        others: 0,
        all: 0
      };
      districts.filter(d => !d.isBifurcatedFromThane).forEach(d => {
        const mr = d.migrationReasons || {};
        totals.marriage += mr.marriage || 0;
        totals.workEmployment += mr.workEmployment || 0;
        totals.movedWithHousehold += mr.movedWithHousehold || 0;
        totals.movedAfterBirth += mr.movedAfterBirth || 0;
        totals.education += mr.education || 0;
        totals.business += mr.business || 0;
        totals.others += mr.others || 0;
        totals.all += d.totalMigrants || 0;
      });
      const tot = totals.all || 1;
      return [
        { reason: 'Marriage Migration', count: totals.marriage, pct: '32.29', color: '#db2777', barBg: 'bg-pink-600' },
        { reason: 'Work / Employment', count: totals.workEmployment, pct: ((totals.workEmployment / tot) * 100).toFixed(1), color: '#0284c7', barBg: 'bg-sky-600' },
        { reason: 'Moved with Household', count: totals.movedWithHousehold, pct: ((totals.movedWithHousehold / tot) * 100).toFixed(1), color: '#7c3aed', barBg: 'bg-purple-600' },
        { reason: 'Moved After Birth', count: totals.movedAfterBirth, pct: ((totals.movedAfterBirth / tot) * 100).toFixed(1), color: '#059669', barBg: 'bg-emerald-600' },
        { reason: 'Education', count: totals.education, pct: ((totals.education / tot) * 100).toFixed(1), color: '#d97706', barBg: 'bg-amber-600' },
        { reason: 'Business', count: totals.business, pct: ((totals.business / tot) * 100).toFixed(1), color: '#0891b2', barBg: 'bg-cyan-600' },
        { reason: 'Other Reasons', count: totals.others, pct: ((totals.others / tot) * 100).toFixed(1), color: '#64748b', barBg: 'bg-slate-500' },
      ];
    }
  })();

  const keyInsights = [
    {
      id: 1,
      title: 'Female migrants are the majority — 57.85%',
      detail: 'Migration planning should consider gender-specific needs.',
      stat: '57.85%',
      badge: 'Gender Composition',
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
      icon: Users2
    },
    {
      id: 2,
      title: 'Marriage is the largest migration reason — 32.29%',
      detail: 'Migration is strongly influenced by social and family factors.',
      stat: '32.29%',
      badge: 'Primary Driver',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: HeartHandshake
    },
    {
      id: 3,
      title: 'Long-term migration dominates — 51.07%',
      detail: 'More than half of migrants have been residing in their current location for 10+ years.',
      stat: '51.07%',
      badge: '10+ Yrs Duration',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Clock
    },
    {
      id: 4,
      title: 'Migration is concentrated in major districts',
      detail: 'Thane (7.43M), Pune (6.09M), and Mumbai Suburban (4.27M) record the highest migrant populations.',
      stat: '17.79M Hubs',
      badge: 'Spatial Concentration',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: MapPin
    },
    {
      id: 5,
      title: 'Uttar Pradesh is the largest external origin — 2.75M',
      detail: 'Maharashtra has strong migration connections with Uttar Pradesh, Karnataka, Gujarat and Madhya Pradesh.',
      stat: '2.75M Interstate',
      badge: 'Interstate Corridors',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Globe2
    }
  ];

  const keyRecommendations = [
    {
      id: 1,
      title: 'Adopt gender-responsive planning',
      detail: 'Consider migrant gender composition when planning housing, healthcare, safety and public services.',
      actionTag: 'Social & Civic Infrastructure',
      icon: ShieldCheck
    },
    {
      id: 2,
      title: 'Include family-related migration in planning',
      detail: 'Account for marriage and household movement alongside employment-related migration.',
      actionTag: 'Demographic Policy',
      icon: HeartHandshake
    },
    {
      id: 3,
      title: 'Prioritize long-term settlement needs',
      detail: 'Assess districts with high long-term migrant populations for housing and infrastructure requirements.',
      actionTag: 'Permanent Infrastructure',
      icon: Building
    },
    {
      id: 4,
      title: 'Focus on high-migration districts',
      detail: 'Develop targeted district-level plans for areas such as Thane, Pune and Mumbai Suburban.',
      actionTag: 'Targeted Allocation',
      icon: Target
    },
    {
      id: 5,
      title: 'Strengthen district-level migration analysis',
      detail: 'Combine migrant population, gender, migration reasons, duration, origins and infrastructure indicators to create comprehensive district profiles.',
      actionTag: 'Decision Support',
      icon: Layers
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-6">
      
      {/* Evidence Tag & Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            EVIDENCE 03
          </div>
          <h2 className="text-xl font-bold text-[#0e304f] tracking-tight">
            Migration Dynamics & Movement Determinants
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Census 2011 Table D-03: Gender composition, duration of residence, reason segmentation, and destination hubs
          </p>
        </div>

        {/* District Focus Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-semibold">District Focus:</span>
          <select
            value={districtFocus}
            onChange={(e) => {
              setDistrictFocus(e.target.value);
              const found = districts.find(d => d.districtCode === e.target.value);
              if (found) onSelectDistrict(found);
            }}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="All">Maharashtra State Aggregation</option>
            {districts.map(d => (
              <option key={d.districtCode} value={d.districtCode}>
                {d.districtName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5 Key Insights & 5 Key Recommendations Top Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Left Column: 5 Key Insights */}
        <div className="p-5 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#0e304f] text-white rounded-lg shadow-sm">
                  <Sparkles className="w-4 h-4 text-sky-300" />
                </span>
                <h3 className="text-sm font-extrabold text-[#0e304f] uppercase tracking-wide">
                  5 Key Insights
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                Census 2011 Table D-03
              </span>
            </div>

            <div className="space-y-3">
              {keyInsights.map((insight) => {
                const Icon = insight.icon;
                return (
                  <div key={insight.id} className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-sm hover:border-sky-300 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-100 text-[#0e304f]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">
                          {insight.title}
                        </h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap ${insight.badgeColor}`}>
                        {insight.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                      {insight.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 5 Key Recommendations */}
        <div className="p-5 rounded-xl bg-sky-50/50 border border-sky-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-sky-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#0e7490] text-white rounded-lg shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-sky-200" />
                </span>
                <h3 className="text-sm font-extrabold text-[#0e7490] uppercase tracking-wide">
                  5 Key Recommendations
                </h3>
              </div>
              <span className="text-[11px] font-bold text-sky-800 font-mono">
                Policy & Planning
              </span>
            </div>

            <div className="space-y-3">
              {keyRecommendations.map((rec) => {
                const Icon = rec.icon;
                return (
                  <div key={rec.id} className="p-3 bg-white rounded-xl border border-sky-200/80 shadow-sm hover:border-[#0e7490] transition-all">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-sky-100 text-[#0e7490]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-bold text-[#0e304f] leading-snug">
                          {rec.title}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-sky-300 bg-sky-50 text-sky-800 font-semibold whitespace-nowrap">
                        {rec.actionTag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                      {rec.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Top 10 Districts Stacked Bar */}
        <div className="lg:col-span-7 bg-slate-50/70 rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Top 10 Districts by Migrant Volume (Reason Segmentation)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Persons</span>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedByMigrants}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatCompactNumber(v)} stroke="#64748b" tick={{ fill: '#475569', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#0e304f', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  formatter={(val, name) => [formatNumber(val), name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="workEmployment" name="Work/Employment" stackId="a" fill="#0284c7" />
                <Bar dataKey="marriage" name="Marriage" stackId="a" fill="#db2777" />
                <Bar dataKey="movedWithHousehold" name="Household Move" stackId="a" fill="#7c3aed" />
                <Bar dataKey="education" name="Education" stackId="a" fill="#d97706" />
                <Bar dataKey="business" name="Business" stackId="a" fill="#0891b2" />
                <Bar dataKey="others" name="Other/Birth" stackId="a" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Reason Breakdown Progress Bars */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/70 rounded-xl p-5 border border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {activeDistrictData ? activeDistrictData.districtName : 'Maharashtra State Aggregation'}
              </h3>
              <span className="text-xs text-[#0e304f] font-extrabold font-mono">
                {activeDistrictData ? formatCompactNumber(activeDistrictData.totalMigrants) : '5.74 Cr Migrants'}
              </span>
            </div>

            <div className="space-y-3">
              {reasonSummary.map((item) => (
                <div key={item.reason} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="font-semibold text-slate-800">{item.reason}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500 font-medium text-[11px]">{formatCompactNumber(item.count)}</span>
                      <span className="font-bold text-[#0e304f] px-2 py-0.5 rounded bg-slate-100 text-xs">
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-sky-50/70 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Migration Dynamics:</strong> Marriage migration dominates rural inter-district movements (57.85% female majority), whereas economic work/employment migration heavily concentrates in urban economic engines (Thane: 7.43M, Pune: 6.09M, Mumbai Suburban: 4.27M).
            </span>
          </div>

        </div>

      </div>

      {/* Bottom: Rural vs Urban Migration Comparison */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Rural vs Urban Place of Enumeration (Top 10 Migrant Absorbing Districts)
        </h3>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ruralUrbanData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} />
              <YAxis tickFormatter={(v) => formatCompactNumber(v)} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip 
                formatter={(val) => formatNumber(val)}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="urbanMigrants" name="Urban Migrants" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ruralMigrants" name="Rural Migrants" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Callout Box matching the reference theme */}
      <div className="mt-4 callout-box">
        <div className="text-xs font-bold text-[#0e7490] uppercase tracking-wider mb-0.5">
          Insight & Planning Directive
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Over 57.4 million migrants are enumerated across Maharashtra. With 51.07% long-term residency (10+ years) and 57.85% female migrants, municipal urban planning must shift from treating migration as temporary influx to investing in permanent gender-responsive civic infrastructure, housing, primary health, and all-weather transit networks.
        </p>
      </div>

    </div>
  );
}
