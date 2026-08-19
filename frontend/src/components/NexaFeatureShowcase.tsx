import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Check, Zap, Layers, RefreshCw, Cpu, FileText, Database, GitCommit } from 'lucide-react';
import { playTactileClick, playResolvedChime } from '../utils/audio';

export const NexaFeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'arbitration' | 'neural' | 'evidence'>('arbitration');
  const [isSimulating, setIsSimulating] = useState(false);
  const [arbitrationResolved, setArbitrationResolved] = useState(false);

  const triggerSimulation = () => {
    playTactileClick();
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setArbitrationResolved(true);
      playResolvedChime();
    }, 600);
  };

  return (
    <section id="features-showcase" className="w-full flex flex-col items-center gap-10 pt-16 pb-12 relative z-10">
      {/* Section Header */}
      <div className="text-center flex flex-col items-center gap-3 max-w-2xl px-4">
        <span className="font-mono text-xs uppercase font-bold text-[#c084fc] tracking-widest">
          ENTERPRISE INTELLIGENCE CORE
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Verifiable truth across all company data.
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#94a3b8]">
          When different documents disagree, NEXA automatically arbitrates governing policy using timestamp, authority, and cryptographic proofs.
        </p>
      </div>

      {/* Interactive Segmented Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full apple-glass-pill border border-white/10 shadow-xl max-w-xl w-full">
        <button
          onClick={() => {
            playTactileClick();
            setActiveTab('arbitration');
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-full font-sans text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'arbitration'
              ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Contradiction Arbitration
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveTab('neural');
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-full font-sans text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'neural'
              ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Neural Knowledge Graph
        </button>

        <button
          onClick={() => {
            playTactileClick();
            setActiveTab('evidence');
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-full font-sans text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'evidence'
              ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Cryptographic Proofs
        </button>
      </div>

      {/* Interactive Feature Stage Display Card */}
      <div className="w-full max-w-4xl apple-glass-card rounded-[32px] p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />

        {activeTab === 'arbitration' && (
          <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
            <div className="space-y-4 text-left">
              <span className="font-mono text-[10px] text-[#c084fc] font-bold uppercase tracking-wider bg-[#7c3aed]/20 px-3 py-1 rounded-full">
                AUTOMATED PRECEDENCE ENGINE
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Eliminate Conflicting Policies in Real Time
              </h3>
              <p className="font-sans text-sm text-[#cbd5e1] leading-relaxed">
                NEXA crawls your Google Drive, Notion, Confluence, and Slack archives to detect when outdated wikis contradict newer executive memos.
              </p>

              <div className="space-y-2 font-mono text-xs text-[#94a3b8] pt-2">
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-4 h-4 text-[#c084fc]" />
                  <span>Authority-weighted legal hierarchy matching</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-4 h-4 text-[#c084fc]" />
                  <span>Interactive 1-click legal precedence sign-off</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={triggerSimulation}
                  disabled={isSimulating}
                  className="btn-orbitsat-purple px-6 py-2.5 rounded-full font-sans text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>{arbitrationResolved ? 'Re-Run Conflict Audit' : 'Arbitrate Conflicting Policies'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Conflict Cards */}
            <div className="p-6 rounded-2xl bg-[#090616] border border-white/10 shadow-2xl font-mono text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-white font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#f87171]" /> CONTRADICTION #042
                </span>
                <span className="text-[#f87171] bg-[#ef4444]/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  HIGH SEVERITY
                </span>
              </div>

              {/* Outdated policy */}
              <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
                <span className="text-[#f87171] text-[10px] font-bold block">LEGACY NOTION DOC (2022)</span>
                <span className="text-[#cbd5e1]">"Enterprise refund approvals require 3-tier VP sign-off within 30 days."</span>
              </div>

              {/* Governing policy */}
              <div className="p-3 rounded-xl bg-[#7c3aed]/25 border border-[#a855f7]/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <span className="text-[#c084fc] text-[10px] font-bold block">GOVERNING SLA CONTRACT (2025)</span>
                <span className="text-white font-bold">"Direct automated refund issuance upon breach of 99.9% uptime SLA."</span>
              </div>

              {/* Resolution Banner */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-[#4ade80] flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
                <span>{arbitrationResolved ? 'LEGAL PRECEDENCE CONFIRMED (100% CONFIDENCE)' : 'NEXA VERDICT: 2025 SLA OVERRIDES 2022 NOTION DOC'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'neural' && (
          <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
            <div className="space-y-4 text-left">
              <span className="font-mono text-[10px] text-[#38bdf8] font-bold uppercase tracking-wider bg-[#38bdf8]/20 px-3 py-1 rounded-full">
                VECTOR CLUSTERING
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Multi-Department Neural Knowledge Graph
              </h3>
              <p className="font-sans text-sm text-[#cbd5e1] leading-relaxed">
                Unify cross-silo knowledge across Engineering RFCs, Legal Master Services Agreements, HR Handbooks, and Customer Support playbooks.
              </p>

              <div className="space-y-2 font-mono text-xs text-[#94a3b8] pt-2">
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-4 h-4 text-[#38bdf8]" />
                  <span>Real-time semantic vector mapping (1,536 dimensions)</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-4 h-4 text-[#38bdf8]" />
                  <span>Sub-200ms hybrid keyword and neural search</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090616] border border-white/10 shadow-2xl font-mono text-xs space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8] text-[10px] block">TOTAL VECTORS</span>
                  <span className="text-white font-bold text-sm">2,419,000+</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8] text-[10px] block">SEARCH LATENCY</span>
                  <span className="text-[#38bdf8] font-bold text-sm">118 ms (p95)</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8] text-[10px] block">CONNECTED SOURCES</span>
                  <span className="text-white font-bold text-sm">6 Integrations</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8] text-[10px] block">GROUNDING RATIO</span>
                  <span className="text-[#4ade80] font-bold text-sm">99.8% Cited</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
            <div className="space-y-4 text-left">
              <span className="font-mono text-[10px] text-[#4ade80] font-bold uppercase tracking-wider bg-[#4ade80]/20 px-3 py-1 rounded-full">
                ZERO-HALLUCINATION GUARANTEE
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Cryptographic Verbatim Citations
              </h3>
              <p className="font-sans text-sm text-[#cbd5e1] leading-relaxed">
                Every generated response cites exact paragraph text with immutable SHA-256 source hash verification. Never hallucinate, never guess.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090616] border border-white/10 shadow-2xl font-mono text-xs space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[#94a3b8] text-[10px] block">DOCUMENT INTEGRITY PROOF</span>
                <span className="text-[#38bdf8] font-bold">sha256:4a8b79e2...01cd</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[#94a3b8] text-[10px] block">EXACT CITATION MATCH</span>
                <span className="text-[#4ade80] font-bold">100% Verbatim Grounding Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
