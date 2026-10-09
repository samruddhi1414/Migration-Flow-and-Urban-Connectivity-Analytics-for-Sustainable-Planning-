import React, { useState, useMemo } from 'react';
import Header from './Header';
import KpiCards from './KpiCards';
import Filters from './Filters';
import PressureMap from './PressureMap';
import DemandCapacityScatter from './DemandCapacityScatter';
import MigrationAnalysis from './MigrationAnalysis';
import TransportAnalysis from './TransportAnalysis';
import InfrastructureMatrix from './InfrastructureMatrix';
import SustainabilityAnalysis from './SustainabilityAnalysis';
import PriorityDistricts from './PriorityDistricts';
import DistrictDeepDive from './DistrictDeepDive';
import MethodologyModal from './MethodologyModal';
import DataQuality from './DataQuality';
import WeightAdjusterModal from './WeightAdjusterModal';

import { computeStateSummary } from '../utils/districtAggregator';
import { calculateMovementDemandIndex, DEFAULT_DEMAND_WEIGHTS } from '../utils/demandIndex';
import { calculateInfrastructureIndex, DEFAULT_INFRA_WEIGHTS } from '../utils/infrastructureIndex';
import { calculatePressureScore } from '../utils/pressureScore';
import { calculateDistrictSustainability } from '../utils/sustainabilityScore';
import { generatePlanningRecommendation } from '../utils/recommendations';
import { validateDistrictDataset } from '../utils/validation';

import { 
  LayoutDashboard, 
  MapPin, 
  Compass, 
  Users2, 
  Truck, 
  Table, 
  Leaf, 
  AlertOctagon,
  Sparkles
} from 'lucide-react';

export default function Dashboard({ initialData, metadata }) {
  const [baseDistricts, setBaseDistricts] = useState(initialData || []);
  const [demandWeights, setDemandWeights] = useState(DEFAULT_DEMAND_WEIGHTS);
  const [infraWeights, setInfraWeights] = useState(DEFAULT_INFRA_WEIGHTS);

  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showDataQuality, setShowDataQuality] = useState(false);
  const [showWeightAdjuster, setShowWeightAdjuster] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    selectedDistrict: 'All',
    demographicScope: 'Total',
    pressureCategory: 'All',
    sustainabilityCategory: 'All',
    migrationReason: 'All',
    infrastructureFocus: 'All'
  });

  // Dynamically recompute indices when weights change
  const weightedDistricts = useMemo(() => {
    if (!baseDistricts || baseDistricts.length === 0) return [];

    const demandResults = calculateMovementDemandIndex(baseDistricts, demandWeights);
    const infraResults = calculateInfrastructureIndex(baseDistricts, infraWeights);

    const recomputed = baseDistricts.map((d, i) => {
      const dRes = demandResults[i];
      const iRes = infraResults[i];
      const pRes = calculatePressureScore(dRes.demandIndex, iRes.infrastructureIndex);
      const sRes = calculateDistrictSustainability(d);
      const rRes = generatePlanningRecommendation({
        ...d,
        demandIndex: dRes.demandIndex,
        infrastructureIndex: iRes.infrastructureIndex,
        sustainabilityScore: sRes.sustainabilityScore,
        transportScore: iRes.subScores.transport,
        servicesScore: iRes.subScores.essentialServices,
        waterSanitationScore: iRes.subScores.waterSanitation,
        connectivityScore: iRes.subScores.connectivity
      });

      return {
        ...d,
        demandIndex: dRes.demandIndex,
        infrastructureIndex: iRes.infrastructureIndex,
        pressureScore: pRes.pressureScore,
        sustainabilityScore: sRes.sustainabilityScore,
        pressureCategory: pRes.pressureCategory,
        sustainabilityCategory: sRes.sustainabilityCategory,
        scatterZone: pRes.scatterZone,
        mainPressure: rRes.mainPressure,
        recommendation: rRes.recommendation,
        transportScore: iRes.subScores.transport,
        servicesScore: iRes.subScores.essentialServices,
        waterSanitationScore: iRes.subScores.waterSanitation,
        connectivityScore: iRes.subScores.connectivity,
        urbanSupportScore: iRes.subScores.urbanSupport,
        indices: {
          movementDemandIndex: dRes.demandIndex,
          infrastructureCapacityIndex: iRes.infrastructureIndex,
          pressureScore: pRes.pressureScore,
          sustainabilityScore: sRes.sustainabilityScore,
          pressureCategory: pRes.pressureCategory,
          sustainabilityCategory: sRes.sustainabilityCategory,
          scatterZone: pRes.scatterZone,
          mainPressure: rRes.mainPressure,
          recommendedAction: rRes.recommendation
        }
      };
    });

    recomputed.sort((a, b) => b.pressureScore - a.pressureScore);
    recomputed.forEach((d, idx) => {
      d.rank = idx + 1;
      d.indices.pressureRank = idx + 1;
    });

    // Validate
    validateDistrictDataset(recomputed);

    return recomputed;
  }, [baseDistricts, demandWeights, infraWeights]);

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    return weightedDistricts.filter(d => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = d.districtName.toLowerCase().includes(q);
        const matchCode = d.districtCode.includes(q);
        if (!matchName && !matchCode) return false;
      }

      if (filters.selectedDistrict !== 'All' && d.districtCode !== filters.selectedDistrict) {
        return false;
      }

      if (filters.demographicScope === 'Rural' && (d.demographics?.urbanPercentage || 0) > 50) {
        return false;
      }
      if (filters.demographicScope === 'Urban' && (d.demographics?.urbanPercentage || 0) <= 50) {
        return false;
      }

      if (filters.pressureCategory !== 'All' && d.pressureCategory !== filters.pressureCategory) {
        return false;
      }

      if (filters.sustainabilityCategory !== 'All' && d.sustainabilityCategory !== filters.sustainabilityCategory) {
        return false;
      }

      return true;
    });
  }, [weightedDistricts, searchQuery, filters]);

  // Summary Metrics
  const summary = useMemo(() => {
    const s = computeStateSummary(filteredDistricts);
    if (filteredDistricts.length > 0) {
      const avgBus = (filteredDistricts.reduce((acc, d) => acc + (d.publicBusCoverage || 0), 0) / filteredDistricts.length).toFixed(1);
      s.avgBusCoverage = avgBus;
    }
    return s;
  }, [filteredDistricts]);

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
  };

  const handleOpenDeepDive = (district) => {
    setSelectedDistrict(district);
    setIsDeepDiveOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      selectedDistrict: 'All',
      demographicScope: 'Total',
      pressureCategory: 'All',
      sustainabilityCategory: 'All',
      migrationReason: 'All',
      infrastructureFocus: 'All'
    });
    setSearchQuery('');
  };

  const handleResetWeights = () => {
    setDemandWeights(DEFAULT_DEMAND_WEIGHTS);
    setInfraWeights(DEFAULT_INFRA_WEIGHTS);
  };

  const handleSelectHighPressureKpi = () => {
    setFilters(prev => ({ ...prev, pressureCategory: 'Critical' }));
    setShowFilters(true);
  };

  const navItems = [
    { id: 'all', label: 'Overview' },
    { id: 'map', label: 'Pressure Map' },
    { id: 'scatter', label: 'Demand vs Capacity' },
    { id: 'migration', label: 'Migration Dynamics' },
    { id: 'transport', label: 'Transport Infrastructure' },
    { id: 'coverage', label: 'Coverage Matrix' },
    { id: 'sustainability', label: 'Sustainability' },
    { id: 'priority', label: 'Planning Insights' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-slate-800 flex flex-col font-sans">
      
      {/* Top Deep Navy Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setShowMethodology={setShowMethodology}
        setShowDataQuality={setShowDataQuality}
        setShowWeightAdjuster={setShowWeightAdjuster}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        districtsCount={baseDistricts.length}
        mappedCount={baseDistricts.length}
      />

      {/* Sub-navigation Pills Bar matching the reference design */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {navItems.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isActive 
                      ? 'bg-[#0e304f] text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Collapsible Filter Bar */}
        {showFilters && (
          <Filters
            filters={filters}
            setFilters={setFilters}
            districtsList={weightedDistricts}
            onReset={handleResetFilters}
          />
        )}

        {/* Top KPI Cards Bar */}
        <KpiCards
          summary={summary}
          onSelectHighPressure={handleSelectHighPressureKpi}
        />

        {/* Active Analytical Sections ("EVIDENCE XX" Layout) */}
        <div className="space-y-6">
          
          {(activeTab === 'all' || activeTab === 'map') && (
            <PressureMap
              districts={filteredDistricts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              onOpenDeepDive={handleOpenDeepDive}
            />
          )}

          {(activeTab === 'all' || activeTab === 'scatter') && (
            <DemandCapacityScatter
              districts={filteredDistricts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {(activeTab === 'all' || activeTab === 'migration') && (
            <MigrationAnalysis
              districts={filteredDistricts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {(activeTab === 'all' || activeTab === 'transport') && (
            <TransportAnalysis
              districts={filteredDistricts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {(activeTab === 'all' || activeTab === 'coverage') && (
            <InfrastructureMatrix
              districts={filteredDistricts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {(activeTab === 'all' || activeTab === 'sustainability') && (
            <SustainabilityAnalysis
              districts={filteredDistricts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {(activeTab === 'all' || activeTab === 'priority') && (
            <PriorityDistricts
              districts={filteredDistricts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              onOpenDeepDive={handleOpenDeepDive}
            />
          )}

        </div>

      </main>

      {/* District Deep Dive Slide-over Modal */}
      <DistrictDeepDive
        district={selectedDistrict}
        isOpen={isDeepDiveOpen}
        onClose={() => setIsDeepDiveOpen(false)}
      />

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />

      {/* Data Quality & Provenance Panel */}
      <DataQuality
        isOpen={showDataQuality}
        onClose={() => setShowDataQuality(false)}
        summary={summary}
        mappedCount={baseDistricts.length}
      />

      {/* Model Weights Adjuster Modal */}
      <WeightAdjusterModal
        isOpen={showWeightAdjuster}
        onClose={() => setShowWeightAdjuster(false)}
        demandWeights={demandWeights}
        setDemandWeights={setDemandWeights}
        capacityWeights={infraWeights}
        setCapacityWeights={setInfraWeights}
        onResetWeights={handleResetWeights}
      />

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-700">Maharashtra Infrastructure Pressure & Sustainable Planning Decision Support System</span>
          </div>
          <div className="text-slate-500 font-medium text-[11px]">
            Census 2011 Table D-03 · District Census Handbooks (Village & Town Series 2700)
          </div>
        </div>
      </footer>

    </div>
  );
}
