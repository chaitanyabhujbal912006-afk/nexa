import React from 'react';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenSecurity?: () => void;
  onOpenApi?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenSecurity,
  onOpenApi,
}) => {
  return (
    <footer
      id="main-footer"
      className="w-full border-t border-[#262626] bg-[#080808] mt-auto relative z-10 py-12 px-6 sm:px-12 md:px-16"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        {/* Left Column: Brand & Architecture Metadata */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-16">
          <div className="text-2xl font-serif italic text-white tracking-tighter">
            Nexa.
          </div>

          <div className="flex flex-wrap gap-8 sm:gap-12">
            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#525252] mb-1.5 font-sans">
                Location
              </div>
              <div className="text-xs text-[#A3A3A3] font-light">
                Global VPC Cluster
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#525252] mb-1.5 font-sans">
                Engine
              </div>
              <div className="text-xs text-[#A3A3A3] font-light">
                MMXXIV (v2.4)
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#525252] mb-1.5 font-sans">
                Provenance
              </div>
              <div className="text-xs text-[#A3A3A3] font-light italic font-serif">
                Zero Retention Verified
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1F1F1F] w-full lg:w-auto justify-between">
          <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.2em] font-light text-[#737373]">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Protocol
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              onClick={onOpenSecurity}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Whitepaper
            </button>
            <button
              onClick={onOpenApi}
              className="hover:text-white transition-colors cursor-pointer"
            >
              API Spec
            </button>
          </div>

          <div className="text-[10px] text-[#525252] font-mono">
            © MMXXIV NEXA CORE
          </div>
        </div>
      </div>
    </footer>
  );
};
