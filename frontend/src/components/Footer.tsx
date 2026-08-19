import React from 'react';
import { Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="main-footer" className="w-full py-12 border-t border-white/10 bg-[#06040e] mt-auto relative z-10 font-mono text-xs">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#38bdf8] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.6)]">
            <div className="w-full h-full bg-[#0d0a1c] rounded-[6px] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#c084fc] fill-current" />
            </div>
          </div>
          <span className="font-display font-bold text-base text-white tracking-wider">
            NEXA <span className="text-[#a855f7] font-mono text-[9px] font-bold">INTELLIGENCE</span>
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-[#94a3b8]">
          <a
            href="#arbitration"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#c084fc] transition-colors"
          >
            Policy Arbitration
          </a>
          <a
            href="#neural"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#c084fc] transition-colors"
          >
            Vector Graph
          </a>
          <a
            href="#citations"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#c084fc] transition-colors"
          >
            SHA-256 Citations
          </a>
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#c084fc] transition-colors"
          >
            Zero-Trust Privacy
          </a>
        </div>

        <div className="text-[#64748b]">
          © 2025 NEXA Intelligence Systems. All Vector Indexes Operational.
        </div>
      </div>
    </footer>
  );
};
