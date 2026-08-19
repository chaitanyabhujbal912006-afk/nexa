import React, { useState } from 'react';
import {
  User,
  Bot,
  ShieldCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { QueryScenario, CitationItem } from '../types';

interface CitationEvidenceSectionProps {
  scenario: QueryScenario;
  onOpenCitationModal: (citation: CitationItem) => void;
}

export const CitationEvidenceSection: React.FC<CitationEvidenceSectionProps> = ({
  scenario,
  onOpenCitationModal,
}) => {
  const [hoveredCitationId, setHoveredCitationId] = useState<number | null>(null);

  return (
    <section
      id="citation-evidence-section"
      className="w-full flex flex-col items-center gap-12 pt-16"
    >
      {/* Heading */}
      <div className="text-center flex flex-col gap-4 max-w-3xl px-4">
        <span className="text-[#D4D4D4] text-[10px] uppercase tracking-[0.4em] font-medium font-sans">
          Verifiable Grounding
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-[56px] leading-[1.05] font-serif text-white">
          Every answer has evidence.
        </h2>
      </div>

      {/* Chat Evidence Container */}
      <div className="w-full max-w-4xl bg-[#121212] border border-[#262626] p-6 sm:p-10 shadow-2xl relative">
        <div className="flex flex-col gap-8">
          {/* User Query Bubble */}
          <div className="flex gap-4 self-end max-w-[90%] sm:max-w-[80%]">
            <div className="bg-[#0A0A0A] text-[#E5E5E5] p-5 border border-[#262626] text-xs sm:text-sm font-light leading-relaxed">
              {scenario.question}
            </div>
            <div className="w-8 h-8 bg-[#171717] border border-[#333] flex-shrink-0 flex items-center justify-center text-[#737373]">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* AI Response Bubble with Linked Citations */}
          <div className="flex gap-4 max-w-[98%] sm:max-w-[92%]">
            <div className="w-8 h-8 bg-white text-black flex-shrink-0 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>

            <div className="bg-[#0A0A0A] border border-[#262626] p-6 sm:p-8 flex-1">
              {/* AI Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#262626]">
                <span className="text-[9px] uppercase tracking-[0.3em] text-white font-sans flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" /> Nexa Verified Output
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#737373] border border-[#262626] px-2 py-0.5 font-mono">
                  {scenario.confidence}% Confidence
                </span>
              </div>

              {/* Verified Body Text with highlighted in-text citation links */}
              <p className="mb-6 leading-relaxed text-[#D4D4D4] font-serif text-sm sm:text-base">
                {scenario.id === 'refund' ? (
                  <>
                    For Enterprise clients, the current refund policy states that bulk order
                    returns must be initiated within{' '}
                    <span
                      onClick={() => onOpenCitationModal(scenario.citations[0])}
                      onMouseEnter={() => setHoveredCitationId(1)}
                      onMouseLeave={() => setHoveredCitationId(null)}
                      className={`px-2 py-0.5 border transition-all cursor-pointer font-sans text-xs ${
                        hoveredCitationId === 1
                          ? 'bg-white text-black border-white'
                          : 'bg-[#171717] text-white border-[#333] hover:border-white'
                      }`}
                    >
                      15 days of receipt [1]
                    </span>
                    . Additionally, custom integration fees are{' '}
                    <span
                      onClick={() => onOpenCitationModal(scenario.citations[1])}
                      onMouseEnter={() => setHoveredCitationId(2)}
                      onMouseLeave={() => setHoveredCitationId(null)}
                      className={`px-2 py-0.5 border transition-all cursor-pointer font-sans text-xs ${
                        hoveredCitationId === 2
                          ? 'bg-white text-black border-white'
                          : 'bg-[#171717] text-white border-[#333] hover:border-white'
                      }`}
                    >
                      non-refundable once deployment begins [2]
                    </span>
                    .
                  </>
                ) : (
                  scenario.verifiedAnswer
                )}
              </p>

              {/* Citations List Cards */}
              <div className="flex flex-col gap-3 pt-6 border-t border-[#262626]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#737373] font-sans">
                    Cited Evidence ({scenario.citations.length} Provenance Records)
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#525252] hidden sm:inline font-mono">
                    Click record to inspect raw plate
                  </span>
                </div>

                {scenario.citations.map((cite) => (
                  <div
                    key={cite.id}
                    id={`citation-item-${cite.id}`}
                    onClick={() => onOpenCitationModal(cite)}
                    onMouseEnter={() => setHoveredCitationId(cite.id)}
                    onMouseLeave={() => setHoveredCitationId(null)}
                    className={`flex items-center gap-4 p-4 border transition-all cursor-pointer group ${
                      hoveredCitationId === cite.id
                        ? 'bg-[#171717] border-white'
                        : 'bg-[#0F0F0F] border-[#262626] hover:border-[#404040]'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold w-6 h-6 flex items-center justify-center border border-[#333] bg-[#0A0A0A] text-white flex-shrink-0">
                      0{cite.id}
                    </span>

                    <FileText className="w-4 h-4 text-[#737373] group-hover:text-white transition-colors flex-shrink-0" />

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-sans text-white font-medium truncate">
                        {cite.docName}
                      </span>
                      <span className="text-[10px] text-[#737373] truncate hidden sm:block font-light">
                        {cite.excerpt.slice(0, 80)}...
                      </span>
                    </div>

                    <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                      <span className="text-[#525252] text-[10px] font-mono group-hover:text-[#A3A3A3]">
                        {cite.pageOrSection}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#525252] group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
