import React from 'react';
import { 
  X, 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Check, 
  Info,
  Scale
} from 'lucide-react';
import { DEFAULT_DEMAND_WEIGHTS } from '../utils/demandIndex';
import { DEFAULT_INFRA_WEIGHTS } from '../utils/infrastructureIndex';

export default function WeightAdjusterModal({
  isOpen,
  onClose,
  demandWeights = DEFAULT_DEMAND_WEIGHTS,
  setDemandWeights,
  capacityWeights = DEFAULT_INFRA_WEIGHTS,
  setCapacityWeights,
  onResetWeights
}) {
  if (!isOpen) return null;

  const dWeights = {
    migrationPressure: demandWeights?.migrationPressure ?? 0.50,
    populationDensity: demandWeights?.populationDensity ?? 0.30,
    populationGrowth: demandWeights?.populationGrowth ?? 0.20,
    ...demandWeights
  };

  const cWeights = {
    transport: capacityWeights?.transport ?? 0.35,
    essentialServices: capacityWeights?.essentialServices ?? 0.25,
    waterSanitation: capacityWeights?.waterSanitation ?? 0.20,
    connectivity: capacityWeights?.connectivity ?? 0.10,
    urbanSupport: capacityWeights?.urbanSupport ?? 0.10,
    ...capacityWeights
  };

  const totalDemand = ((dWeights.migrationPressure || 0) + (dWeights.populationDensity || 0) + (dWeights.populationGrowth || 0)) * 100;
  const totalCapacity = ((cWeights.transport || 0) + (cWeights.essentialServices || 0) + (cWeights.waterSanitation || 0) + (cWeights.connectivity || 0) + (cWeights.urbanSupport || 0)) * 100;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden z-[10000]">
        
        {/* Header */}
        <div className="p-5 bg-[#0e304f] text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 rounded-xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Live Index Weighting & Sensitivity Simulation
              </h2>
              <p className="text-xs text-slate-300">
                Interactively calibrate analytical weights to test model sensitivity during project evaluation
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm bg-[#f4f7fa]">
          
          <div className="callout-box">
            <div className="flex items-center gap-2 font-bold text-[#0e7490] text-xs mb-1">
              <Info className="w-4 h-4 text-[#0e7490]" />
              <span>Sensitivity Simulation</span>
            </div>
            <p className="text-xs text-slate-700">
              Adjusting these weights recalculates the <strong>Movement Demand Index</strong>, <strong>Infrastructure Capacity Index</strong>, and <strong>Pressure Proxy Score</strong> across all 36 districts in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Demand Weights */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                  Movement Demand Weights
                </h3>
                <span className="font-mono text-xs font-bold text-[#0e304f]">Total: {totalDemand.toFixed(0)}%</span>
              </div>

              {/* Migration */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Migration Pressure</span>
                  <span className="font-mono font-bold text-sky-700">{((dWeights.migrationPressure || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(dWeights.migrationPressure || 0) * 100}
                  onChange={(e) => setDemandWeights(prev => ({ ...prev, migrationPressure: parseFloat(e.target.value) / 100 }))}
                  className="w-full accent-[#0e304f] bg-slate-200 h-1.5 rounded-lg"
                />
              </div>

              {/* Density */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Population Density</span>
                  <span className="font-mono font-bold text-sky-700">{((dWeights.populationDensity || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(dWeights.populationDensity || 0) * 100}
                  onChange={(e) => setDemandWeights(prev => ({ ...prev, populationDensity: parseFloat(e.target.value) / 100 }))}
                  className="w-full accent-[#0e304f] bg-slate-200 h-1.5 rounded-lg"
                />
              </div>

              {/* Growth */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Population Growth</span>
                  <span className="font-mono font-bold text-sky-700">{((dWeights.populationGrowth || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(dWeights.populationGrowth || 0) * 100}
                  onChange={(e) => setDemandWeights(prev => ({ ...prev, populationGrowth: parseFloat(e.target.value) / 100 }))}
                  className="w-full accent-[#0e304f] bg-slate-200 h-1.5 rounded-lg"
                />
              </div>
            </div>

            {/* Capacity Weights */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Infrastructure Capacity Weights
                </h3>
                <span className="font-mono text-xs font-bold text-[#0e304f]">Total: {totalCapacity.toFixed(0)}%</span>
              </div>

              {/* Transport */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Transport & Road Reach</span>
                  <span className="font-mono font-bold text-emerald-700">{((cWeights.transport || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(cWeights.transport || 0) * 100}
                  onChange={(e) => setCapacityWeights(prev => ({ ...prev, transport: parseFloat(e.target.value) / 100 }))}
                  className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg"
                />
              </div>

              {/* Essential Services */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Essential Services (Health/Edu/Bank)</span>
                  <span className="font-mono font-bold text-emerald-700">{((cWeights.essentialServices || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(cWeights.essentialServices || 0) * 100}
                  onChange={(e) => setCapacityWeights(prev => ({ ...prev, essentialServices: parseFloat(e.target.value) / 100 }))}
                  className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg"
                />
              </div>

              {/* Water & Sanitation */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Water & Sanitation Systems</span>
                  <span className="font-mono font-bold text-emerald-700">{((cWeights.waterSanitation || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(cWeights.waterSanitation || 0) * 100}
                  onChange={(e) => setCapacityWeights(prev => ({ ...prev, waterSanitation: parseFloat(e.target.value) / 100 }))}
                  className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg"
                />
              </div>

              {/* Connectivity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Digital & Telecommunication (Mobile/CSC)</span>
                  <span className="font-mono font-bold text-emerald-700">{((cWeights.connectivity || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(cWeights.connectivity || 0) * 100}
                  onChange={(e) => setCapacityWeights(prev => ({ ...prev, connectivity: parseFloat(e.target.value) / 100 }))}
                  className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg"
                />
              </div>

              {/* Urban Support */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Urban Support Infrastructure</span>
                  <span className="font-mono font-bold text-emerald-700">{((cWeights.urbanSupport || 0) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(cWeights.urbanSupport || 0) * 100}
                  onChange={(e) => setCapacityWeights(prev => ({ ...prev, urbanSupport: parseFloat(e.target.value) / 100 }))}
                  className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onResetWeights}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Model</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0e304f] hover:bg-navy-800 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
}
