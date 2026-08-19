import React, { useState } from 'react';
import { Radio, Satellite, ShieldCheck, Compass, Activity, ArrowRight, Check, Zap, Layers, RefreshCw, Cpu } from 'lucide-react';
import { playTactileClick, playResolvedChime } from '../utils/audio';

export const OrbitFeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracking' | 'arbitration' | 'evidence'>('tracking');
  const [isSimulating, setIsSimulating] = useState(false);

  const triggerSimulation = () => {
    playTactileClick();
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      playResolvedChime();
    }, 700);
  };

  return (
    <section id="features-showcase" className="w-full flex flex-col items-center gap-10 pt-16 pb-12 relative z-10">
      {/* Section Header */}
      <div className="text-center flex flex-col items-center gap-3 max-w-2xl px-4">
        <span className="font-mono text-xs uppercase font-bold text-[#c084fc] tracking-widest">
          FIELD OPERATIONS SUITE
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Precision telemetry, everywhere.
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#94a3b8]">
          Built for aerospace field engineers, RF operators, and mission critical intelligence units.
        </p>
      </div>

      {/* Interactive Segmented Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full apple-glass-pill border border-white/10 shadow-xl max-w-xl w-full">
        <button
          onClick={() => {
            playTactileClick();
            setActiveTab('tracking');
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-full font-sans text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tracking'
              ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Orbit Passes & Tracking
        </button>

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
          Real-Time Arbitration
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

        {activeTab === 'tracking' && (
          <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
            <div className="space-y-4 text-left">
              <span className="font-mono text-[10px] text-[#c084fc] font-bold uppercase tracking-wider bg-[#7c3aed]/20 px-3 py-1 rounded-full">
                PASS PREDICTION ENGINE
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Live SGP4 / Norad Orbital Trajectories
              </h3>
              <p className="font-sans text-sm text-[#cbd5e1] leading-relaxed">
                Compute sub-degree elevation and azimuth curves for NOAA, Meteor, and CubeSat constellations with zero internet connectivity required.
              </p>

              <div className="space-y-2 font-mono text-xs text-[#94a3b8] pt-2">
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-4 h-4 text-[#c084fc]" />
                  <span>Sub-millisecond Doppler frequency compensation</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="w-4 h-4 text-[#c084fc]" />
                  <span>Rotator protocol integration (Yaesu GS-232B, EasyComm)</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={triggerSimulation}
                  disabled={isSimulating}
                  className="btn-orbitsat-purple px-6 py-2.5 rounded-full font-sans text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                  <span>Calculate Next Pass Trajectory</span>
                </button>
              </div>
            </div>

            {/* Visual Live Pass Telemetry Panel */}
            <div className="p-6 rounded-2xl bg-[#090616] border border-white/10 shadow-2xl font-mono text-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-white font-bold flex items-center gap-2">
                  <Satellite className="w-4 h-4 text-[#c084fc]" /> METEOR-M 2-4
                </span>
                <span className="text-[#4ade80] flex items-center gap-1 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> ACQUISITION READY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8] text-[10px] block">AOS TIME</span>
                  <span className="text-white font-bold text-sm">11:24:18 UTC</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8] text-[10px] block">MAX ELEVATION</span>
                  <span className="text-[#c084fc] font-bold text-sm">78.4° (Zenith)</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8] text-[10px] block">FREQUENCY</span>
                  <span className="text-white font-bold text-sm">137.100 MHz</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[#94a3b8] text-[10px] block">DOPPLER OFFSET</span>
                  <span className="text-[#38bdf8] font-bold text-sm">+2,840 Hz</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'arbitration' && (
          <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
            <div className="space-y-4 text-left">
              <span className="font-mono text-[10px] text-[#c084fc] font-bold uppercase tracking-wider bg-[#7c3aed]/20 px-3 py-1 rounded-full">
                CONFLICT ARBITRATION
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Timestamp & Precedence Overrides
              </h3>
              <p className="font-sans text-sm text-[#cbd5e1] leading-relaxed">
                Automatically detects when outdated field handbooks or obsolete frequency coordination tables conflict with newly signed FCC/ITU spectrum licenses.
              </p>

              <div className="p-3.5 rounded-xl bg-[#7c3aed]/15 border border-[#a855f7]/40 text-xs font-mono text-white">
                Verdict: Jan 2025 ITU spectrum coordination revision takes legal precedence over legacy 2022 documents.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090616] border border-white/10 shadow-2xl font-mono text-xs space-y-3">
              <div className="p-3 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30">
                <span className="text-[#f87171] text-[10px] font-bold block">OUTDATED RECORD // 2022</span>
                <span className="text-white">"Secondary telemetry downlink allocation on 436.200 MHz."</span>
              </div>
              <div className="p-3 rounded-xl bg-[#a855f7]/20 border border-[#a855f7]/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <span className="text-[#c084fc] text-[10px] font-bold block">GOVERNING ACTIVE RECORD // 2025</span>
                <span className="text-white font-bold">"Primary frequency updated to 436.500 MHz with QPSK modulation."</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="grid md:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
            <div className="space-y-4 text-left">
              <span className="font-mono text-[10px] text-[#38bdf8] font-bold uppercase tracking-wider bg-[#38bdf8]/20 px-3 py-1 rounded-full">
                ZERO-HALLUCINATION PROOF
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Cryptographic Document Hashes
              </h3>
              <p className="font-sans text-sm text-[#cbd5e1] leading-relaxed">
                Every assertion links directly to verbatim indexed source document clauses verified with SHA-256 integrity checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090616] border border-white/10 shadow-2xl font-mono text-xs space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[#94a3b8] text-[10px] block">DOCUMENT HASH</span>
                <span className="text-[#38bdf8] font-bold">sha256:7c11a0b3...99ef</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[#94a3b8] text-[10px] block">VERIFIED SIGN-OFF</span>
                <span className="text-[#4ade80] font-bold">Audited by Aerospace Ground Ops (100% Match)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
