import React, { useState } from 'react';
import {
  AlertOctagon,
  Scale,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowRightLeft,
  Sliders,
  FileText,
  Sparkles,
  Download,
  Check,
} from 'lucide-react';
import { CONFLICT_RECORDS } from '../data/mockKnowledge';
import { ConflictRecord, NexaSystemSettings } from '../types';
import { playFuturisticSound } from '../utils/audioFx';

interface ConflictMatrixViewProps {
  settings: NexaSystemSettings;
  onInspectDoc?: (docName: string) => void;
}

export const ConflictMatrixView: React.FC<ConflictMatrixViewProps> = ({
  settings,
  onInspectDoc,
}) => {
  const [selectedConflictIndex, setSelectedConflictIndex] = useState(0);
  const [recencyWeight, setRecencyWeight] = useState(settings.recencyWeight || 0.65);
  const [authorityWeight, setAuthorityWeight] = useState(settings.authorityWeight || 0.35);
  const [isArbitrating, setIsArbitrating] = useState(false);
  const [certExported, setCertExported] = useState(false);

  const conflict = CONFLICT_RECORDS[selectedConflictIndex] || CONFLICT_RECORDS[0];

  const handleRunArbitration = () => {
    setIsArbitrating(true);
    playFuturisticSound('conflict-warn', settings.audioFxEnabled, settings.masterVolume);
    setTimeout(() => {
      setIsArbitrating(false);
      playFuturisticSound('resolve-success', settings.audioFxEnabled, settings.masterVolume);
    }, 700);
  };

  const handleExportCertificate = () => {
    setCertExported(true);
    playFuturisticSound('quantum-chime', settings.audioFxEnabled, settings.masterVolume);
    setTimeout(() => setCertExported(false), 3000);
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-widest flex items-center gap-1.5">
              <Scale className="w-3 h-3" />
              Temporal Conflict Resolution Matrix
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Arbitration & Contradiction Engine
          </h2>
        </div>

        {/* Case selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {CONFLICT_RECORDS.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedConflictIndex(idx);
                playFuturisticSound('click', settings.audioFxEnabled, settings.masterVolume * 0.4);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                selectedConflictIndex === idx
                  ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-[0_0_15px_var(--theme-glow)]'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {c.topic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Frame */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Side: Conflict Comparison + Weight Sliders (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Side by side documents */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Outdated doc plate */}
            <div
              onClick={() => onInspectDoc?.(conflict.outdatedSource.docName)}
              className="cyber-card rounded-2xl p-5 border border-red-500/40 hover:border-red-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/80 border border-red-800/60">
                    SUPERSEDED REPOSITORY
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {conflict.outdatedSource.date}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  {conflict.outdatedSource.docName}
                </h4>
                <p className="text-xs text-slate-400 line-through decoration-red-500/60 leading-relaxed my-3 font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  &ldquo;{conflict.outdatedSource.snippet}&rdquo;
                </p>
              </div>

              <div className="text-[10px] font-mono text-slate-500 flex justify-between pt-2 border-t border-slate-800">
                <span>Confidence: {conflict.outdatedSource.confidence}%</span>
                <span>Status: Inactive</span>
              </div>
            </div>

            {/* Active Policy doc plate */}
            <div
              onClick={() => onInspectDoc?.(conflict.activeSource.docName)}
              className="cyber-card rounded-2xl p-5 border border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE ENFORCED
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {conflict.activeSource.date}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  {conflict.activeSource.docName}
                </h4>
                <p className="text-xs text-emerald-200 font-medium leading-relaxed my-3 font-mono bg-slate-950/80 p-3 rounded-lg border border-emerald-900/60">
                  &ldquo;{conflict.activeSource.snippet}&rdquo;
                </p>
              </div>

              <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-2 border-t border-slate-800">
                <span>Confidence: <strong className="text-emerald-400">{conflict.activeSource.confidence}%</strong></span>
                <span className="text-emerald-400 font-bold">Status: Legally Binding</span>
              </div>
            </div>
          </div>

          {/* Conflict Analysis & Verdict Banner */}
          <div className="cyber-card rounded-2xl p-6 border border-[var(--theme-border)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[var(--theme-primary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Arbitration Analysis & Formal Verdict
              </span>
              <button
                onClick={handleRunArbitration}
                disabled={isArbitrating}
                className="btn-cyber-primary px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isArbitrating ? 'Re-scoring...' : 'Re-Run Arbiter'}</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Discrepancy Root:</span>
                <p className="text-slate-300 font-sans leading-relaxed">{conflict.conflictDescription}</p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-emerald-900/50">
                <span className="text-[10px] text-emerald-400 uppercase block mb-1 font-bold">Enforced Rule ({conflict.verdict}):</span>
                <p className="text-emerald-200 font-sans leading-relaxed">{conflict.verdictReason}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Arbitration Weight Modulators (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)] space-y-5">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--theme-primary)]" />
              Arbitration Weighting Matrix
            </h3>

            {/* Recency Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400">Temporal Recency Bias:</span>
                <span className="text-[var(--theme-primary)] font-bold">{Math.round(recencyWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={recencyWeight}
                onChange={(e) => setRecencyWeight(parseFloat(e.target.value))}
                className="w-full accent-[var(--theme-primary)]"
              />
              <span className="text-[10px] text-slate-500 font-mono">Prioritizes recently updated documents</span>
            </div>

            {/* Authority Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400">Author Hierarchy Weight:</span>
                <span className="text-emerald-400 font-bold">{Math.round(authorityWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={authorityWeight}
                onChange={(e) => setAuthorityWeight(parseFloat(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">Prioritizes Legal & Board-level approvals</span>
            </div>

            {/* Export Certificate */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleExportCertificate}
                className="w-full btn-cyber-ghost py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {certExported ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
                <span>{certExported ? 'Signed Certificate Generated' : 'Export Audit Certificate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
