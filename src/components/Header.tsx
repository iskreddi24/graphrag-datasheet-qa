import React from 'react';
import {
  Cpu,
  Network,
  MessageSquare,
  Scale,
  TableProperties,
  Layers,
  FileCode,
  CheckCircle2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { QueryMode, PipelineHealth } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  queryMode: QueryMode;
  setQueryMode: (mode: QueryMode) => void;
  health: PipelineHealth | null;
  onOpenTestModal: () => void;
  onReindex: () => void;
  isReindexing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  queryMode,
  setQueryMode,
  health,
  onOpenTestModal,
  onReindex,
  isReindexing
}) => {
  const navTabs = [
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'query', label: 'Multi-Strategy Q&A', icon: MessageSquare },
    { id: 'compare', label: 'RAG Comparison', icon: Scale },
    { id: 'datasheet', label: 'Datasheets & Errata', icon: TableProperties },
    { id: 'communities', label: 'Leiden Clusters', icon: Layers },
    { id: 'artifacts', label: 'Parquet Artifacts', icon: FileCode }
  ];

  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      {/* Top Banner: Title and Pipeline Telemetry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                  Microsoft GraphRAG
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  v3.1.2
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-medium">
                  Semiconductor Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ground-truth entity-relationship retrieval for microcontrollers, wireless SoCs & silicon errata
              </p>
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live vs Offline Mode Switcher */}
            <div className="flex items-center rounded-lg bg-slate-950/80 p-1 border border-slate-800">
              <button
                id="btn-mode-offline"
                onClick={() => setQueryMode('offline')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  queryMode === 'offline'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Deterministic Offline GraphRAG (zero external tokens, network-isolated)"
              >
                Offline Deterministic
              </button>
              <button
                id="btn-mode-live"
                onClick={() => setQueryMode('live')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center space-x-1 ${
                  queryMode === 'live'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Live Microsoft GraphRAG with server-side LLM inference"
              >
                <Zap className="w-3 h-3" />
                <span>Live GraphRAG</span>
              </button>
            </div>

            {/* Re-indexing Action */}
            <button
              id="btn-reindex-pipeline"
              onClick={onReindex}
              disabled={isReindexing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
              title="Run GraphRAG Indexing Pipeline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>{isReindexing ? 'Indexing...' : 'Re-Index'}</span>
            </button>

            {/* Test Runner Trigger */}
            <button
              id="btn-open-test-modal"
              onClick={onOpenTestModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 transition"
              title="Execute all 18 automated pipeline test suites"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Suite (18)</span>
            </button>
          </div>
        </div>

        {/* Telemetry Status Ribbon */}
        <div className="flex flex-wrap items-center justify-between py-2 border-t border-slate-800/60 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-mono">
                {health?.stats.entities || 61} Entities
              </span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">
              {health?.stats.relationships || 97} Relational Edges
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">
              {health?.stats.communities || 8} Leiden Clusters
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-mono">10 Datasheet Specs</span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="text-slate-500">Execution Mode:</span>
            <span
              className={`px-1.5 py-0.5 rounded font-semibold ${
                queryMode === 'live'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {queryMode === 'live' ? 'LIVE (LLM GROUNDED)' : 'OFFLINE (PARQUET GRAPH)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="bg-slate-950/60 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
