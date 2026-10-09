import React from 'react';
import { 
  X, 
  BookOpen, 
  Calculator, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Scale, 
  ShieldAlert, 
  Info,
  GraduationCap
} from 'lucide-react';

export default function MethodologyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden z-[10000]">
        
        {/* Modal Navy Header */}
        <div className="p-5 bg-[#0e304f] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500 rounded-xl text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Analytical Methodology & Mathematical Framework
              </h2>
              <p className="text-xs text-slate-300">
                Transparent computational model for Infrastructure Pressure Proxy and Sustainable Planning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed bg-[#f4f7fa]">
          
          {/* Analytical Caveat Callout */}
          <div className="callout-box">
            <div className="flex items-center gap-2 font-bold text-[#0e7490] text-sm mb-1">
              <ShieldAlert className="w-4 h-4 text-[#0e7490]" />
              <span>Core Analytical Caveat: Infrastructure Pressure Proxy</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              The Census 2011 and District Census Handbooks (DCHB) contain spatial settlement data and recorded physical facilities, but do not contain direct hourly vehicular traffic counts, passenger turnstile numbers, or dynamic road lane capacity. Therefore, this model calculates an <strong>“INFRASTRUCTURE PRESSURE PROXY”</strong> that systematically contrasts standardized demographic movement demand with recorded physical utility coverage.
            </p>
          </div>

          {/* 1. Movement Demand Index Model */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>A. Movement Demand Index (0–100 Normalized Scale)</span>
            </div>
            <p className="text-xs text-slate-600">
              The Movement Demand Index measures demographic mobility intensity by aggregating migration influx, spatial density, decadal growth, and employment commuting dependency:
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-[#0e304f] font-semibold overflow-x-auto">
              Demand Index = 0.40 × Norm(Migrant/Pop Ratio) + 0.25 × Norm(Pop Density) + 0.20 × Norm(Growth Rate) + 0.15 × Norm(Work Commute Ratio)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div>• <strong>Migration Pressure (40%):</strong> Table D-03 total migrant volume relative to district resident population.</div>
              <div>• <strong>Population Density (25%):</strong> Inhabitants per square kilometre across urban/rural settlements.</div>
              <div>• <strong>Population Growth (20%):</strong> Decadal intercensal population growth rate.</div>
              <div>• <strong>Mobility Dependency (15%):</strong> Work/Employment migration ratio and commuting distance.</div>
            </div>
          </div>

          {/* 2. Infrastructure Capacity Index Model */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>B. Infrastructure Capacity Index (0–100 Normalized Scale)</span>
            </div>
            <p className="text-xs text-slate-600">
              Aggregates village-level coverage rates (43,665 villages) and statutory town assets (535 towns):
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-emerald-800 font-semibold overflow-x-auto">
              Capacity Index = 0.30 × Road + 0.20 × Bus + 0.15 × Rail + 0.15 × Services + 0.10 × Water/Sanitation + 0.10 × Digital
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div>• <strong>Road Accessibility (30%):</strong> % all-weather roads & town pucca road density.</div>
              <div>• <strong>Public Transport (20%):</strong> % villages served by public bus (MSRTC) & town bus routes.</div>
              <div>• <strong>Railway Access (15%):</strong> Direct village station availability & town rail head distance.</div>
              <div>• <strong>Essential Services (15%):</strong> Schools, primary health centres, commercial banks, regular markets.</div>
              <div>• <strong>Water & Sanitation (10%):</strong> Treated tap water, pucca drainage, waste disposal systems.</div>
              <div>• <strong>Digital/Electricity (10%):</strong> Mobile network coverage, Common Service Centres (CSC), power connections.</div>
            </div>
          </div>

          {/* 3. Pressure Score & Classification */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <Scale className="w-4 h-4 text-rose-600" />
              <span>C. Infrastructure Pressure Score & Classification</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-rose-800 font-bold">
              Pressure Score = ((Movement Demand Index - Infrastructure Capacity Index) + 100) / 2
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                <div className="font-bold">0 – 20</div>
                <div className="text-[10px] text-emerald-600 font-medium">Adequate</div>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800">
                <div className="font-bold">21 – 40</div>
                <div className="text-[10px] text-cyan-600 font-medium">Moderate</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                <div className="font-bold">41 – 60</div>
                <div className="text-[10px] text-amber-600 font-medium">High Pressure</div>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">
                <div className="font-bold">61 – 80</div>
                <div className="text-[10px] text-orange-600 font-medium">Very High</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                <div className="font-bold">81 – 100</div>
                <div className="text-[10px] text-rose-600 font-medium">Critical</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0e304f] hover:bg-navy-800 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            Close Methodology Window
          </button>
        </div>

      </div>
    </div>
  );
}
