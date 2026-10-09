import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AlertTriangle, Info } from 'lucide-react';

export default function WardGapRanking({
  wardRows,
  cityBenchmarks,
  selectedWardCode,
  onSelectWard
}) {
  const [sector, setSector] = useState('healthcare');

  const { rankingData, bottomWards } = useMemo(() => {
    if (!wardRows) return { rankingData: [], bottomWards: [] };

    const valid = wardRows
      .filter(w => w.population > 0)
      .map(w => ({
        wardCode: w.wardCode,
        displayName: `Ward ${w.wardCode}`,
        zone: w.zone,
        localities: w.localities,
        population: w.population,
        rate: sector === 'healthcare' ? w.healthcarePer10k : w.schoolsPer10k,
        count: sector === 'healthcare' ? w.healthcareCount : w.schoolsCount,
        isSelected: selectedWardCode === w.wardCode
      }))
      .sort((a, b) => a.rate - b.rate);

    const bottom5Codes = new Set(valid.slice(0, 5).map(w => w.wardCode));
    const enriched = valid.map(w => ({
      ...w,
      isBottom5: bottom5Codes.has(w.wardCode)
    }));

    return {
      rankingData: enriched,
      bottomWards: valid.slice(0, 5)
    };
  }, [wardRows, sector, selectedWardCode]);

  const benchmarkVal = sector === 'healthcare'
    ? cityBenchmarks?.cityHealthPer10k || 0.37
    : cityBenchmarks?.citySchoolsPer10k || 1.81;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-title">{d.displayName} ({d.zone})</p>
          <p className="tooltip-sub">{d.localities}</p>
          <hr className="tooltip-divider" />
          <p className="tooltip-val" style={{ color: d.isBottom5 ? '#e11d48' : '#0d9488' }}>
            {sector === 'healthcare' ? 'Healthcare' : 'Schools'} per 10k: <strong>{d.rate}</strong>
          </p>
          <p className="tooltip-sub">Total Units in Ward: <strong>{d.count}</strong></p>
          <p className="tooltip-sub">Population: <strong>{d.population?.toLocaleString('en-IN')}</strong></p>
          <p className="tooltip-sub">
            Difference from City Average: <strong>{(d.rate - benchmarkVal).toFixed(2)} per 10k</strong>
          </p>
          <p className="tooltip-hint">Click bar to select Ward {d.wardCode}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="chart-card-panel" aria-label="Ward Service Gap Ranking">
      <div className="chart-card-header">
        <div className="chart-title-wrap">
          <AlertTriangle size={18} className="text-rose" />
          <div>
            <h3 className="chart-title">Wards with the Fewest Facilities per Person</h3>
            <p className="chart-subtitle">
              Wards ranked from lowest to highest. The red bars highlight the 5 wards facing the biggest shortages.
            </p>
          </div>
        </div>

        <div className="btn-toggle-group">
          <button
            type="button"
            className={`btn-subtoggle ${sector === 'healthcare' ? 'active' : ''}`}
            onClick={() => setSector('healthcare')}
          >
            Clinics per 10k
          </button>
          <button
            type="button"
            className={`btn-subtoggle ${sector === 'schools' ? 'active' : ''}`}
            onClick={() => setSector('schools')}
          >
            Schools per 10k
          </button>
        </div>
      </div>

      {/* Analytical interpretation note */}
      <div className="gap-ranking-callout">
        <Info size={15} className="callout-icon" />
        <p className="callout-text">
          <strong>Key Takeaway:</strong> The wards at the top have the lowest number of clinics and schools per person. Big suburban wards like Malad (P/N), Andheri West (K/W), and Govandi (M/E) have huge populations, so a small number of facilities has to serve too many residents.
        </p>
      </div>

      <div className="chart-container-inner" style={{ height: 480 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={rankingData}
            margin={{ top: 10, right: 30, left: 15, bottom: 20 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload[0]) {
                onSelectWard(state.activePayload[0].payload.wardCode);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{
                value: sector === 'healthcare' ? 'Healthcare Facilities per 10k People' : 'Schools per 10k People',
                position: 'insideBottom',
                offset: -10,
                fill: '#64748b',
                fontSize: 11
              }}
            />
            <YAxis
              type="category"
              dataKey="wardCode"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="rate" name="Units per 10k" radius={[0, 4, 4, 0]} cursor="pointer">
              {rankingData.map((entry, index) => {
                let fill = entry.isBottom5 ? '#f43f5e' : '#0d9488';
                if (entry.isSelected) fill = '#f59e0b';
                return <Cell key={`cell-gap-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom 5 Quick Summary Pills */}
      <div className="bottom-summary-pills">
        <span className="pills-label">Lowest 5 Availability Wards:</span>
        {bottomWards.map(w => (
          <button
            key={w.wardCode}
            type="button"
            className="bottom-ward-pill"
            onClick={() => onSelectWard(w.wardCode)}
            title={`Select Ward ${w.wardCode}`}
          >
            Ward {w.wardCode} ({w.rate} per 10k)
          </button>
        ))}
      </div>
    </article>
  );
}
