import React from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { QuantumGraphCanvas } from './QuantumGraphCanvas';
import { ColorTheme } from '../types';

interface HeroSectionProps {
  colorTheme: ColorTheme;
  onEnterNeuralStudio: () => void;
  onExploreGraph: () => void;
  onSelectDocument?: (docName: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  colorTheme,
  onEnterNeuralStudio,
  onExploreGraph,
  onSelectDocument,
}) => {
  return (
    <section className="w-full flex flex-col items-center gap-10 pt-4 relative">
      {/* Top Status Capsule */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-[var(--theme-border)] shadow-[0_0_20px_var(--theme-glow)] animate-in fade-in slide-in-from-top-4 duration-500">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-mono tracking-widest text-[var(--theme-primary)] font-bold uppercase">
          QUANTUM KNOWLEDGE INTELLIGENCE MMXXIV
        </span>
      </div>

      {/* Main Punchy Futuristic Headline */}
      <div className="text-center flex flex-col gap-4 max-w-4xl z-10 px-4">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
          Synthesize Knowledge.{' '}
          <span className="cyber-gradient-text">Zero Contradictions.</span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          The enterprise intelligence engine that bridges scattered silos, arbitrates temporal document conflicts in real time, and cryptographically proves every output.
        </p>
      </div>

      {/* Interactive Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 z-10">
        <button
          onClick={onEnterNeuralStudio}
          className="btn-cyber-primary px-8 py-3.5 rounded-xl flex items-center gap-3 cursor-pointer group"
        >
          <Zap className="w-4 h-4 fill-current group-hover:rotate-12 transition-transform" />
          <span>Launch Neural Query Studio</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onExploreGraph}
          className="btn-cyber-ghost px-8 py-3.5 rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <Terminal className="w-4 h-4" />
          <span>Explore Quantum Graph</span>
        </button>
      </div>

      {/* Interactive Quantum Graph Visual Canvas */}
      <div id="quantum-graph-section" className="w-full max-w-5xl mt-4">
        <QuantumGraphCanvas
          colorTheme={colorTheme}
          onSelectNode={onSelectDocument}
        />
      </div>

      {/* 3 Real-time Tech Specs Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl pt-4">
        <div className="cyber-card-subtle p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 text-[var(--theme-primary)] border border-cyan-800/60">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white">HNSW Vector Retrieval</div>
            <div className="text-[10px] text-slate-400 font-mono">1536-dim &lt; 20ms</div>
          </div>
        </div>

        <div className="cyber-card-subtle p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-950/80 text-[var(--theme-secondary)] border border-purple-800/60">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white">Temporal Arbiter</div>
            <div className="text-[10px] text-slate-400 font-mono">Automated Supersession</div>
          </div>
        </div>

        <div className="cyber-card-subtle p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white">Cryptographic Proof</div>
            <div className="text-[10px] text-slate-400 font-mono">SHA-256 Provenance Hash</div>
          </div>
        </div>
      </div>
    </section>
  );
};
