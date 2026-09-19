import React, { useState } from 'react';
import {
  Search,
  Zap,
  ShieldAlert,
  Compass,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Send,
  HelpCircle,
  Share2,
  Sparkles
} from 'lucide-react';
import { QuerySearchMethod, QueryMode, QueryResponse, GraphEntity } from '../types';

interface QueryConsoleProps {
  queryMode: QueryMode;
  onSelectEntityByName?: (name: string) => void;
}

export const QueryConsole: React.FC<QueryConsoleProps> = ({
  queryMode,
  onSelectEntityByName
}) => {
  const [method, setMethod] = useState<QuerySearchMethod>('local');
  const [question, setQuestion] = useState<string>(
    'What are the technical specs and companion chips for the ESP32-S3?'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presetQuestions = [
    {
      title: 'Targeted Specs & Errata (Local)',
      method: 'local' as QuerySearchMethod,
      text: 'What are the technical specs and companion chips for the ESP32-S3?'
    },
    {
      title: 'Power Envelope Comparison (Global)',
      method: 'global' as QuerySearchMethod,
      text: 'Compare low-power wireless microcontrollers for battery operation with sleep current under 10 uA.'
    },
    {
      title: 'Multi-Hop Interfacing (DRIFT)',
      method: 'drift' as QuerySearchMethod,
      text: 'What sensors can interface with the BME688 environmental scanner and over which communication buses?'
    },
    {
      title: 'Safety-Critical Errata (Local)',
      method: 'local' as QuerySearchMethod,
      text: 'Show me STM32H743ZI errata ES0392 regarding AXI SRAM DMA and required SMPS inductors.'
    },
    {
      title: 'Hallucination Defense Test',
      method: 'local' as QuerySearchMethod,
      text: 'What are the clock speed, pinout, and cache specs for an Intel Core i9-14900K?'
    }
  ];

  const handleExecuteQuery = async (queryText = question, queryMethod = method) => {
    if (!queryText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          method: queryMethod,
          mode: queryMode
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP error ${res.status}`);
      }

      const data: QueryResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Query execution failed:', err);
      setError(err.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Search Strategies Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Microsoft GraphRAG Multi-Strategy Search Console</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select an algorithmic search paradigm matching your retrieval query objective
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            <span>Execution Mode:</span>
            <span className={queryMode === 'live' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {queryMode.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Strategy Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Local */}
          <button
            onClick={() => setMethod('local')}
            className={`p-3 rounded-lg border text-left transition-all ${
              method === 'local'
                ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Local Search</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                1-2 Hops
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Targeted component specs, pinouts, and immediate companion IC errata.
            </p>
          </button>

          {/* Global */}
          <button
            onClick={() => setMethod('global')}
            className={`p-3 rounded-lg border text-left transition-all ${
              method === 'global'
                ? 'bg-blue-950/40 border-blue-500/80 text-blue-200 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Global Search</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Map-Reduce
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Cross-cluster map-reduce across all 8 Leiden community reports.
            </p>
          </button>

          {/* DRIFT */}
          <button
            onClick={() => setMethod('drift')}
            className={`p-3 rounded-lg border text-left transition-all ${
              method === 'drift'
                ? 'bg-purple-950/40 border-purple-500/80 text-purple-200 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span>DRIFT Search</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Hybrid + Followup
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Top-down macro context + local node hops + exploratory reasoning.
            </p>
          </button>

          {/* Basic */}
          <button
            onClick={() => setMethod('basic')}
            className={`p-3 rounded-lg border text-left transition-all ${
              method === 'basic'
                ? 'bg-slate-800 border-slate-600 text-slate-200 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Basic Search</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Chunk Baseline
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Classical vector keyword chunk matching without graph topology.
            </p>
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="input-query-text"
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleExecuteQuery()}
                placeholder="Ask about component pinouts, clock speeds, companion chips, errata, or macro architectures..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              id="btn-execute-query"
              onClick={() => handleExecuteQuery()}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition disabled:opacity-50 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Evaluating...' : 'Query'}</span>
            </button>
          </div>

          {/* Preset Prompts */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none text-[11px]">
            <span className="text-slate-500 font-mono flex-shrink-0">Exemplars:</span>
            {presetQuestions.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(pq.text);
                  setMethod(pq.method);
                  handleExecuteQuery(pq.text, pq.method);
                }}
                className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition flex-shrink-0"
              >
                {pq.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Query Result Card */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4 p-5">
          {/* Metadata Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grounded Response</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Method: {result.method.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Mode: {result.mode.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{result.latency_ms} ms</span>
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Confidence: {(result.grounding_confidence * 100).toFixed(0)}%
            </div>
          </div>

          {/* Errata Warning Box (if applicable) */}
          {result.errata_warnings && result.errata_warnings.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/60 space-y-2">
              <div className="flex items-center space-x-2 text-amber-300 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Silicon Errata & Safety Advisory Detected</span>
              </div>
              <ul className="space-y-1 text-xs text-amber-200/90 pl-5 list-disc">
                {result.errata_warnings.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Synthesized Answer Body */}
          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
            {result.answer}
          </div>

          {/* Grounded Subgraph Preview */}
          {result.subgraph && result.subgraph.nodes.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grounded Subgraph Nodes ({result.subgraph.nodes.length}) & Edges ({result.subgraph.edges.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.subgraph.nodes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => onSelectEntityByName && onSelectEntityByName(n.name)}
                    className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition flex items-center space-x-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{n.name}</span>
                    <span className="text-[10px] text-slate-500">({n.type})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning Trace Steps */}
          {result.reasoning_trace && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>GraphRAG Reasoning Trace</span>
              </h4>
              <ol className="space-y-1 text-xs text-slate-400 font-mono pl-5 list-decimal">
                {result.reasoning_trace.map((step, idx) => (
                  <li key={idx} className="text-slate-300">{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
