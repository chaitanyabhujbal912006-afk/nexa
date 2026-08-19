import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface CtaSectionProps {
  onGetStarted: () => void;
  onExplore: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onGetStarted, onExplore }) => {
  return (
    <section
      id="enterprise"
      className="w-full flex flex-col items-center justify-center text-center py-20 sm:py-28 relative bg-[#121212] border border-[#262626] shadow-2xl"
    >
      {/* Corner brackets */}
      <div className="absolute -top-3 -left-3 w-8 h-8 border-t border-l border-[#404040]"></div>
      <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b border-r border-[#404040]"></div>

      <div className="z-10 flex flex-col items-center gap-8 px-6 max-w-3xl">
        <span className="text-[#D4D4D4] text-[10px] uppercase tracking-[0.4em] font-medium font-sans">
          Deployment Phase MMXXIV
        </span>

        {/* Title */}
        <h2 className="text-4xl sm:text-6xl lg:text-[72px] leading-[1.0] font-serif text-white tracking-tight">
          Stop searching.
          <br />
          <span className="italic font-light text-[#D4D4D4]">Start knowing.</span>
        </h2>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-[#737373] max-w-xl font-light leading-relaxed">
          Empower enterprise teams with cryptographic provenance, verified grounding, and instant temporal conflict resolution across millions of unindexed documents.
        </p>

        {/* Buttons in Gallery Style */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4">
          <button
            id="cta-get-started-btn"
            onClick={onGetStarted}
            className="bg-white text-black border border-white hover:bg-[#E5E5E5] px-10 py-4 text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            <span>Get Started with Nexa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="cta-explore-platform-btn"
            onClick={onExplore}
            className="border border-[#404040] bg-transparent text-[#D4D4D4] hover:bg-white hover:text-black hover:border-white px-10 py-4 text-[10px] uppercase tracking-[0.2em] font-light transition-all duration-300 cursor-pointer"
          >
            Explore the platform
          </button>
        </div>

        {/* Guarantee row in minimal style */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t border-[#262626] text-[9px] uppercase tracking-[0.25em] text-[#525252] font-mono">
          <span className="flex items-center gap-2">
            <Check className="w-3 h-3 text-[#A3A3A3]" /> Enterprise SSO & SCIM
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3 h-3 text-[#A3A3A3]" /> 14-Day Sandbox Trial
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-3 h-3 text-[#A3A3A3]" /> Solutions Architecture Onboarding
          </span>
        </div>
      </div>
    </section>
  );
};
