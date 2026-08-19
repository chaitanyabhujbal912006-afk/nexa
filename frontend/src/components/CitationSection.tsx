import React, { useState } from 'react';
import { Bot, User, CheckCircle2, FileText, ExternalLink, BookOpen, Layers, ShieldCheck, Hash, Shield } from 'lucide-react';
import { playTactileClick } from '../utils/audio';

export const CitationSection: React.FC = () => {
  const [activeCitation, setActiveCitation] = useState<number | null>(1);

  const citationDetails: Record<number, { doc: string; location: string; quote: string; verifiedBy: string; hash: string }> = {
    1: {
      doc: 'refund_policy_v2.pdf',
      location: 'Page 3, Section 2.1 — Enterprise Hardware & Licensing',
      quote:
        'All bulk enterprise order returns must be formally transmitted through the verified enterprise client portal within 15 calendar days of recorded physical delivery.',
      verifiedBy: 'Legal Ops & Cryptographic Document Hash Check',
      hash: 'sha256:4f8b2d...9e71a',
    },
    2: {
      doc: 'enterprise_terms.pdf',
      location: 'Page 8, Clause 4B — Professional Services & Retainers',
      quote:
        'Upon commencement of staging deployment and dedicated systems integration, all related professional service fees and dedicated engineering retainers become strictly non-refundable.',
      verifiedBy: 'Finance Directorate & Master Contract Archive',
      hash: 'sha256:7c11a0...334fd',
    },
  };

  return (
    <section id="citations-section" className="w-full flex flex-col items-center gap-8 pt-8">
      {/* Title with Cursive Accent (Zero Font Clipping) */}
      <div className="text-center flex flex-col gap-2 max-w-3xl px-4 relative overflow-visible">
        <span className="font-cursive text-3xl sm:text-4xl text-[#bef264] font-bold mb-0.5 drop-shadow-[0_0_12px_rgba(190,242,100,0.5)] overflow-visible">
          Zero-Hallucination Evidence
        </span>
        <h2 className="font-syne text-3xl sm:text-5xl lg:text-[56px] lg:leading-[64px] font-extrabold text-[#f8fafc] tracking-[-0.035em] overflow-visible pb-1">
          Every answer has evidence.
        </h2>
        <p className="font-sans text-base text-[#cbd5e1] max-w-xl">
          No AI guessing or ungrounded assertions. Every statement is cryptographically anchored to verbatim indexed source documents.
        </p>
      </div>

      {/* Interactive Evidence Chat Box */}
      <div className="w-full max-w-4xl apple-glass-card rounded-[32px] p-1 relative shadow-2xl border border-white/20 overflow-visible">
        <div className="bg-[#070b18] rounded-[28px] p-6 sm:p-8 flex flex-col gap-6">
          {/* User Query */}
          <div className="flex gap-3.5 self-end max-w-[90%] sm:max-w-[80%]">
            <div className="apple-glass-pill text-[#f8fafc] p-4 rounded-2xl rounded-tr-sm font-sans text-sm sm:text-base border border-white/20 shadow-md">
              What is our current enterprise refund policy?
            </div>
            <div className="w-9 h-9 rounded-full bg-[#bef264]/20 flex-shrink-0 flex items-center justify-center border border-[#bef264]/40 text-[#bef264] shadow-[0_0_10px_rgba(190,242,100,0.4)]">
              <User className="w-4 h-4" />
            </div>
          </div>

          {/* AI Response */}
          <div className="flex gap-3.5 max-w-[96%] sm:max-w-[92%]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#bef264] to-[#38bdf8] flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(190,242,100,0.5)] text-[#090d1a] font-bold">
              <Bot className="w-5 h-5" />
            </div>

            <div className="apple-glass-pill text-[#f8fafc] p-5 sm:p-6 rounded-2xl rounded-tl-sm flex flex-col gap-4 border border-white/20 flex-grow shadow-lg">
              <p className="font-sans text-sm sm:text-base leading-relaxed">
                Bulk order returns must be initiated within 15 days of receipt{' '}
                <button
                  onClick={() => {
                    playTactileClick();
                    setActiveCitation(activeCitation === 1 ? null : 1);
                  }}
                  className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    activeCitation === 1
                      ? 'bg-[#bef264] text-[#090d1a] font-bold border-[#bef264] shadow-[0_0_8px_#bef264]'
                      : 'bg-[#bef264]/15 text-[#bef264] border-[#bef264]/40 hover:bg-[#bef264]/30'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>[1]</span>
                </button>
                , with non-refundable retainers for custom staging setups{' '}
                <button
                  onClick={() => {
                    playTactileClick();
                    setActiveCitation(activeCitation === 2 ? null : 2);
                  }}
                  className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    activeCitation === 2
                      ? 'bg-[#c084fc] text-[#090d1a] font-bold border-[#c084fc] shadow-[0_0_8px_#c084fc]'
                      : 'bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/40 hover:bg-[#c084fc]/30'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>[2]</span>
                </button>
                .
              </p>

              {/* Dynamic Interactive Evidence Drawer */}
              {activeCitation && citationDetails[activeCitation] && (
                <div className="bg-[#0a1022] rounded-xl p-4 border border-[#bef264]/40 shadow-[0_0_20px_rgba(190,242,100,0.15)] flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between font-mono text-xs text-[#bef264] font-bold">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      SOURCE [{activeCitation}]: {citationDetails[activeCitation].doc}
                    </span>
                    <span className="text-[#38bdf8] flex items-center gap-1 text-[10px]">
                      <Hash className="w-3 h-3" /> {citationDetails[activeCitation].hash}
                    </span>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-[#cbd5e1] italic pl-3 border-l-2 border-[#bef264]">
                    "{citationDetails[activeCitation].quote}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[10px] text-[#94a3b8]">
                    <span>{citationDetails[activeCitation].location}</span>
                    <span className="text-[#4ade80] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#4ade80]" /> {citationDetails[activeCitation].verifiedBy}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
