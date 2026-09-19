import React, { useState } from 'react';
import { TableProperties, Search, ExternalLink, AlertTriangle, Zap, Cpu } from 'lucide-react';
import { DatasheetRecord } from '../types';

interface DatasheetTableProps {
  records: DatasheetRecord[];
  onSelectComponent: (partNumber: string) => void;
}

export const DatasheetTable: React.FC<DatasheetTableProps> = ({
  records,
  onSelectComponent
}) => {
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = Array.from(new Set(records.map(r => r.category)));

  const filtered = records.filter(r => {
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      r.part_number.toLowerCase().includes(q) ||
      r.component_name.toLowerCase().includes(q) ||
      r.manufacturer.toLowerCase().includes(q) ||
      r.supported_protocols.toLowerCase().includes(q) ||
      r.target_applications.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <TableProperties className="w-5 h-5 text-emerald-400" />
              <span>Semiconductor Datasheet & Silicon Errata Matrix</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ground-truth specification records for 10 microcontrollers, wireless SoCs, MEMS sensors & crypto HSMs
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Records: <span className="text-emerald-400 font-bold">{filtered.length}</span> / {records.length}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search part number, manufacturer, protocol, application..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 py-1.5 px-3 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Datasheet Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-3.5">Part Number</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Core & Clock</th>
                <th className="py-3 px-3">Flash / SRAM</th>
                <th className="py-3 px-3">Voltage</th>
                <th className="py-3 px-3">Active / Sleep</th>
                <th className="py-3 px-3">Critical Errata Summary</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map(row => (
                <tr
                  key={row.part_number}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectComponent(row.part_number)}
                >
                  <td className="py-3 px-3.5 font-mono font-semibold text-emerald-400 group-hover:text-emerald-300">
                    <div>{row.part_number}</div>
                    <div className="text-[10px] text-slate-400 font-sans font-normal line-clamp-1">
                      {row.component_name}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-amber-300 font-medium">
                    {row.manufacturer}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {row.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div className="text-slate-200 text-[11px] truncate max-w-[150px]" title={row.core_architecture}>
                      {row.core_architecture}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {row.max_clock_mhz ? `${row.max_clock_mhz} MHz` : 'Direct Sensor'}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {row.flash_memory_kb ? `${row.flash_memory_kb} KB` : '0'} /{' '}
                    {row.sram_kb ? `${row.sram_kb} KB` : '0'}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {row.operating_voltage_min_v} - {row.operating_voltage_max_v} V
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div>{row.active_current_ma} mA</div>
                    <div className="text-emerald-400 text-[10px] font-semibold">{row.sleep_current_ua} µA</div>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight" title={row.errata_and_operational_notes}>
                      {row.errata_and_operational_notes}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComponent(row.part_number);
                      }}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Inspect Entity in Graph"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
