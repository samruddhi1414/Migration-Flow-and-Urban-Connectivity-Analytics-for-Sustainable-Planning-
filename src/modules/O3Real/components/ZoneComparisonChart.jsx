import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Layers, Building2, Users, TrendingUp } from 'lucide-react';

const ZONE_DEFINITIONS = [
  {
    key: 'Island City',
    shortName: 'Island City',
    displayName: 'Island City (South Mumbai)',
    wardsCount: 9,
    description: 'Wards A to G (Historic urban core)'
  },
  {
    key: 'Western Suburbs',
    shortName: 'Western Suburbs',
    displayName: 'Western Suburbs',
    wardsCount: 9,
    description: 'Wards H to R (High-growth coastal corridor)'
  },
  {
    key: 'Eastern Suburbs',
    shortName: 'Eastern Suburbs',
    displayName: 'Eastern Suburbs',
    wardsCount: 6,
    description: 'Wards L, M, N, S, T (Industrial & transit belt)'
  }
];

export default function ZoneComparisonChart({ wardRows }) {
  const [metricMode, setMetricMode] = useState('rate'); // 'rate' (per 10k) | 'total' (absolute counts)

  const { chartData, zoneSummaries, cityTotalPop } = useMemo(() => {
    if (!wardRows || wardRows.length === 0) {
      return { chartData: [], zoneSummaries: [], cityTotalPop: 0 };
    }

    const cityPop = wardRows.reduce((sum, w) => sum + (w.population || 0), 0);

    const summaries = ZONE_DEFINITIONS.map(def => {
      const wardsInZone = wardRows.filter(w => w.zone === def.key);
      const zonePop = wardsInZone.reduce((sum, w) => sum + (w.population || 0), 0);
      const totalHealth = wardsInZone.reduce((sum, w) => sum + (w.healthcareCount || 0), 0);
      const totalSchools = wardsInZone.reduce((sum, w) => sum + (w.schoolsCount || 0), 0);

      const healthPer10k = zonePop > 0 ? Number(((totalHealth / zonePop) * 10000).toFixed(2)) : 0;
      const schoolsPer10k = zonePop > 0 ? Number(((totalSchools / zonePop) * 10000).toFixed(2)) : 0;
      const popShare = cityPop > 0 ? Number(((zonePop / cityPop) * 100).toFixed(1)) : 0;

      return {
        key: def.key,
        name: def.displayName,
        shortName: def.shortName,
        description: def.description,
        wardCount: wardsInZone.length || def.wardsCount,
        population: zonePop,
        popShare,
        totalHealth,
        totalSchools,
        healthPer10k,
        schoolsPer10k
      };
    });

    const data = summaries.map(s => ({
      zone: s.shortName,
      fullName: s.name,
      population: s.population,
      popShare: s.popShare,
      Healthcare: metricMode === 'rate' ? s.healthPer10k : s.totalHealth,
      Schools: metricMode === 'rate' ? s.schoolsPer10k : s.totalSchools,
      healthPer10k: s.healthPer10k,
      schoolsPer10k: s.schoolsPer10k,
      totalHealth: s.totalHealth,
      totalSchools: s.totalSchools
    }));

    return { chartData: data, zoneSummaries: summaries, cityTotalPop: cityPop };
  }, [wardRows, metricMode]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-title">{item.fullName}</p>
          <p className="tooltip-sub">
            Population: {(item.population / 100000).toFixed(2)} Lakh ({item.popShare}% of Mumbai)
          </p>
          <hr className="tooltip-divider" />
          <p className="tooltip-val" style={{ color: '#6366f1' }}>
            Healthcare Facilities: <strong>{item.totalHealth} units</strong>{' '}
            <span style={{ fontSize: '11px', color: '#64748b' }}>({item.healthPer10k} per 10k)</span>
          </p>
          <p className="tooltip-val" style={{ color: '#d97706' }}>
            Schools: <strong>{item.totalSchools} units</strong>{' '}
            <span style={{ fontSize: '11px', color: '#64748b' }}>({item.schoolsPer10k} per 10k)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="chart-card-panel" aria-label="Regional 3-Zone Infrastructure Comparison">
      <div className="chart-card-header">
        <div className="chart-title-wrap">
          <Layers size={18} style={{ color: '#6366f1' }} />
          <div>
            <h3 className="chart-title">South Mumbai vs. Suburbs Comparison</h3>
            <p className="chart-subtitle">
              Comparing clinics and schools across South Mumbai, Western Suburbs, and Eastern Suburbs
            </p>
          </div>
        </div>

        <div className="btn-toggle-group">
          <button
            type="button"
            className={`btn-subtoggle ${metricMode === 'rate' ? 'active' : ''}`}
            onClick={() => setMetricMode('rate')}
          >
            Per 10,000 People
          </button>
          <button
            type="button"
            className={`btn-subtoggle ${metricMode === 'total' ? 'active' : ''}`}
            onClick={() => setMetricMode('total')}
          >
            Total Facilities
          </button>
        </div>
      </div>

      <div className="chart-container-inner" style={{ height: 290 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 22, bottom: 10 }}
            barGap={8}
            barCategoryGap={32}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="zone"
              tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              label={{
                value: metricMode === 'rate' ? 'Facilities per 10,000 Residents' : 'Total Facility Units',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11,
                offset: -4
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 500 }}
            />
            <Bar
              dataKey="Healthcare"
              name="Healthcare Facilities"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              maxBarSize={52}
            />
            <Bar
              dataKey="Schools"
              name="Schools"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              maxBarSize={52}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3 Regional Cards */}
      <div className="zone-stat-cards-grid">
        {zoneSummaries.map(zone => (
          <div key={zone.key} className="zone-stat-card">
            <div className="zone-stat-card-header">
              <span className="zone-badge">{zone.shortName}</span>
              <span className="zone-wards-count">{zone.wardCount} Wards</span>
            </div>
            <p className="zone-pop-metric">
              <strong>{(zone.population / 100000).toFixed(1)} Lakh</strong> residents
              <span className="zone-pop-share"> ({zone.popShare}% of city)</span>
            </p>
            <div className="zone-rates-row">
              <div className="zone-rate-pill health">
                <span className="pill-dot" />
                <span className="pill-label">Health:</span>
                <strong>{zone.healthPer10k}</strong>/10k
              </div>
              <div className="zone-rate-pill school">
                <span className="pill-dot" />
                <span className="pill-label">Schools:</span>
                <strong>{zone.schoolsPer10k}</strong>/10k
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytical Finding Callout */}
      <div className="zone-chart-callout">
        <TrendingUp size={16} className="callout-icon" />
        <p>
          <strong>Analytical Finding:</strong> South Mumbai (Island City) maintains significantly higher per-capita facility density than the Eastern and Western Suburbs, evidencing that rapid suburban demographic expansion has outpaced civic infrastructure investments.
        </p>
      </div>
    </article>
  );
}
