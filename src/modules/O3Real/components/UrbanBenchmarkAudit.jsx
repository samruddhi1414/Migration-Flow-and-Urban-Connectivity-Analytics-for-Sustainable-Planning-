import React from 'react';
import { 
  Building2, 
  GraduationCap, 
  Bed, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

export default function UrbanBenchmarkAudit({
  wardRows = [],
  cityBenchmarks
}) {
  if (!wardRows || wardRows.length === 0) return null;

  const totalPop = cityBenchmarks?.totalPopulation || 12442373;
  const totalHealth = cityBenchmarks?.totalHealthcare || 459;
  const totalSchools = cityBenchmarks?.totalSchools || 2247;
  const totalBeds = wardRows.reduce((sum, w) => sum + (w.bedsCount || 0), 0);

  // UDPFI Benchmark 1: 1 Dispensary per 15,000 people
  const requiredDispensaries = Math.ceil(totalPop / 15000); // ~830
  const actualDispensaries = wardRows.reduce((sum, w) => 
    sum + (w.healthTypes?.['Dispensary'] || 0) + (w.healthTypes?.['UPHC'] || 0), 0
  );
  const healthDeficit = requiredDispensaries - actualDispensaries;
  const healthCompliancePct = Math.min(100, Math.round((actualDispensaries / requiredDispensaries) * 100));

  // UDPFI Benchmark 2: 1 Primary/Secondary School per 4,000 people
  const requiredSchools = Math.ceil(totalPop / 4000); // ~3,110
  const actualSchools = totalSchools;
  const schoolDeficit = requiredSchools - actualSchools;
  const schoolCompliancePct = Math.min(100, Math.round((actualSchools / requiredSchools) * 100));

  // WHO Benchmark 3: 30 Hospital Beds per 10,000 people (3 beds per 1,000)
  const requiredBeds = Math.ceil((totalPop / 10000) * 30);
  const actualBeds = totalBeds;
  const bedsDeficit = Math.max(0, requiredBeds - actualBeds);
  const bedsCompliancePct = Math.min(100, Math.round((actualBeds / (requiredBeds || 1)) * 100));

  // Count how many wards fail each standard
  const wardsFailingHealth = wardRows.filter(w => {
    const needed = Math.ceil(w.population / 15000);
    const actual = (w.healthTypes?.['Dispensary'] || 0) + (w.healthTypes?.['UPHC'] || 0);
    return actual < needed;
  }).length;

  const wardsFailingSchools = wardRows.filter(w => {
    const needed = Math.ceil(w.population / 4000);
    return w.schoolsCount < needed;
  }).length;

  return (
    <div className="urban-benchmark-audit border border-slate-200 bg-white rounded-2xl p-6 shadow-sm text-slate-800 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            City Facilities vs. National Guidelines
          </h3>
          <p className="text-xs text-slate-500">
            Comparing Mumbai's clinics, schools, and hospital beds against official guidelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Healthcare Clinics */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Primary Health Clinics</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {healthCompliancePct}% Met
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 mb-1">
            {actualDispensaries} <span className="text-xs font-normal text-slate-500">/ {requiredDispensaries} required</span>
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            Standard: <strong>1 clinic for every 15,000 residents</strong>. Mumbai has a city-wide shortage of <strong className="text-rose-600">-{healthDeficit} clinics</strong>.
          </p>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
            <div 
              className="h-full bg-teal-600 rounded-full" 
              style={{ width: `${healthCompliancePct}%` }}
            />
          </div>

          <div className="text-[11px] text-rose-700 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{wardsFailingHealth} of 24 wards have a clinic shortage</span>
          </div>
        </div>

        {/* Metric 2: Primary & Secondary Schools */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Schools</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {schoolCompliancePct}% Met
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 mb-1">
            {actualSchools} <span className="text-xs font-normal text-slate-500">/ {requiredSchools} required</span>
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            Standard: <strong>1 school for every 4,000 residents</strong>. Mumbai needs <strong className="text-amber-700">+{schoolDeficit} more schools</strong> to meet the standard.
          </p>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
            <div 
              className="h-full bg-emerald-600 rounded-full" 
              style={{ width: `${schoolCompliancePct}%` }}
            />
          </div>

          <div className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{wardsFailingSchools} of 24 wards have a school shortage</span>
          </div>
        </div>

        {/* Metric 3: Hospital Beds */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-800 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-purple-600" />
              <span>Hospital Beds</span>
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              {bedsCompliancePct}% of Target
            </span>
          </div>

          <div className="text-2xl font-black text-slate-900 mb-1">
            {actualBeds.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">recorded beds</span>
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            Guideline: <strong>30 beds per 10,000 people</strong>. Most beds are in South Mumbai hospitals, leaving suburbs with fewer beds.
          </p>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
            <div 
              className="h-full bg-purple-600 rounded-full" 
              style={{ width: `${bedsCompliancePct}%` }}
            />
          </div>

          <div className="text-[11px] text-purple-700 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Most beds are concentrated in South Mumbai wards (Ward D, Ward E, Ward F/S)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
