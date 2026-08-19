import React from 'react';
import { Apple, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { playTactileClick, playResolvedChime } from '../utils/audio';

interface CtaSectionProps {
  onEnterNexa: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onEnterNexa }) => {
  return (
    <section className="w-full py-20 px-4 flex justify-center relative z-10">
      <div className="w-full max-w-4xl apple-glass-card rounded-[36px] p-8 sm:p-14 border border-white/15 shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-6">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7c3aed]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#38bdf8] p-0.5 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.6)]">
          <div className="w-full h-full bg-[#0d0a1c] rounded-[14px] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#c084fc] fill-current" />
          </div>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl">
          Deploy NEXA enterprise intelligence today.
        </h2>

        <p className="font-sans text-sm sm:text-base text-[#94a3b8] max-w-xl">
          Unify your company's scattered knowledge, automate policy contradiction arbitration, and empower your teams with 100% verified cited truth.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <button
            onClick={() => {
              playResolvedChime();
              onEnterNexa();
            }}
            className="btn-orbitsat-purple px-8 py-3.5 rounded-full font-sans text-sm font-bold flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Intelligence Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1.5 text-white">
            <ShieldCheck className="w-4 h-4 text-[#c084fc]" /> Zero-Trust Encryption
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>Real-Time Policy Arbitration</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>Multi-Source Vector Connectors</span>
        </div>
      </div>
    </section>
  );
};
