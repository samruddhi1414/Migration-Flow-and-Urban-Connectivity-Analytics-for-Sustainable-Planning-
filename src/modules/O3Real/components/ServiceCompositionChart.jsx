import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

export default function ServiceCompositionChart({
  healthComposition,
  schoolComposition
}) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-title">{d.name}</p>
          <hr className="tooltip-divider" />
          <p className="tooltip-val" style={{ color: d.payload.color }}>
            Count: <strong>{d.value} facilities</strong>
          </p>
          <p className="tooltip-sub">
            Share: <strong>{((d.value / d.payload.total) * 100).toFixed(1)}% of total</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalHealth = healthComposition?.reduce((s, c) => s + c.count, 0) || 1;
  const enrichedHealth = (healthComposition || []).map(c => ({ ...c, total: totalHealth }));

  const totalSchools = schoolComposition?.reduce((s, c) => s + c.count, 0) || 1;
  const enrichedSchools = (schoolComposition || []).map(c => ({ ...c, total: totalSchools }));

  return (
    <article className="chart-card-panel" aria-label="Service Composition Donut Charts">
      <div className="chart-card-header">
        <div className="chart-title-wrap">
          <PieIcon size={18} className="text-teal" />
          <div>
            <h3 className="chart-title">Types of Clinics &amp; Schools</h3>
            <p className="chart-subtitle">
              Breakdown of clinic types and school types across Mumbai
            </p>
          </div>
        </div>
      </div>

      <div className="composition-donuts-grid">
        {/* Healthcare Donut */}
        <div className="donut-subcolumn">
          <div className="donut-header">
            <h4>Healthcare Types ({totalHealth} Total)</h4>
            <span className="donut-subtitle">Hospitals, Dispensaries &amp; Clinics</span>
          </div>

          <div style={{ flex: 1, minHeight: 385, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 0, bottom: 6, left: 0 }}>
                <Pie
                  data={enrichedHealth}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="40%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {enrichedHealth.map((entry, index) => (
                    <Cell key={`cell-h-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  height={95}
                  wrapperStyle={{ fontSize: 11, lineHeight: '20px', width: '100%', bottom: 2 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Donut */}
        <div className="donut-subcolumn">
          <div className="donut-header">
            <h4>School Types ({totalSchools} Total)</h4>
            <span className="donut-subtitle">Government, Private &amp; Aided</span>
          </div>

          <div style={{ flex: 1, minHeight: 385, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 0, bottom: 6, left: 0 }}>
                <Pie
                  data={enrichedSchools}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="40%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {enrichedSchools.map((entry, index) => (
                    <Cell key={`cell-s-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  height={95}
                  wrapperStyle={{ fontSize: 11, lineHeight: '20px', width: '100%', bottom: 2 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Institutional Callout */}
      <div className="zone-chart-callout" style={{ borderLeftColor: '#0d9488' }}>
        <PieIcon size={16} style={{ color: '#0d9488', flexShrink: 0, marginTop: 2 }} />
        <p>
          <strong>Institutional Distribution:</strong> Municipal (BMC) dispensaries and primary clinics handle 70%+ of public visits, while BMC schools serve as the essential educational baseline across vulnerable wards.
        </p>
      </div>
    </article>
  );
}
