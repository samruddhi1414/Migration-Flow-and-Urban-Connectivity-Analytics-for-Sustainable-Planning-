import React from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  FileSpreadsheet, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function DataQualityPanel({
  isOpen,
  onClose,
  summary,
  mappedCount
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Data Provenance, Quality & Census Hierarchy
              </h2>
              <p className="text-xs text-slate-400">
                Data lineage, validation metrics, and dataset boundaries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          
          {/* Provenance Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Village Dataset</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">{summary.totalVillages.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Sheet: Village_Data_2700 (33 districts)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Town Dataset</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">{summary.totalTowns} Towns</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Sheet: Town_2700 (35 districts)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Migration Records</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">5.74 Cr Migrants</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Census 2011 Table D-03</p>
            </div>
          </div>

          {/* Categorical Breakdown Table */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Data Classification & Derivation Traceability
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-white block mb-1">1. Empirical Source Data:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Direct Census records without interpolation: Households, Resident population, Road distances to District/Sub-district HQs, Availability status flags (1=Available, 2=Not Available).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-white block mb-1">2. Calculated District Indicators:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Aggregated rates: % habitations with all-weather roads, % public bus coverage, hospital bed-to-population ratios, population per road kilometre.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-white block mb-1">3. Derived Analytical Indices:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Normalized multi-criteria composite scores (0–100 Movement Demand Index, 0–100 Infrastructure Capacity Index, Infrastructure Pressure Proxy).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-white block mb-1">4. Planning Interpretations:</strong>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Evidence-based policy directives generated by identifying specific utility deficits and supply-demand mismatches for regional town planning.
                </p>
              </div>
            </div>
          </div>

          {/* Spatial Mapping Traceability */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Spatial Boundary Alignment</span>
              <span className="font-mono text-xs text-emerald-400 font-bold">{mappedCount} / {summary.districtsAnalyzed} Successfully Joined</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              GeoJSON polygons from <code className="text-slate-300">maharashtra_districts.geojson</code> are joined via Census 2011 3-digit district codes (497 to 531) with canonical name aliases. Mumbai Suburban (Code 518) and Mumbai City (Code 519) are preserved, and Palghar (Code 732, bifurcated from Thane in 2014) is seamlessly aligned with explicit attribution.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Data Panel
          </button>
        </div>

      </div>
    </div>
  );
}
