import React from 'react';
import { Users, MapPin, Activity, GraduationCap, HeartPulse, BookOpen, Info } from 'lucide-react';

export default function KPICards({
  benchmarks,
  selectedWardRow,
  selectedWardCode
}) {
  const isWardFiltered = selectedWardCode !== 'ALL' && selectedWardRow != null;

  const population = isWardFiltered
    ? selectedWardRow.population
    : benchmarks?.totalPopulation;

  const validUnits = isWardFiltered
    ? `Ward ${selectedWardRow.wardCode}`
    : `${benchmarks?.totalWards || 24} Wards`;

  const healthcareCount = isWardFiltered
    ? selectedWardRow.healthcareCount
    : benchmarks?.totalHealthcare;

  const schoolsCount = isWardFiltered
    ? selectedWardRow.schoolsCount
    : benchmarks?.totalSchools;

  const healthRate = isWardFiltered
    ? selectedWardRow.healthcarePer10k
    : benchmarks?.cityHealthPer10k;

  const schoolRate = isWardFiltered
    ? selectedWardRow.schoolsPer10k
    : benchmarks?.citySchoolsPer10k;

  const formatNum = (val) => {
    if (val == null || isNaN(val)) return 'Unavailable';
    return Number(val).toLocaleString('en-IN');
  };

  const cards = [
    {
      id: 'pop',
      label: isWardFiltered ? `Population (${selectedWardRow.wardCode})` : 'Total Population',
      value: formatNum(population),
      subtext: isWardFiltered
        ? `${((population / (benchmarks?.totalPopulation || 1)) * 100).toFixed(1)}% of Mumbai population`
        : '~1.24 Crore residents (Census 2011)',
      icon: Users,
      color: 'teal',
      tooltip: 'Total residents living in this area based on official Census data.'
    },
    {
      id: 'units',
      label: 'Geographic Area',
      value: validUnits,
      subtext: isWardFiltered
        ? `${selectedWardRow.zone} • ${selectedWardRow.areaKm2} sq km`
        : 'All 24 BMC administrative wards',
      icon: MapPin,
      color: 'navy',
      tooltip: 'Mumbai is divided into 24 administrative wards (A to T).'
    },
    {
      id: 'health-count',
      label: isWardFiltered ? `Clinics (${selectedWardRow.wardCode})` : 'Clinics & Hospitals',
      value: formatNum(healthcareCount),
      subtext: isWardFiltered
        ? `${selectedWardRow.healthTypes?.['Public Hospital'] || 0} Hosp, ${selectedWardRow.healthTypes?.['Dispensary'] || 0} Disp, ${selectedWardRow.healthTypes?.['UPHC'] || 0} UPHC`
        : 'Public hospitals, dispensaries & clinics',
      icon: Activity,
      color: 'cyan',
      tooltip: 'All verified public healthcare clinics and hospitals.'
    },
    {
      id: 'school-count',
      label: isWardFiltered ? `Schools (${selectedWardRow.wardCode})` : 'Total Schools',
      value: formatNum(schoolsCount),
      subtext: isWardFiltered
        ? `${selectedWardRow.schoolTypes?.['Municipal'] || 0} Municipal, ${selectedWardRow.schoolTypes?.['Unaided'] || 0} Private, ${selectedWardRow.schoolTypes?.['Aided'] || 0} Aided`
        : 'Municipal, private, and aided schools',
      icon: GraduationCap,
      color: 'emerald',
      tooltip: 'All primary and secondary schools.'
    },
    {
      id: 'health-rate',
      label: 'Clinics per 10,000 People',
      value: healthRate != null ? healthRate : 'Unavailable',
      subtext: isWardFiltered
        ? `City Average: ${benchmarks?.cityHealthPer10k || 0.37} per 10k`
        : 'About 1 clinic for every 27,000 people',
      icon: HeartPulse,
      color: 'blue',
      tooltip: 'Shows how many clinics are available for every 10,000 residents in the ward.'
    },
    {
      id: 'school-rate',
      label: 'Schools per 10,000 People',
      value: schoolRate != null ? schoolRate : 'Unavailable',
      subtext: isWardFiltered
        ? `City Average: ${benchmarks?.citySchoolsPer10k || 1.81} per 10k`
        : 'About 1 school for every 5,500 people',
      icon: BookOpen,
      color: 'amber',
      tooltip: 'Shows how many schools are available for every 10,000 residents in the ward.'
    }
  ];

  return (
    <section className="kpi-grid-container" aria-label="Key Performance Indicators">
      {cards.map(c => {
        const IconComp = c.icon;
        return (
          <article key={c.id} className={`kpi-stat-card theme-${c.color}`}>
            <div className="kpi-top-row">
              <span className="kpi-title">{c.label}</span>
              <div className="tooltip-wrapper">
                <IconComp size={18} className="kpi-icon-pill" />
                <span className="tooltip-text">{c.tooltip}</span>
              </div>
            </div>

            <div className="kpi-metric-value">{c.value}</div>
            <div className="kpi-subnote">
              <Info size={11} className="subnote-info-icon" />
              <span>{c.subtext}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
