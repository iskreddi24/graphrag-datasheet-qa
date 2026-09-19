import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Play, RefreshCw, Terminal, Clock, ShieldCheck } from 'lucide-react';
import { TestSuiteReport } from '../types';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<TestSuiteReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tests/run');
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data: TestSuiteReport = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to execute test runner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Automated Test Suite Runner
              </h2>
              <p className="text-xs text-slate-400">
                18 Verification Suites: Preprocessing, GraphRAG Config, Parquet Schema, Query Retrieval & APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">Execution Target:</span>
              <span className="text-slate-400 font-mono block text-[11px]">
                python3 -m unittest discover -v tests
              </span>
            </div>

            <button
              onClick={handleRunTests}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute 18 Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {/* Test Status Summary */}
          {report && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Tests</span>
                <span className="text-lg font-bold text-white">{report.total}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block">Passed</span>
                <span className="text-lg font-bold text-emerald-300">{report.passed}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Execution Time</span>
                <span className="text-lg font-bold text-slate-300">{report.duration_total_ms} ms</span>
              </div>
            </div>
          )}

          {/* Test Results Table */}
          {report && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider font-mono">
                Individual Test Case Telemetry ({report.results.length})
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60 font-mono">
                {report.results.map((t, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-900/40">
                    <div className="flex items-center space-x-2.5">
                      {t.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-slate-200 font-medium">{t.name}</div>
                        <div className="text-[10px] text-slate-500">{t.suite}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.duration_ms} ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Terminal Output */}
          {report?.raw_output && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Standard Test Runner Output</span>
              </h3>
              <pre className="p-3 rounded-xl bg-black border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 scrollbar-none whitespace-pre-wrap">
                {report.raw_output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
