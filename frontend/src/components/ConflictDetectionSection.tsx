import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Gavel, ShieldCheck, Calendar, CheckCheck, FileText, ArrowRight, Shield } from 'lucide-react';
import { CONFLICT_PRESETS } from '../data/mockKnowledge';
import { playTactileClick } from '../utils/audio';

export const ConflictDetectionSection: React.FC = () => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const current = CONFLICT_PRESETS[selectedPresetIndex];

  return (
    <section id="conflict-section" className="w-full flex flex-col items-center gap-8 pt-8">
      {/* Heading with Cursive Accent (Zero Font Clipping) */}
      <div className="text-center flex flex-col gap-2 max-w-3xl px-4 relative overflow-visible">
        <span className="font-cursive text-3xl sm:text-4xl text-[#c084fc] font-bold mb-0.5 drop-shadow-[0_0_12px_rgba(192,132,252,0.5)] overflow-visible">
          Conflict Detection & Arbitration
        </span>
        <h2 className="font-syne text-3xl sm:text-5xl lg:text-[56px] lg:leading-[64px] font-extrabold text-[#f8fafc] tracking-[-0.035em] overflow-visible pb-1">
          Don't just find an answer.
          <br />
          <span className="text-gradient-lime">
            Know which answer is right.
          </span>
        </h2>
        <span className="font-cursive text-2xl sm:text-3xl text-[#bef264] font-bold mt-1 overflow-visible">
          automatic timestamp overrides
        </span>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl px-4">
        {CONFLICT_PRESETS.map((preset, idx) => (
          <button
            key={preset.title}
            onClick={() => {
              playTactileClick();
              setSelectedPresetIndex(idx);
            }}
            className={`font-sans text-xs font-bold px-4 py-2.5 rounded-full border transition-all cursor-pointer ${
              selectedPresetIndex === idx
                ? 'bg-[#bef264] text-[#090d1a] border-[#bef264] shadow-[0_0_20px_rgba(190,242,100,0.5)] scale-105'
                : 'apple-glass-pill text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Conflict Resolution Box */}
      <div className="w-full max-w-5xl apple-glass-card rounded-[32px] p-6 sm:p-8 relative overflow-visible shadow-2xl border border-white/20">
        {/* Top Accent line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ef4444] via-[#bef264] to-[#38bdf8] rounded-t-[32px]"></div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 relative z-10">
          {/* Outdated Policy */}
          <div className="bg-[#090e1f] rounded-2xl p-6 border border-[#ef4444]/30 relative transition-all">
            <div className="absolute -top-3.5 right-4 bg-[#ef4444] text-white px-3 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <AlertTriangle className="w-3 h-3" />
              <span>OUTDATED RECORD</span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-[#94a3b8] font-mono text-xs">
              <FileText className="w-4 h-4 text-[#f87171]" />
              <span className="font-bold text-white">{current.oldDoc}</span>
              <span className="text-[#64748b]">•</span>
              <span className="text-[#f87171]">{current.oldDate}</span>
            </div>

            <p className="font-sans text-sm sm:text-base text-[#cbd5e1] leading-relaxed mb-4 p-3.5 rounded-xl bg-white/5 border border-white/10">
              "{current.oldClaim}"
            </p>

            <div className="flex items-center gap-2 font-mono text-xs text-[#f87171]">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>SUPERSEDED BY REVISION // VOID ({current.oldConf}% CONF)</span>
            </div>
          </div>

          {/* Active Verified Policy */}
          <div className="bg-[#090e1f] rounded-2xl p-6 border border-[#bef264]/40 relative transition-all shadow-[0_0_30px_rgba(190,242,100,0.1)]">
            <div className="absolute -top-3.5 right-4 bg-gradient-to-r from-[#bef264] to-[#a3e635] text-[#090d1a] px-3 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(190,242,100,0.6)]">
              <CheckCircle2 className="w-3 h-3" />
              <span>ACTIVE ENFORCEABLE RECORD</span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-[#94a3b8] font-mono text-xs">
              <FileText className="w-4 h-4 text-[#bef264]" />
              <span className="font-bold text-white">{current.newDoc}</span>
              <span className="text-[#64748b]">•</span>
              <span className="text-[#bef264]">{current.newDate}</span>
            </div>

            <p className="font-sans text-sm sm:text-base text-white leading-relaxed mb-4 p-3.5 rounded-xl bg-white/5 border border-[#bef264]/30 font-medium">
              "{current.newClaim}"
            </p>

            <div className="flex items-center gap-2 font-mono text-xs text-[#bef264]">
              <CheckCheck className="w-4 h-4" />
              <span>GOVERNING LEGAL PRECEDENCE APPLIED ({current.newConf}% CONF)</span>
            </div>
          </div>
        </div>

        {/* Arbitration Footer */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs text-[#94a3b8]">
          <div className="flex items-center gap-2 text-white">
            <Gavel className="w-4 h-4 text-[#bef264]" />
            <span>ARBITRATION VERDICT: <strong className="text-[#bef264] font-sans font-bold">{current.verdict}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-[#38bdf8]">
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIDENCE SCORE: <strong>99.4%</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
