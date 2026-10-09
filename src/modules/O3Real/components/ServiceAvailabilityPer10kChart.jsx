import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { TrendingUp, ArrowUpDown } from 'lucide-react';

export default function ServiceAvailabilityPer10kChart({
  wardRows,
  cityBenchmarks,
  selectedWardCode,
  onSelectWard
}) {
  const [metricView, setMetricView] = useState('both');
  const [sortOrder, setSortOrder] = useState('desc');

  const chartData = useMemo(() => {
    if (!wardRows) return [];

    let list = [...wardRows]
      .filter(w => w.population > 0)
      .map(w => ({
        wardCode: w.wardCode,
        displayName: `Ward ${w.wardCode}`,
        healthcarePer10k: w.healthcarePer10k,
        schoolsPer10k: w.schoolsPer10k,
        totalRate: Number(((w.healthcarePer10k || 0) + (w.schoolsPer10k || 0)).toFixed(2)),
        population: w.population,
        localities: w.localities,
        isSelected: selectedWardCode === w.wardCode
      }));

    if (sortOrder === 'desc') {
      if (metricView === 'health') list.sort((a, b) => b.healthcarePer10k - a.healthcarePer10k);
      else if (metricView === 'schools') list.sort((a, b) => b.schoolsPer10k - a.schoolsPer10k);
      else list.sort((a, b) => b.totalRate - a.totalRate);
    } else if (sortOrder === 'asc') {
      if (metricView === 'health') list.sort((a, b) => a.healthcarePer10k - b.healthcarePer10k);
      else if (metricView === 'schools') list.sort((a, b) => a.schoolsPer10k - b.schoolsPer10k);
      else list.sort((a, b) => a.totalRate - b.totalRate);
    } else {
      list.sort((a, b) => a.wardCode.localeCompare(b.wardCode));
    }

    return list;
  }, [wardRows, metricView, sortOrder, selectedWardCode]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-title">{d.displayName} ({d.localities.split(',')[0]})</p>
          <p className="tooltip-sub">Population: {d.population?.toLocaleString('en-IN')}</p>
          <hr className="tooltip-divider" />
          {(metricView === 'both' || metricView === 'health') && (
            <p className="tooltip-val text-rose">
              Healthcare: <strong>{d.healthcarePer10k} per 10k</strong>{' '}
              <span className="tooltip-diff">
                ({d.healthcarePer10k >= cityBenchmarks.cityHealthPer10k ? '+' : ''}
                {(d.healthcarePer10k - cityBenchmarks.cityHealthPer10k).toFixed(2)} vs city average)
              </span>
            </p>
          )}
          {(metricView === 'both' || metricView === 'schools') && (
            <p className="tooltip-val text-emerald">
              Schools: <strong>{d.schoolsPer10k} per 10k</strong>{' '}
              <span className="tooltip-diff">
                ({d.schoolsPer10k >= cityBenchmarks.citySchoolsPer10k ? '+' : ''}
                {(d.schoolsPer10k - cityBenchmarks.citySchoolsPer10k).toFixed(2)} vs city average)
              </span>
            </p>
          )}
          <p className="tooltip-hint">Click bar to select Ward {d.wardCode}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="chart-card-panel" aria-label="Service Availability per 10k Residents Chart">
      <div className="chart-card-header">
        <div className="chart-title-wrap">
          <TrendingUp size={18} className="text-teal" />
          <div>
            <h3 className="chart-title">Clinics &amp; Schools per 10,000 People</h3>
            <p className="chart-subtitle">
              Comparing access fairly by population size. Dotted lines show City Averages: Clinics {cityBenchmarks?.cityHealthPer10k || 0.37} • Schools {cityBenchmarks?.citySchoolsPer10k || 1.81}
            </p>
          </div>
        </div>

        <div className="chart-actions-wrap">
          <div className="btn-toggle-group">
            <button
              type="button"
              className={`btn-subtoggle ${metricView === 'both' ? 'active' : ''}`}
              onClick={() => setMetricView('both')}
            >
              Both
            </button>
            <button
              type="button"
              className={`btn-subtoggle ${metricView === 'health' ? 'active' : ''}`}
              onClick={() => setMetricView('health')}
            >
              Health
            </button>
            <button
              type="button"
              className={`btn-subtoggle ${metricView === 'schools' ? 'active' : ''}`}
              onClick={() => setMetricView('schools')}
            >
              Schools
            </button>
          </div>

          <button
            type="button"
            className="btn-sort-toggle"
            onClick={() => {
              if (sortOrder === 'desc') setSortOrder('asc');
              else if (sortOrder === 'asc') setSortOrder('alpha');
              else setSortOrder('desc');
            }}
            title="Toggle sort order"
          >
            <ArrowUpDown size={14} />
            <span>
              {sortOrder === 'desc' ? 'Highest Rate First' : sortOrder === 'asc' ? 'Lowest Rate First' : 'Ward A → Z'}
            </span>
          </button>
        </div>
      </div>

      <div className="chart-container-inner" style={{ height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 25, left: 10, bottom: 40 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload[0]) {
                onSelectWard(state.activePayload[0].payload.wardCode);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="wardCode"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Per 10,000 Residents', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 5, fontSize: 12 }} />

            {(metricView === 'both' || metricView === 'health') && (
              <ReferenceLine
                y={cityBenchmarks?.cityHealthPer10k || 0.37}
                stroke="#e11d48"
                strokeDasharray="4 4"
                label={{ value: 'Avg Health (0.37)', fill: '#e11d48', fontSize: 10, position: 'right' }}
              />
            )}

            {(metricView === 'both' || metricView === 'schools') && (
              <ReferenceLine
                y={cityBenchmarks?.citySchoolsPer10k || 1.81}
                stroke="#059669"
                strokeDasharray="4 4"
                label={{ value: 'Avg Schools (1.81)', fill: '#059669', fontSize: 10, position: 'right' }}
              />
            )}

            {(metricView === 'both' || metricView === 'health') && (
              <Bar
                dataKey="healthcarePer10k"
                name="Healthcare per 10k"
                fill="#e11d48"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            )}

            {(metricView === 'both' || metricView === 'schools') && (
              <Bar
                dataKey="schoolsPer10k"
                name="Schools per 10k"
                fill="#059669"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
