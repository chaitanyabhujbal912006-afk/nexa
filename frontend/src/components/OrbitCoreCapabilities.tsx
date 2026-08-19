import React from 'react';
import { Satellite, Radio, ShieldCheck, Zap, Compass, RefreshCw, Cpu } from 'lucide-react';

export const OrbitCoreCapabilities: React.FC = () => {
  return (
    <section id="telemetry-story" className="w-full flex flex-col items-center gap-10 py-16 relative z-10">
      <div className="text-center max-w-2xl px-4">
        <span className="font-mono text-xs uppercase font-bold text-[#c084fc] tracking-widest">
          MISSION-CRITICAL CAPABILITIES
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
          Engineered for hostile RF environments.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        {/* Card 1 */}
        <div className="apple-glass-card rounded-[28px] p-6 sm:p-8 border border-white/10 hover:border-[#a855f7]/50 transition-all duration-300 flex flex-col justify-between gap-6 group hover:-translate-y-1">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/20 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc] group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Satellite className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Autonomous Keplerian Propagation
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Real-time NORAD Two-Line Element (TLE) calculation algorithms with offline atmospheric drag compensation.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 font-mono text-[10px] text-[#c084fc] font-bold">
            P99 PRECISION: &lt;0.05° AZ/EL
          </div>
        </div>

        {/* Card 2 */}
        <div className="apple-glass-card rounded-[28px] p-6 sm:p-8 border border-white/10 hover:border-[#38bdf8]/50 transition-all duration-300 flex flex-col justify-between gap-6 group hover:-translate-y-1">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.3)]">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Sub-Millisecond Doppler Sync
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Dynamic transceiver frequency compensation with automated CAT control for Icom, Yaesu, and SDR transceivers.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 font-mono text-[10px] text-[#38bdf8] font-bold">
            LATENCY: &lt;12ms REALTIME
          </div>
        </div>

        {/* Card 3 */}
        <div className="apple-glass-card rounded-[28px] p-6 sm:p-8 border border-white/10 hover:border-[#a855f7]/50 transition-all duration-300 flex flex-col justify-between gap-6 group hover:-translate-y-1">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#a855f7]/20 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc] group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Cryptographic Precedence Matrix
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Immutable conflict arbitration across RF regulations, mission directives, and field logs with tamper-proof hashing.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 font-mono text-[10px] text-[#4ade80] font-bold">
            SECURITY: ZERO-TRUST AIR-GAPPED
          </div>
        </div>
      </div>
    </section>
  );
};
