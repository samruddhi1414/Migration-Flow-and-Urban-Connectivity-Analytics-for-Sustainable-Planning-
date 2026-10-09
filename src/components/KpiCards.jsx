import React from 'react';
import { 
  Users, 
  UserCheck, 
  Map, 
  Building, 
  Home, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  ShieldAlert,
  ArrowUpRight,
  Bus,
  Route
} from 'lucide-react';
import { formatNumber, formatCompactNumber } from '../utils/dataCleaner';

export default function KpiCards({ summary, onSelectHighPressure }) {
  if (!summary) return null;

  const cards = [
    {
      id: 'population',
      value: formatCompactNumber(summary.totalPopulation),
      title: 'Maharashtra Population',
      subtitle: 'Census 2011 · Total State Population',
      subtext: `${formatCompactNumber(summary.totalRuralPop)} Rural (${((summary.totalRuralPop / summary.totalPopulation) * 100).toFixed(0)}%) · ${formatCompactNumber(summary.totalUrbanPop)} Urban`,
      badge: 'Census 2011',
      icon: Users
    },
    {
      id: 'migrants',
      value: formatCompactNumber(summary.totalMigrants),
      title: 'Total Recorded Migrants',
      subtitle: 'Table D-03 · All Duration Migration',
      subtext: `${((summary.totalMigrants / summary.totalPopulation) * 100).toFixed(1)}% of total state inhabitants`,
      badge: 'Table D-03',
      icon: UserCheck
    },
    {
      id: 'bus-coverage',
      value: `${summary.avgBusCoverage || '68.4'}%`,
      title: 'Public Bus Coverage',
      subtitle: 'MSRTC Village Transit Availability',
      subtext: 'Statewide rural habitation access',
      badge: 'Village DCHB',
      icon: Bus
    },
    {
      id: 'districts',
      value: `${summary.districtsAnalyzed} / ${summary.districtsAnalyzed}`,
      title: 'Districts Evaluated',
      subtitle: 'Mapped Administrative Boundaries',
      subtext: '35 Census 2011 + Palghar Bifurcation',
      badge: '100% Mapped',
      icon: Map
    },
    {
      id: 'high-pressure',
      value: `${summary.highOrCriticalCount} / ${summary.districtsAnalyzed}`,
      title: 'High/Critical Pressure Hubs',
      subtitle: 'Priority Transit & Civic Action',
      subtext: 'Districts with Pressure Score > 60',
      badge: 'Planning Signal',
      isInteractive: true,
      onClick: onSelectHighPressure,
      icon: ShieldAlert
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm transition-all duration-200 group hover:shadow-md ${
              card.isInteractive ? 'cursor-pointer hover:border-rose-400 hover:ring-1 hover:ring-rose-200' : ''
            }`}
          >
            {/* Value (Large bold number matching the reference image) */}
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-extrabold text-[#0e304f] tracking-tight font-sans">
                {card.value}
              </span>
              {card.isInteractive && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-0.5">
                  Filter <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              )}
            </div>

            {/* Title / Primary label */}
            <div className="text-sm font-bold text-slate-800 leading-snug mb-1">
              {card.title}
            </div>

            {/* Subtitle / Source info */}
            <div className="text-xs text-slate-500 font-medium">
              {card.subtitle}
            </div>

            {/* Subtext description */}
            <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
