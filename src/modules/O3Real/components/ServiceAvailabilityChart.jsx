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
import { ArrowUpDown, BarChart2 } from 'lucide-react';

export default function ServiceAvailabilityChart({
  wardRows,
  selectedWardCode,
  onSelectWard
}) {
  const [metricView, setMetricView] = useState('both');
  const [sortOrder, setSortOrder] = useState('desc');

  const chartData = useMemo(() => {
    if (!wardRows) return [];

    let list = [...wardRows].map(w => ({
      wardCode: w.wardCode,
      displayName: `Ward ${w.wardCode}`,
      healthcareCount: w.healthcareCount,
      schoolsCount: w.schoolsCount,
      totalCount: w.healthcareCount + w.schoolsCount,
      population: w.population,
      localities: w.localities,
      isSelected: selectedWardCode === w.wardCode
    }));

    if (sortOrder === 'desc') {
      if (metricView === 'health') list.sort((a, b) => b.healthcareCount - a.healthcareCount);
      else if (metricView === 'schools') list.sort((a, b) => b.schoolsCount - a.schoolsCount);
      else list.sort((a, b) => b.totalCount - a.totalCount);
    } else if (sortOrder === 'asc') {
      if (metricView === 'health') list.sort((a, b) => a.healthcareCount - b.healthcareCount);
      else if (metricView === 'schools') list.sort((a, b) => a.schoolsCount - b.schoolsCount);
      else list.sort((a, b) => a.totalCount - b.totalCount);
    } else {
      list.sort((a, b) => a.wardCode.localeCompare(b.wardCode));
    }

    return list;
  }, [wardRows, metricView, sortOrder, selectedWardCode]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-title">{data.displayName} ({data.localities.split(',')[0]})</p>
          <p className="tooltip-sub">Population: {data.population?.toLocaleString('en-IN')} people</p>
          <hr className="tooltip-divider" />
          <p className="tooltip-val text-rose">Healthcare Units: <strong>{data.healthcareCount}</strong></p>
          <p className="tooltip-val text-emerald">Schools: <strong>{data.schoolsCount}</strong></p>
          <p className="tooltip-val text-dark">Total Facilities: <strong>{data.totalCount}</strong></p>
          <p className="tooltip-hint">Click bar to select Ward {data.wardCode}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <article className="chart-card-panel" aria-label="Ward-wise Service Availability Chart">
      <div className="chart-card-header">
        <div className="chart-title-wrap">
          <BarChart2 size={18} className="text-teal" />
          <div>
            <h3 className="chart-title">Total Clinics &amp; Schools by Ward</h3>
            <p className="chart-subtitle">Total count of clinics and schools located in each ward</p>
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
              {sortOrder === 'desc' ? 'High → Low' : sortOrder === 'asc' ? 'Low → High' : 'A → Z'}
            </span>
          </button>
        </div>
      </div>

      <div className="chart-container-inner" style={{ height: 480 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 15, bottom: 20 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload[0]) {
                onSelectWard(state.activePayload[0].payload.wardCode);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="wardCode"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />

            {(metricView === 'both' || metricView === 'health') && (
              <Bar
                dataKey="healthcareCount"
                name="Healthcare Units"
                fill="#e11d48"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
              />
            )}

            {(metricView === 'both' || metricView === 'schools') && (
              <Bar
                dataKey="schoolsCount"
                name="Schools (Primary & Secondary)"
                fill="#059669"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
