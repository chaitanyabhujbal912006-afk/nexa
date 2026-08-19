import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Check,
  ShieldCheck,
  Calendar,
  ArrowRightLeft,
} from 'lucide-react';
import { CONFLICT_RECORDS } from '../data/mockKnowledge';

interface ConflictDetectionSectionProps {
  onInspectDoc?: (docName: string) => void;
}

export const ConflictDetectionSection: React.FC<ConflictDetectionSectionProps> = ({
  onInspectDoc,
}) => {
  const [selectedConflictIndex, setSelectedConflictIndex] = useState(0);
  const currentConflict = CONFLICT_RECORDS[selectedConflictIndex] || CONFLICT_RECORDS[0];

  return (
    <section
      id="conflict-detection-section"
      className="w-full flex flex-col items-center gap-12 pt-16"
    >
      {/* Title */}
      <div className="text-center flex flex-col gap-4 max-w-3xl px-4">
        <span className="text-[#D4D4D4] text-[10px] uppercase tracking-[0.4em] font-medium font-sans">
          Temporal Reconciliation
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-[56px] leading-[1.05] font-serif text-white">
          Don&apos;t just find an answer.
          <br />
          <span className="italic font-light text-[#D4D4D4]">Know which answer is right.</span>
        </h2>
      </div>

      {/* Main Conflict Resolution Architectural Plate */}
      <div className="w-full max-w-5xl bg-[#121212] border border-[#262626] p-6 sm:p-10 shadow-2xl relative">
        {/* Architectural corner crosshair */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#404040] to-transparent"></div>

        {/* Conflict topic selector tabs */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-[#262626] flex-wrap">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#737373] font-sans">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#A3A3A3]" />
            <span>Case Study:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CONFLICT_RECORDS.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedConflictIndex(idx)}
                className={`text-[10px] uppercase tracking-[0.2em] px-4 py-2 transition-all cursor-pointer ${
                  selectedConflictIndex === idx
                    ? 'bg-white text-black font-medium border border-white'
                    : 'bg-[#0A0A0A] text-[#737373] border border-[#262626] hover:text-white hover:border-[#404040]'
                }`}
              >
                {c.topic}
              </button>
            ))}
          </div>
        </div>

        {/* Side by side comparison: Outdated vs Active */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 relative z-10">
          {/* Old Policy Card */}
          <div
            id="outdated-source-card"
            onClick={() => onInspectDoc?.(currentConflict.outdatedSource.docName)}
            className="bg-[#0A0A0A] border border-[#262626] p-6 relative hover:border-[#404040] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[#737373] group-hover:text-white transition-colors">
                  <FileText className="w-3.5 h-3.5 text-[#A3A3A3]" />
                  <span className="text-xs font-sans font-medium">
                    {currentConflict.outdatedSource.docName}
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#737373] border border-[#262626] px-2 py-0.5 font-mono">
                  Outdated Source
                </span>
              </div>

              <p className="text-sm font-serif italic text-[#737373] line-through decoration-[#525252] leading-relaxed my-4">
                {currentConflict.outdatedSource.snippet}
              </p>
            </div>

            <div className="pt-4 border-t border-[#262626] flex justify-between items-center text-[#525252] text-[9px] uppercase tracking-[0.2em] font-mono">
              <span>Date: {currentConflict.outdatedSource.date}</span>
              <span>Conf: {currentConflict.outdatedSource.confidence}%</span>
            </div>
          </div>

          {/* Active Policy Card */}
          <div
            id="active-policy-card"
            onClick={() => onInspectDoc?.(currentConflict.activeSource.docName)}
            className="bg-[#171717] border border-[#404040] p-6 relative hover:border-white transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-white">
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-sans font-medium">
                    {currentConflict.activeSource.docName}
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.25em] bg-white text-black font-medium px-2 py-0.5 font-mono">
                  Active Enforced
                </span>
              </div>

              <p className="text-sm font-serif italic text-white leading-relaxed my-4">
                {currentConflict.activeSource.snippet}
              </p>
            </div>

            <div className="pt-4 border-t border-[#262626] flex justify-between items-center text-[#A3A3A3] text-[9px] uppercase tracking-[0.2em] font-mono">
              <span>Date: {currentConflict.activeSource.date}</span>
              <span className="text-white">Conf: {currentConflict.activeSource.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Verdict Banner */}
        <div className="mt-8 bg-[#0A0A0A] border border-[#262626] p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-[0.3em] text-[#737373] font-mono">
              Observation:
            </div>
            <p className="text-xs text-[#A3A3A3] font-light">
              {currentConflict.conflictDescription}
            </p>
          </div>

          <div className="md:border-l border-[#262626] md:pl-6 space-y-1">
            <div className="text-[9px] uppercase tracking-[0.3em] text-white font-mono">
              {currentConflict.verdict}:
            </div>
            <p className="text-xs font-serif italic text-white">
              {currentConflict.verdictReason}
            </p>
          </div>
        </div>

        {/* Verification Status Badges */}
        <div className="flex flex-wrap gap-4 mt-8 justify-center items-center">
          <span className="border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-[9px] uppercase tracking-[0.25em] text-[#737373] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A3A3A3]" /> Source Verified
          </span>
          <span className="border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-[9px] uppercase tracking-[0.25em] text-[#737373] flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#A3A3A3]" /> Temporal Order Confirmed
          </span>
          <span className="border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-[9px] uppercase tracking-[0.25em] text-[#737373] flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#A3A3A3]" /> Conflict Reconciled
          </span>
        </div>
      </div>
    </section>
  );
};
