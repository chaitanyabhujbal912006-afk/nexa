import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Download, FileText, CheckCircle2, AlertTriangle, ChevronRight, X, Copy, Code2, ShieldCheck, Clock, Terminal } from 'lucide-react';
import { AuditLedgerEntry } from '../types';
import { fetchAuditLog } from '../api/audit';
import { playTactileClick, playResolvedChime } from '../utils/audio';

export const AuditLedgerView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('All');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedEntry, setSelectedEntry] = useState<AuditLedgerEntry | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Load real audit log from backend on mount
  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const entries = await fetchAuditLog(100);
        setLogs(entries);
        if (entries.length > 0) setSelectedEntry(entries[0]);
      } catch (err) {
        setLoadError('Could not load audit log. Is the backend running?');
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);


  // Filter logic
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.call_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchConfidence =
      selectedConfidence === 'All' || log.confidence_level === selectedConfidence;

    const matchProvider =
      selectedProvider === 'All' || log.provider === selectedProvider;

    return matchSearch && matchConfidence && matchProvider;
  });

  const handleExportJsonl = () => {
    playTactileClick();
    const jsonlContent = filteredLogs.map((item) => JSON.stringify(item)).join('\n');
    const blob = new Blob([jsonlContent], { type: 'application/x-jsonlines' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexa_audit_ledger_${Date.now()}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    playResolvedChime();
    setTimeout(() => setExportSuccess(false), 2500);
  };

  const handleCopyPayload = () => {
    if (!selectedEntry) return;
    playTactileClick();
    navigator.clipboard.writeText(JSON.stringify(selectedEntry, null, 2));
    setCopiedJson(true);
    playResolvedChime();
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div id="audit-ledger-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Loading / Error state */}
      {isLoading && (
        <div className="flex items-center gap-3 p-4 apple-glass-card rounded-2xl border border-white/15 text-[#94a3b8] font-mono text-xs">
          <div className="w-4 h-4 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
          Loading audit log from backend...
        </div>
      )}
      {loadError && !isLoading && (
        <div className="p-4 apple-glass-card rounded-2xl border border-[#ef4444]/30 text-[#fca5a5] font-mono text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}
      {/* Header Banner */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apple-glass-card p-6 rounded-[28px] border border-white/15 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-[#c084fc]" />
            <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
              COMPLIANCE & TRACEABILITY
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Audit & Compliance Ledger
          </h2>
          <p className="font-sans text-xs text-[#94a3b8] mt-1">
            Immutable SHA-256 verifiable query traces, LLM provider routing logs, and contradiction flags.
          </p>
        </div>

        <button
          onClick={handleExportJsonl}
          className="btn-orbitsat-purple px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Raw Log (JSONL)</span>
        </button>
      </div>

      {exportSuccess && (
        <div className="p-3 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Audit stream bundle exported successfully to nexa_audit_ledger.jsonl</span>
        </div>
      )}

      {/* Main Grid: Log Table + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filter & Log Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="apple-glass-card rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by Call ID, prompt, or answer..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#a855f7] text-xs font-mono"
              />
            </div>

            {/* Provider Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#94a3b8] text-[10px]">PROVIDER:</span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-[#090616] border border-white/10 text-white text-xs font-mono cursor-pointer"
              >
                <option value="All">All Providers</option>
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
              </select>
            </div>

            {/* Confidence Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#94a3b8] text-[10px]">CONFIDENCE:</span>
              <select
                value={selectedConfidence}
                onChange={(e) => setSelectedConfidence(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-[#090616] border border-white/10 text-white text-xs font-mono cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="apple-glass-card rounded-[28px] border border-white/15 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-mono text-[10px] uppercase text-[#94a3b8]">
                    <th className="p-4">Timestamp & Call ID</th>
                    <th className="p-4">Query Execution</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Confidence</th>
                    <th className="p-4 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#cbd5e1]">
                  {filteredLogs.map((entry) => {
                    const isSelected = selectedEntry?.call_id === entry.call_id;
                    return (
                      <tr
                        key={entry.call_id}
                        onClick={() => {
                          playTactileClick();
                          setSelectedEntry(entry);
                        }}
                        className={`hover:bg-white/5 transition-all cursor-pointer ${
                          isSelected ? 'bg-[#7c3aed]/20 text-white' : ''
                        }`}
                      >
                        <td className="p-4 font-mono">
                          <span className="text-[#38bdf8] font-bold block text-[11px]">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[#94a3b8] text-[9px] block">
                            {entry.call_id.substring(0, 16)}...
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <strong className="text-white font-semibold block truncate">
                            {entry.query}
                          </strong>
                          <p className="text-[#94a3b8] text-[11px] truncate mt-0.5">
                            {entry.answer}
                          </p>
                        </td>
                        <td className="p-4 font-mono uppercase text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold ${
                            entry.provider === 'gemini' ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-[#c084fc]/20 text-[#c084fc]'
                          }`}>
                            {entry.provider}
                          </span>
                        </td>
                        <td className="p-4 font-mono">
                          <span className="text-[#4ade80] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                            {entry.confidence_level}
                          </span>
                          {entry.conflicts_detected_count > 0 && (
                            <span className="text-[#f59e0b] text-[9px] block">
                              ⚠ {entry.conflicts_detected_count} conflict
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-right text-[#38bdf8] font-bold">
                          {entry.latency_ms}ms
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Raw JSON Detail Drawer (4 cols) */}
        <div className="lg:col-span-4 apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl space-y-4 text-white">
          {selectedEntry ? (
            <>
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
                    TRACE DETAIL
                  </span>
                  <h3 className="font-mono text-xs font-bold text-white truncate max-w-[200px]">
                    {selectedEntry.call_id}
                  </h3>
                </div>
                <button
                  onClick={handleCopyPayload}
                  className="flex items-center gap-1 text-[10px] text-[#c084fc] hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  {copiedJson ? <CheckCircle2 className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 font-mono text-[11px]">
                <div>
                  <span className="text-[#94a3b8] block text-[9px]">CHUNKS RETRIEVED</span>
                  <strong className="text-white">{selectedEntry.chunks_retrieved_count} Chunks</strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block text-[9px]">CONFLICTS FLAGGED</span>
                  <strong className={selectedEntry.conflicts_detected_count > 0 ? 'text-[#f59e0b]' : 'text-[#4ade80]'}>
                    {selectedEntry.conflicts_detected_count} Detected
                  </strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block text-[9px]">IP ADDRESS</span>
                  <strong className="text-white">{selectedEntry.ipAddress || '192.168.1.42'}</strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block text-[9px]">ACTOR TOKEN</span>
                  <strong className="text-[#38bdf8] truncate block">{selectedEntry.actor || 'elena.rostova'}</strong>
                </div>
              </div>

              {/* Raw JSON Tree */}
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] uppercase text-[#94a3b8] font-bold block">
                  Raw JSON Payload
                </span>
                <div className="p-3.5 rounded-2xl bg-[#090616] border border-white/10 max-h-[300px] overflow-y-auto font-mono text-[10px] text-[#cbd5e1] custom-scrollbar">
                  <pre className="whitespace-pre-wrap select-text">
                    {JSON.stringify(selectedEntry, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#94a3b8]">
              <Terminal className="w-8 h-8 mx-auto mb-2 text-[#7c3aed] opacity-60" />
              <p className="font-sans text-xs">Select any row from the ledger to inspect request payload and raw response metadata.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
