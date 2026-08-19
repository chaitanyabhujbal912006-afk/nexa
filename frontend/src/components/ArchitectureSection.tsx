import React from 'react';
import {
  Lock,
  Server,
  Zap,
  Shield,
  Maximize2,
} from 'lucide-react';

interface ArchitectureSectionProps {
  onOpenArchitectureDetails?: () => void;
}

export const ArchitectureSection: React.FC<ArchitectureSectionProps> = ({
  onOpenArchitectureDetails,
}) => {
  return (
    <section
      id="architecture"
      className="w-full flex flex-col items-center gap-12 pt-16"
    >
      {/* Title in Editorial Style */}
      <div className="text-center flex flex-col gap-4 max-w-2xl px-4">
        <span className="text-[#D4D4D4] text-[10px] uppercase tracking-[0.4em] font-medium font-sans">
          Infrastructure Topography
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-[56px] leading-[1.05] font-serif text-white">
          Powerful intelligence infrastructure
        </h2>
        <p className="text-xs sm:text-sm text-[#737373] leading-relaxed font-light">
          Engineered for zero telemetry leakage, sub-second vector synthesis, and mathematical provenance validation across private VPC boundaries.
        </p>
      </div>

      {/* Architecture Dashboard Visual Container */}
      <div
        id="architecture-preview-panel"
        className="w-full relative bg-[#121212] border border-[#262626] p-4 sm:p-6 shadow-2xl group cursor-pointer hover:border-[#404040] transition-all duration-500"
        onClick={() => onOpenArchitectureDetails?.()}
      >
        {/* Corner architectural ticks */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t border-l border-[#404040]"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b border-r border-[#404040]"></div>

        <div className="w-full overflow-hidden relative bg-[#070707] border border-[#262626]">
          <img
            alt="Enterprise Intelligence Architecture Dashboard"
            className="w-full h-auto object-cover opacity-75 grayscale group-hover:grayscale-0 group-hover:opacity-95 transition-all duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyoBehoEIIRcvlVD1UEvomFGFXYn5Me8SDKRPoh0guA9dHj3G1eAosfR3W18KA3MyY2Lu_3lC2CLkfvfh-WIhbP9dQX_elvUTDFHyaniTA2Rw_9NpMDq7L55yZfRhUl2hO3dgP6xTGbXF5QmOi_SAROGUsNhkFMwliRpyxOTj_sdeSeXOmG7qN8Y0cfcN2S-DaPJhn-eqa9kuUZ8AXgPDdy26UaOjnhfE1GPzfcFSBgMKmLi1g40eQ"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none"></div>

          {/* Interactive hotspot tag */}
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-[#0A0A0A] border border-[#333] text-white text-[9px] uppercase tracking-[0.25em] px-4 py-2 flex items-center gap-2 font-mono">
              <Maximize2 className="w-3 h-3" />
              <span>Blueprint 01-A</span>
            </span>
          </div>
        </div>
      </div>

      {/* Security Architecture Pillars in Minimalist Boxes */}
      <div id="compliance" className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-4">
        <div className="bg-[#0F0F0F] border border-[#262626] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Lock className="w-4 h-4 text-[#A3A3A3]" />
            <span className="text-[9px] font-mono text-[#525252]">01</span>
          </div>
          <div>
            <div className="text-xs font-sans text-white font-medium">AES-256 & TLS 1.3</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-[0.15em] mt-0.5">End-to-End Encryption</div>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-[#262626] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Server className="w-4 h-4 text-[#A3A3A3]" />
            <span className="text-[9px] font-mono text-[#525252]">02</span>
          </div>
          <div>
            <div className="text-xs font-sans text-white font-medium">VPC & Air-Gap</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-[0.15em] mt-0.5">Isolated Boundaries</div>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-[#262626] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Shield className="w-4 h-4 text-[#A3A3A3]" />
            <span className="text-[9px] font-mono text-[#525252]">03</span>
          </div>
          <div>
            <div className="text-xs font-sans text-white font-medium">SOC2 & HIPAA</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-[0.15em] mt-0.5">Continuous Compliance</div>
          </div>
        </div>

        <div className="bg-[#0F0F0F] border border-[#262626] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Zap className="w-4 h-4 text-[#A3A3A3]" />
            <span className="text-[9px] font-mono text-[#525252]">04</span>
          </div>
          <div>
            <div className="text-xs font-sans text-white font-medium">&lt; 180ms Latency</div>
            <div className="text-[10px] text-[#737373] uppercase tracking-[0.15em] mt-0.5">Sub-Second Synthesis</div>
          </div>
        </div>
      </div>
    </section>
  );
};
