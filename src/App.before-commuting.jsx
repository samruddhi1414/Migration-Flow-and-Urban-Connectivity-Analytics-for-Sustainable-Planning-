import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import O3Dashboard from './modules/O3Real/App.jsx';
import { loadDashboardData } from './utils/dataLoader';
import { Building2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [activeModule, setActiveModule] = useState('db');

  const initData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadDashboardData();
      setDataset(result.data);
      setMetadata(result.metadata);
    } catch (err) {
      console.error('Data initialization failed:', err);
      setError(err.message || 'Failed to load Maharashtra datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4 animate-bounce">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">
            Loading Maharashtra Infrastructure Datasets
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Aggregating 43,665 villages, 535 towns, and Census 2011 migration records...
          </p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="p-6 rounded-2xl bg-slate-900 border border-rose-800/50 shadow-2xl max-w-md text-center">
          <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Dataset Initialization Error</h2>
          <p className="text-xs text-rose-300 mb-4 leading-relaxed">{error}</p>
          <button
            onClick={initData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs mx-auto shadow transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Dataset Loading</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-2">

          <button
            type="button"
            onClick={() => setActiveModule('db')}
            className={
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors ' +
              (activeModule === 'db'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white')
            }
          >
            Maharashtra Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('o3')}
            className={
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors ' +
              (activeModule === 'o3'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white')
            }
          >
            Mumbai Accessibility
          </button>

        </div>
      </div>

      {activeModule === 'db' ? (
        <Dashboard initialData={dataset} metadata={metadata} />
      ) : (
        <O3Dashboard />
      )}
    </div>
  );
}
