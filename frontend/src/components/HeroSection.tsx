import React, { useState } from 'react';
import { Apple, ArrowRight, ShieldCheck, Check, Sparkles, AlertTriangle, FileText, Compass, Layers, CheckCircle2, Lock, Cpu } from 'lucide-react';
import { playTactileClick, playResolvedChime } from '../utils/audio';

interface HeroSectionProps {
  onEnterNexa: () => void;
  onSeeHowItWorks: () => void;
  scrollY?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onEnterNexa,
  onSeeHowItWorks,
  scrollY = 0,
}) => {
  const [selectedCard, setSelectedCard] = useState<'ARBITRATION' | 'RADAR'>('ARBITRATION');

  // Parallax calculations based on scrollY
  const horizonScale = Math.min(1.15, 1 + scrollY * 0.0003);
  const mockupTranslateY = Math.max(-50, -scrollY * 0.12);

  return (
    <section
      id="hero"
      className="relative w-full flex flex-col items-center justify-start text-center pt-28 sm:pt-36 pb-16 min-h-[920px] overflow-visible"
    >
      {/* 1. Luminous Planetary Horizon Arch (Cosmic Luxury Backdrop) */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[160vw] max-w-[2200px] h-[580px] pointer-events-none transition-transform duration-100 ease-out z-0"
        style={{ transform: `translateX(-50%) scale(${horizonScale})` }}
      >
        {/* Planetary Horizon Glow Curve */}
        <div className="planetary-horizon-curve" />
        
        {/* Atmospheric Upper Aurora Mist */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] planetary-glow-arc opacity-90" />
      </div>

      {/* 2. Top Trust Badge Pill */}
      <div className="relative z-10 mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="apple-glass-pill rounded-full px-4 sm:px-5 py-1.5 flex items-center gap-2 border border-white/15 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
          <span className="text-[#a855f7] font-bold text-xs">✓</span>
          <span className="font-sans text-xs sm:text-sm font-medium text-white/90">
            Trusted by Enterprise Legal, Security & Engineering Teams Worldwide
          </span>
        </div>
      </div>

      {/* 3. Hero Headline (NEXA Display Typography) */}
      <div className="relative z-10 max-w-4xl px-4 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <h1 className="font-display text-4xl sm:text-6xl lg:text-[72px] lg:leading-[80px] font-extrabold text-white tracking-[-0.035em]">
          All your enterprise
          <br />
          knowledge, in one verified flow.
        </h1>

        {/* 4. Primary Apple-Style CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <button
            onClick={() => {
              playResolvedChime();
              onEnterNexa();
            }}
            className="btn-orbitsat-purple px-8 py-3.5 rounded-full font-sans text-sm font-bold flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Apple className="w-4 h-4 fill-current mb-0.5" />
            <span>Launch Intelligence Core</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Dual 3D Floating Mobile Device Mockups (NEXA Intelligence Telemetry) */}
      <div
        className="relative z-10 w-full max-w-3xl mt-12 sm:mt-16 flex items-center justify-center transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${mockupTranslateY}px)` }}
      >
        {/* Left Floating Device (Contradiction & Arbitration Matrix) */}
        <div
          onClick={() => {
            playTactileClick();
            setSelectedCard('ARBITRATION');
          }}
          className={`w-[260px] sm:w-[290px] h-[520px] sm:h-[560px] iphone-bezel p-3.5 relative -mr-14 sm:-mr-20 z-10 orbit-float-left cursor-pointer transition-all duration-300 ${
            selectedCard === 'ARBITRATION'
              ? 'scale-105 shadow-[0_0_60px_rgba(168,85,247,0.5)] border-[#a855f7]'
              : 'opacity-80 hover:opacity-100'
          }`}
        >
          {/* Dynamic Island */}
          <div className="iphone-island" />

          {/* Screen Content */}
          <div className="w-full h-full bg-[#070514] rounded-[32px] p-4 pt-10 flex flex-col justify-between text-left font-sans border border-white/10 overflow-hidden relative">
            {/* Ambient Screen Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c3aed]/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-display text-sm font-bold text-white">Active Arbitration</span>
                <span className="font-mono text-[9px] bg-[#ef4444]/25 text-[#f87171] px-2 py-0.5 rounded-full font-bold">
                  CONFLICT DETECTED
                </span>
              </div>

              {/* Contradiction Alert Card */}
              <div className="apple-glass-pill p-3 rounded-2xl border border-white/10 mb-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#f87171]" /> HR Handbook 2023
                  </span>
                  <span className="font-mono text-[10px] text-[#f87171]">OUTDATED</span>
                </div>
                <p className="text-[10px] text-[#cbd5e1] leading-tight">
                  "Employees qualify for 10 consecutive business days of sabbatical leave."
                </p>
              </div>

              {/* Governing Active Card (Highlighted) */}
              <div className="p-3 rounded-2xl bg-[#7c3aed]/25 border border-[#a855f7]/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span className="flex items-center gap-1.5 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c084fc]" /> Exec Memo (Jan 2025)
                  </span>
                  <span className="font-mono text-[10px] text-[#c084fc] font-bold">GOVERNING</span>
                </div>
                <p className="text-[10px] text-white font-medium leading-tight">
                  "Board approved upgrade: 20 paid sabbatical days after 3 years service."
                </p>
              </div>

              {/* Live Precedence Verdict */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-[#94a3b8]">
                <span>VERDICT: Exec Memo takes legal precedence based on timestamp & authority.</span>
              </div>
            </div>

            {/* Bottom Screen Status Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-[#94a3b8]">
              <span className="flex items-center gap-1 text-[#38bdf8]">
                <ShieldCheck className="w-3 h-3" /> VERIFIED CITATION
              </span>
              <span className="text-[#c084fc] font-bold">CONFIDENCE 99.8%</span>
            </div>
          </div>
        </div>

        {/* Right Floating Device (Live Vector Neural Radar) */}
        <div
          onClick={() => {
            playTactileClick();
            setSelectedCard('RADAR');
          }}
          className={`w-[260px] sm:w-[290px] h-[520px] sm:h-[560px] iphone-bezel p-3.5 relative z-20 orbit-float-right cursor-pointer transition-all duration-300 ${
            selectedCard === 'RADAR'
              ? 'scale-105 shadow-[0_0_60px_rgba(168,85,247,0.5)] border-[#a855f7]'
              : 'opacity-90 hover:opacity-100'
          }`}
        >
          {/* Dynamic Island */}
          <div className="iphone-island" />

          {/* Screen Content */}
          <div className="w-full h-full bg-[#0a071c] rounded-[32px] p-4 pt-10 flex flex-col justify-between text-left font-sans border border-white/10 overflow-hidden relative">
            {/* Screen Glow */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#38bdf8]/15 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-display text-sm font-bold text-white">Neural Vectors</span>
                <span className="font-mono text-[9px] bg-[#38bdf8]/20 text-[#38bdf8] px-2 py-0.5 rounded-full font-bold">
                  AIR-GAPPED
                </span>
              </div>

              {/* Vector Cluster Radar Graphic */}
              <div className="w-full h-36 rounded-2xl apple-glass-pill border border-white/15 flex items-center justify-center relative overflow-hidden mb-3">
                <div className="w-28 h-28 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-18 h-18 rounded-full border border-[#a855f7]/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#7c3aed]/20 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#c084fc] animate-ping" />
                    </div>
                  </div>
                </div>
                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/10" />
                <span className="absolute bottom-1.5 right-2 font-mono text-[8px] text-[#94a3b8]">
                  EMBED // 1,536 DIM
                </span>
              </div>

              {/* Live Connected Connectors Summary */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[10px] p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8]">GOOGLE WORKSPACE</span>
                  <span className="text-[#4ade80] font-bold">1,842 DOCS SYNCED</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8]">NOTION & SLACK</span>
                  <span className="text-[#38bdf8] font-bold">REAL-TIME INGEST</span>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px]">
              <span className="text-[#4ade80] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" /> ZERO-HALLUCINATION
              </span>
              <span className="text-white/60">SOC2 COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
