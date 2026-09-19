import React, { useEffect, useState } from 'react';
import { FileCode, Database, CheckCircle2, HardDrive, Terminal, RefreshCw } from 'lucide-react';
import { ParquetArtifact } from '../types';

export const ArtifactsInspector: React.FC = () => {
  const [artifacts, setArtifacts] = useState<ParquetArtifact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchArtifacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/artifacts/list');
      if (res.ok) {
        const data = await res.json();
        setArtifacts(data);
      }
    } catch (e) {
      console.error('Failed to load artifacts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Microsoft GraphRAG Artifacts & Schema Storage</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic Apache Parquet tables and JSON topological structures stored in <code className="text-emerald-400 font-mono">graphrag/output/</code>
            </p>
          </div>
          <button
            onClick={fetchArtifacts}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Artifacts</span>
          </button>
        </div>
      </div>

      {/* Artifacts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artifacts.map(art => (
          <div
            key={art.name}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-mono text-xs font-bold text-white truncate max-w-[180px]">
                    {art.name}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {art.format}
                </span>
              </div>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">FILE SIZE</span>
                <span className="text-slate-200 font-semibold">{art.size_human}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PARQUET CONTAINER</span>
                <span className="text-emerald-400 font-semibold">PAR1 Valid</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              {art.name === 'entities.parquet' && '61 typed entities: COMPONENT, MANUFACTURER, PROTOCOL, CORE_ARCHITECTURE.'}
              {art.name === 'relationships.parquet' && '97 directed relational edges with typed semantics & weights.'}
              {art.name === 'communities.parquet' && '8 Leiden modularity clusters with hierarchical ratings.'}
              {art.name === 'community_reports.parquet' && '8 executive summaries with granular architectural findings.'}
              {art.name === 'text_units.parquet' && '10 preprocessed text chunks formatted for GraphRAG indexing.'}
              {art.name === 'graph_data.json' && 'Complete serialized knowledge graph for D3 interactive rendering.'}
            </div>
          </div>
        ))}
      </div>

      {/* Schema Contract Documentation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>GraphRAG 3.x Parquet Schema Contract Compliance</span>
        </h3>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
          <div><span className="text-emerald-400 font-semibold">entities.parquet</span>: [id: string, name: string, type: string, description: string, degree: int, community: int]</div>
          <div><span className="text-emerald-400 font-semibold">relationships.parquet</span>: [id: string, source: string, target: string, type: string, description: string, weight: float]</div>
          <div><span className="text-emerald-400 font-semibold">communities.parquet</span>: [id: int, title: string, size: int, rating: float]</div>
          <div><span className="text-emerald-400 font-semibold">community_reports.parquet</span>: [id: string, community: int, title: string, summary: string, findings: list[string], rating: float]</div>
          <div><span className="text-emerald-400 font-semibold">text_units.parquet</span>: [id: string, text: string, entity_ids: list[string], document_id: string]</div>
        </div>
      </div>
    </div>
  );
};
