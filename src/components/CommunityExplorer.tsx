import React, { useState } from 'react';
import { Layers, Star, Users, ChevronRight, Search, Sparkles } from 'lucide-react';
import { CommunityDefinition } from '../types';

interface CommunityExplorerProps {
  communities: CommunityDefinition[];
  onSelectEntity: (entityName: string) => void;
  onQueryCommunity: (title: string) => void;
}

export const CommunityExplorer: React.FC<CommunityExplorerProps> = ({
  communities,
  onSelectEntity,
  onQueryCommunity
}) => {
  const [selectedCommId, setSelectedCommId] = useState<number>(1);
  const activeCommunity = communities.find(c => c.id === selectedCommId) || communities[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Hierarchical Leiden Community Clusters ({communities.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Modularity-partitioned semiconductor subsystems with pre-computed executive summaries and key findings.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Graph Partition Algorithm: <span className="text-emerald-400 font-bold">Leiden / Louvain</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Communities */}
        <div className="space-y-2">
          {communities.map(c => {
            const isSelected = c.id === selectedCommId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCommId(c.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/80 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                    Cluster #{c.id}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-mono">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{c.rating}/10</span>
                  </div>
                </div>
                <h3 className="text-xs font-bold text-slate-100 mt-1.5 line-clamp-1">
                  {c.title}
                </h3>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{c.entities.length} Interconnected Entities</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Detail Report */}
        {activeCommunity && (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    Leiden Community #{activeCommunity.id}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-mono font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Rating: {activeCommunity.rating}/10</span>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {activeCommunity.title}
                </h3>
              </div>

              <button
                onClick={() => onQueryCommunity(`Synthesize key architectural findings for ${activeCommunity.title}`)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Query Cluster Report</span>
              </button>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Executive Synthesis Summary
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 bg-slate-950 p-4 rounded-lg border border-slate-800 leading-relaxed">
                {activeCommunity.summary}
              </p>
            </div>

            {/* Key Findings List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Key Architectural & Hardware Findings ({activeCommunity.findings.length})
              </h4>
              <div className="space-y-2">
                {activeCommunity.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Member Entities */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Member Entities ({activeCommunity.entities.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeCommunity.entities.map(entName => (
                  <button
                    key={entName}
                    onClick={() => onSelectEntity(entName)}
                    className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition"
                  >
                    {entName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
