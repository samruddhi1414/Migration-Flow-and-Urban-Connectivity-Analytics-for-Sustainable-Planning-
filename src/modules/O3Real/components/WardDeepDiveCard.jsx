import React from 'react';
import { 
  Building2, 
  GraduationCap, 
  MapPin, 
  Users, 
  X,
  Compass,
  Bed,
  Trees,
  TrendingDown,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

export default function WardDeepDiveCard({
  wardRow,
  cityBenchmarks,
  onClose,
  onViewOnMap
}) {
  if (!wardRow) return null;

  const {
    wardCode,
    displayName,
    zone,
    localities,
    population,
    areaKm2,
    density,
    healthcareCount,
    schoolsCount,
    parksCount,
    bedsCount,
    healthcarePer10k,
    schoolsPer10k,
    healthTypes = {},
    schoolTypes = {},
    nearestHealthMeters,
    nearestSchoolMeters
  } = wardRow;

  // UDPFI Benchmark comparison
  const requiredDispensaries = Math.ceil(population / 15000);
  const actualDispensaries = (healthTypes['Dispensary'] || 0) + (healthTypes['UPHC'] || 0);
  const healthDeficit = requiredDispensaries - actualDispensaries;

  const requiredSchools = Math.ceil(population / 4000);
  const actualSchools = schoolsCount;
  const schoolDeficit = requiredSchools - actualSchools;

  // Walk time estimation (assuming 4.5 km/h walking speed = 75 meters/min)
  const healthWalkMin = nearestHealthMeters != null ? Math.round(nearestHealthMeters / 75) : null;
  const schoolWalkMin = nearestSchoolMeters != null ? Math.round(nearestSchoolMeters / 75) : null;

  // Compare against city benchmark
  const healthDiffPct = cityBenchmarks?.cityHealthPer10k 
    ? (((healthcarePer10k - cityBenchmarks.cityHealthPer10k) / cityBenchmarks.cityHealthPer10k) * 100).toFixed(0)
    : 0;

  const schoolDiffPct = cityBenchmarks?.citySchoolsPer10k
    ? (((schoolsPer10k - cityBenchmarks.citySchoolsPer10k) / cityBenchmarks.citySchoolsPer10k) * 100).toFixed(0)
    : 0;

  // Composite Equity Rating
  let equityTier = 'Good Access';
  let equityBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (healthcarePer10k < (cityBenchmarks?.cityHealthPer10k * 0.7) && schoolsPer10k < (cityBenchmarks?.citySchoolsPer10k * 0.7)) {
    equityTier = 'High Shortage';
    equityBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (healthcarePer10k < cityBenchmarks?.cityHealthPer10k || schoolsPer10k < cityBenchmarks?.citySchoolsPer10k) {
    equityTier = 'Moderate Shortage';
    equityBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <div className="ward-deep-dive-panel border border-slate-200 bg-white rounded-2xl p-6 shadow-md text-slate-800 mb-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              {zone}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${equityBadgeClass}`}>
              {equityTier}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Ward {wardCode}
            <span className="text-slate-500 font-medium text-lg">— {displayName}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Key Areas: {localities || 'Municipal Area'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onViewOnMap && (
            <button
              type="button"
              onClick={onViewOnMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Show on Map</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close Ward Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-medium">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Population</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{population.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500">{density.toLocaleString('en-IN')} people/km²</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-medium">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Healthcare</span>
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-baseline gap-1.5">
            <span>{healthcareCount}</span>
            <span className="text-xs font-normal text-slate-500">({healthcarePer10k}/10k)</span>
          </div>
          <div className={`text-[11px] flex items-center gap-1 font-medium ${Number(healthDiffPct) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {Number(healthDiffPct) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{healthDiffPct}% vs Mumbai Avg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-medium">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Schools</span>
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-baseline gap-1.5">
            <span>{schoolsCount}</span>
            <span className="text-xs font-normal text-slate-500">({schoolsPer10k}/10k)</span>
          </div>
          <div className={`text-[11px] flex items-center gap-1 font-medium ${Number(schoolDiffPct) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {Number(schoolDiffPct) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{schoolDiffPct}% vs Mumbai Avg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-medium">
            <Bed className="w-3.5 h-3.5 text-purple-600" />
            <span>Beds &amp; Parks</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{bedsCount.toLocaleString('en-IN')} beds</div>
          <div className="text-[11px] text-slate-500">{parksCount} public parks</div>
        </div>
      </div>

      {/* Detailed Facility Breakdown Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Healthcare Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
          <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Healthcare Breakdown</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Dispensaries &amp; Outpatient Clinics</span>
              <span className="font-semibold text-slate-900">{healthTypes['Dispensary'] || 0} units</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Primary Health Clinics (UPHC)</span>
              <span className="font-semibold text-slate-900">{healthTypes['UPHC'] || 0} units</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Public Hospitals</span>
              <span className="font-semibold text-slate-900">{healthTypes['Public Hospital'] || 0} units</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Maternity Homes</span>
              <span className="font-semibold text-slate-900">{healthTypes['Maternity Home'] || 0} units</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Average Walk to Nearest Clinic</span>
              <span className="font-semibold text-slate-900">
                {nearestHealthMeters ? `${nearestHealthMeters} m (~${healthWalkMin} min walk)` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* School Breakdown */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>School Breakdown</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">BMC Municipal Schools</span>
              <span className="font-semibold text-slate-900">{schoolTypes['Municipal'] || 0} schools</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Government-Aided Schools</span>
              <span className="font-semibold text-slate-900">{schoolTypes['Aided'] || 0} schools</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Private Schools</span>
              <span className="font-semibold text-slate-900">{schoolTypes['Unaided'] || 0} schools</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-600">Public Municipal Share</span>
              <span className="font-semibold text-slate-900">
                {schoolsCount > 0 ? `${(((schoolTypes['Municipal'] || 0) / schoolsCount) * 100).toFixed(0)}%` : '0%'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-600">Average Walk to Nearest School</span>
              <span className="font-semibold text-slate-900">
                {nearestSchoolMeters ? `${nearestSchoolMeters} m (~${schoolWalkMin} min walk)` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UDPFI Planning Compliance Box */}
      <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3 max-w-xl">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">
              National Urban Planning Guidelines Check
            </h4>
            <p className="text-xs text-amber-950/80 leading-relaxed">
              {healthDeficit > 0 
                ? `Ward ${wardCode} needs ${healthDeficit} more clinics to meet national standards (1 clinic for every 15,000 residents).`
                : `Ward ${wardCode} meets national clinic standards.`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">Clinic Standard</span>
            <span className={`font-bold ${healthDeficit <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {healthDeficit <= 0 ? 'Standard Met ✓' : `Shortage: -${healthDeficit} Clinics`}
            </span>
          </div>
          <div className="text-right pl-3 border-l border-amber-200">
            <span className="text-slate-500 block text-[11px]">School Standard</span>
            <span className={`font-bold ${schoolDeficit <= 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
              {schoolDeficit <= 0 ? 'Standard Met ✓' : `Shortage: -${schoolDeficit} Schools`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
