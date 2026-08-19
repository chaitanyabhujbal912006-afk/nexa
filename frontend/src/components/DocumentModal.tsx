import React from 'react';
import { X, FileText, ShieldCheck } from 'lucide-react';
import { CitationItem } from '../types';

interface DocumentModalProps {
  documentName: string | null;
  citationItem?: CitationItem | null;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  documentName,
  citationItem,
  onClose,
}) => {
  if (!documentName && !citationItem) return null;

  const docTitle = citationItem?.docName || documentName || 'Enterprise Document';

  const getDocumentDetails = () => {
    if (docTitle.includes('refund') || docTitle.includes('terms')) {
      return {
        type: 'Master Agreement / Legal Terms',
        date: 'Updated: Jan 18, 2024',
        hash: 'SHA256: 4e9f...8a12',
        status: 'Active Enforced Standard',
        clauses: [
          {
            title: 'Section 2.1 — Return & Refund Window',
            text: 'Bulk enterprise unit procurements exceeding 50 seats or dedicated hardware nodes must initiate any claim for refund or replacement within fifteen (15) calendar days from verified delivery date.',
          },
          {
            title: 'Clause 4B — Professional Engineering & Integration Services',
            text: 'Allocated solutions architect hours, custom connector development, and cloud tenant staging fees are deemed non-refundable immediately upon sandbox provisioning.',
          },
        ],
      };
    }
    if (docTitle.includes('Handbook') || docTitle.includes('Benefits')) {
      return {
        type: docTitle.includes('2024') ? 'DOCX / Modern HR Policy' : 'PDF / Legacy Archive',
        date: docTitle.includes('2024') ? 'Effective: Mar 01, 2024' : 'Published: Jan 15, 2021 (Superseded)',
        status: docTitle.includes('2024') ? 'Active Global Policy' : 'Superseded by 2024 HR Memo',
        hash: 'SHA256: 9b21...7f04',
        clauses: [
          {
            title: 'Section 4 — Tenured Sabbatical Leave',
            text: docTitle.includes('2024')
              ? 'Full-time employees completing five (5) continuous years of service are eligible for fifteen (15) working days of paid sabbatical leave, to be scheduled with department leads.'
              : 'Employees are entitled to 45 days of paid sabbatical after 5 years of continuous service across all operating territories.',
          },
        ],
      };
    }
    return {
      type: 'Ingested Enterprise Record',
      date: 'Indexed: Q1 2024',
      hash: 'SHA256: 1a8c...55d2',
      status: 'Verified & Vectorized',
      clauses: [
        {
          title: 'Executive Summary',
          text: 'Enterprise-wide automated knowledge retrieval benchmark with strict cryptographic provenance guarantees.',
        },
      ],
    };
  };

  const details = getDocumentDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#262626] flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-[#333] flex items-center justify-center text-white bg-[#0A0A0A]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif text-white">{docTitle}</h3>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#737373] mt-0.5">
                <span>{details.type}</span>
                <span>•</span>
                <span>{details.date}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#737373] hover:text-white p-2 border border-transparent hover:border-[#333] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
          {/* Metadata banner */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#121212] border border-[#262626] text-xs">
            <div>
              <span className="text-[#525252] block text-[9px] uppercase tracking-[0.25em] font-mono">Status</span>
              <span className="text-white font-medium flex items-center gap-1.5 mt-1 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-white" /> {details.status}
              </span>
            </div>
            <div>
              <span className="text-[#525252] block text-[9px] uppercase tracking-[0.25em] font-mono">Provenance Hash</span>
              <span className="text-[#A3A3A3] font-mono mt-1 block text-xs">{details.hash}</span>
            </div>
          </div>

          {/* Excerpt Details */}
          <div>
            <h4 className="text-[9px] uppercase tracking-[0.3em] text-[#737373] font-sans mb-4">
              Verified Source Excerpt
            </h4>

            <div className="space-y-4">
              {details.clauses.map((clause, i) => (
                <div
                  key={i}
                  className="p-5 bg-[#0F0F0F] border border-[#262626]"
                >
                  <div className="text-xs font-sans uppercase tracking-[0.1em] text-white mb-2">{clause.title}</div>
                  <p className="text-sm font-serif italic text-[#D4D4D4] leading-relaxed border-l border-white pl-4 my-2">
                    &ldquo;{clause.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#262626] bg-[#121212] flex justify-between items-center text-xs">
          <span className="text-[#525252] text-[10px] uppercase tracking-[0.2em] font-mono">
            NEXA Core Grounding
          </span>
          <button
            onClick={onClose}
            className="border border-[#404040] bg-transparent text-[#D4D4D4] hover:bg-white hover:text-black hover:border-white px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
