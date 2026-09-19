import React from 'react';
import {
  X,
  Cpu,
  AlertTriangle,
  Radio,
  Zap,
  HardDrive,
  Activity,
  Layers,
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import { GraphEntity, GraphRelationship } from '../types';

interface EntityDetailDrawerProps {
  entity: GraphEntity | null;
  onClose: () => void;
  relationships: GraphRelationship[];
  onQueryEntity: (name: string) => void;
  onSelectConnectedEntity: (name: string) => void;
}

export const EntityDetailDrawer: React.FC<EntityDetailDrawerProps> = ({
  entity,
  onClose,
  relationships,
  onQueryEntity,
  onSelectConnectedEntity
}) => {
  if (!entity) return null;

  const meta = entity.metadata || {};
  const connectedEdges = relationships.filter(
    r => r.source === entity.name || r.target === entity.name
  );

  const companionEdges = connectedEdges.filter(r => r.type === 'COMPATIBLE_WITH');
  const protocolEdges = connectedEdges.filter(r => r.type === 'COMMUNICATES_VIA');
  const manufacturerEdge = connectedEdges.find(r => r.type === 'MANUFACTURED_BY');
  const coreEdge = connectedEdges.find(r => r.type === 'POWERED_BY_CORE');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COMPONENT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MANUFACTURER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PROTOCOL':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'CORE_ARCHITECTURE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div
      id="entity-detail-drawer"
      className="absolute top-4 right-4 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden text-slate-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getTypeColor(entity.type)}`}>
              {entity.type}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Community #{entity.community}
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            {entity.name}
          </h2>
          <p className="text-xs text-slate-400 line-clamp-2">
            {meta.component_name || entity.description}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onQueryEntity(`What are the technical specs and companion chips for ${entity.name}?`)}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Query in Q&A</span>
          </button>
        </div>

        {/* Electrical Ratings (if Component) */}
        {entity.type === 'COMPONENT' && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Electrical & Power Ratings</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">SUPPLY VOLTAGE</span>
                <span className="text-slate-200 font-semibold">{meta.voltage_range || '1.71V - 3.6V'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MAX CLOCK</span>
                <span className="text-slate-200 font-semibold">{meta.max_clock_mhz ? `${meta.max_clock_mhz} MHz` : '0 MHz (Sensor/HSM)'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">FLASH MEMORY</span>
                <span className="text-slate-200 font-semibold">{meta.flash_memory_kb ? `${meta.flash_memory_kb} KB` : 'External'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">INTERNAL SRAM</span>
                <span className="text-slate-200 font-semibold">{meta.sram_kb ? `${meta.sram_kb} KB` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ACTIVE CURRENT</span>
                <span className="text-slate-200 font-semibold">{meta.active_current_ma ? `${meta.active_current_ma} mA` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DEEP SLEEP LEAKAGE</span>
                <span className="text-emerald-400 font-semibold">{meta.sleep_current_ua ? `${meta.sleep_current_ua} µA` : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Silicon Errata Callout */}
        {meta.errata && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-amber-300 font-semibold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Critical Silicon Errata & Engineering Guidelines</span>
            </div>
            <p className="text-amber-200/90 leading-relaxed text-[11px]">
              {meta.errata}
            </p>
          </div>
        )}

        {/* Hardware Hierarchy */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Architecture & Manufacturer</span>
          </h3>
          <div className="space-y-1.5">
            {manufacturerEdge && (
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Manufacturer</span>
                <button
                  onClick={() => onSelectConnectedEntity(manufacturerEdge.target)}
                  className="font-medium text-amber-400 hover:underline"
                >
                  {manufacturerEdge.target}
                </button>
              </div>
            )}
            {coreEdge && (
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Core</span>
                <button
                  onClick={() => onSelectConnectedEntity(coreEdge.target)}
                  className="font-medium text-purple-400 hover:underline text-right max-w-[200px] truncate"
                  title={coreEdge.target}
                >
                  {coreEdge.target}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Companion ICs */}
        {companionEdges.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Companion Chips ({companionEdges.length})</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {companionEdges.map(edge => {
                const companionName = edge.source === entity.name ? edge.target : edge.source;
                return (
                  <button
                    key={edge.id}
                    onClick={() => onSelectConnectedEntity(companionName)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-mono transition"
                  >
                    {companionName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Protocols & Busses */}
        {protocolEdges.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>Peripheral & Wireless Protocols ({protocolEdges.length})</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {protocolEdges.map(edge => {
                const protocolName = edge.source === entity.name ? edge.target : edge.source;
                return (
                  <button
                    key={edge.id}
                    onClick={() => onSelectConnectedEntity(protocolName)}
                    className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/50 text-[11px] font-mono hover:bg-blue-900/50 transition"
                  >
                    {protocolName}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
