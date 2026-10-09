import React from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  SlidersHorizontal, 
  BookOpen, 
  Database, 
  AlertCircle, 
  Search,
  Sparkles,
  Info
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  showFilters,
  setShowFilters,
  setShowMethodology,
  setShowDataQuality,
  setShowWeightAdjuster,
  searchQuery,
  setSearchQuery,
  districtsCount,
  mappedCount
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0e304f] text-white shadow-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
          
          {/* Logo & Title */}
          <div>
            <div className="text-[11px] font-bold text-sky-300 tracking-wider uppercase mb-1 flex items-center gap-2">
              <span>CEP · DATA ANALYTICS · MAHARASHTRA</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Maharashtra Infrastructure & Movement Demand
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              Evidence → Insight → Planning
            </p>
          </div>

          {/* Right-aligned Dataset Badges & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* Search Input */}
            <div className="relative min-w-[160px] sm:min-w-[190px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search district..."
                className="w-full pl-8 pr-3 py-1.5 bg-navy-800/80 border border-slate-600/70 rounded-lg text-xs text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pill Dataset Tag matching the reference image badge */}
            <div className="hidden xl:flex items-center px-3 py-1.5 rounded-full border border-sky-400/40 bg-sky-950/40 text-[11px] font-semibold text-sky-200 tracking-wide">
              CENSUS 2011 · DCHB 2700 · TABLE D-03
            </div>

            {/* Interactive Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                showFilters 
                  ? 'bg-sky-500 text-white border-sky-400 shadow-sm' 
                  : 'bg-navy-800/80 text-slate-200 hover:bg-navy-800 border-slate-600/70 hover:text-white'
              }`}
              title="Toggle interactive multi-criteria filter bar"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Model Weights Adjuster Trigger */}
            <button
              onClick={() => setShowWeightAdjuster(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-800/80 text-purple-200 hover:bg-navy-800 border border-purple-500/50 hover:text-white text-xs font-semibold transition-all"
              title="Simulate custom index weights and observe sensitivity"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Model Weights</span>
            </button>

            {/* Methodology Modal Trigger */}
            <button
              onClick={() => setShowMethodology(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-800/80 text-slate-200 hover:bg-navy-800 border border-slate-600/70 hover:text-white text-xs font-semibold transition-all"
              title="View transparent equations, proxies, and formulas"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Methodology</span>
            </button>

            {/* Data Quality Report Trigger */}
            <button
              onClick={() => setShowDataQuality(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-800/80 text-emerald-200 hover:bg-navy-800 border border-emerald-500/40 hover:text-white text-xs font-semibold transition-all"
              title="View data provenance and dataset integrity metrics"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">{mappedCount}/{districtsCount} Districts</span>
            </button>

          </div>

        </div>

      </div>
    </header>
  );
}
