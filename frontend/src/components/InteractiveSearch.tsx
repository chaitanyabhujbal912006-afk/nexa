import React, { useState } from 'react';
import { Search, Mic, AlertTriangle, FileText, CheckCircle2, Copy, Check, CornerDownLeft, Volume2, Shield, Sparkles, Filter, Database } from 'lucide-react';
import { runQuery } from '../api/knowledge';
import type { ApiError } from '../api/client';
import { QueryResult } from '../types';
import { playTactileClick, playResolvedChime, playAlertWarble } from '../utils/audio';

interface InteractiveSearchProps {
  onSelectResult?: (result: QueryResult) => void;
  defaultQuery?: string;
}

export const InteractiveSearch: React.FC<InteractiveSearchProps> = ({
  onSelectResult,
  defaultQuery,
}) => {
  const [searchTerm, setSearchTerm] = useState(defaultQuery || '');
  const [activeResult, setActiveResult] = useState<QueryResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleQuery = async (query: string) => {
    playTactileClick();
    setSearchTerm(query);
    setIsSearching(true);
    setSelectedCitation(null);

    try {
      const result = await runQuery(query, 5, []);
      setActiveResult(result);
      if (result.conflictDetected) {
        playAlertWarble();
      } else {
        playResolvedChime();
      }
      if (onSelectResult) {
        onSelectResult(result);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const errorResult: QueryResult = {
        id: `err-${Date.now()}`,
        query,
        answerText: `⚠ Query failed: ${apiErr.message}`,
        confidence: 0,
        confidence_level: 'NONE',
        sourcesVerifiedCount: 0,
        conflictDetected: false,
        citations: [],
      };
      setActiveResult(errorResult);
      playAlertWarble();
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    handleQuery(searchTerm.trim());
  };

  const toggleMic = () => {
    playTactileClick();
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        handleQuery("What is our current refund policy?");
      }, 1500);
    }
  };

  const copyAnswer = () => {
    if (!activeResult) return;
    playTactileClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeResult.answerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section
      id="interactive-search"
      className="w-full flex flex-col items-center gap-8 py-8 relative z-10"
    >
      {/* Title with Cursive Accent (Zero Font Clipping) */}
      <div className="text-center flex flex-col items-center gap-1.5 max-w-2xl px-4 overflow-visible">
        <span className="font-cursive text-3xl sm:text-4xl text-[#bef264] font-bold drop-shadow-[0_0_12px_rgba(190,242,100,0.5)] overflow-visible">
          Natural Language Engine
        </span>
        <h2 className="font-syne text-2xl sm:text-4xl font-extrabold text-[#f8fafc] tracking-[-0.03em] overflow-visible pb-1">
          Ask Anything Across Your Company Knowledge
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#94a3b8]">
          Vectorized across Slack, Google Drive, Notion, Salesforce, and PDFs with real-time audit hashes.
        </p>
      </div>

      {/* Apple Glass Search Bar Form */}
      <form onSubmit={handleFormSubmit} className="w-full max-w-3xl relative">
        <div className="apple-glass-pill rounded-full p-2 sm:p-2.5 flex items-center gap-3 border border-white/20 hover:border-[#bef264]/60 transition-all shadow-[0_0_35px_rgba(190,242,100,0.15)] focus-within:border-[#bef264] focus-within:shadow-[0_0_40px_rgba(190,242,100,0.35)]">
          <div className="pl-3 text-[#bef264]">
            <Search className="w-5 h-5" />
          </div>

          <input
            id="nexa-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ask Nexa anything across policies, contracts, SLAs..."
            className="bg-transparent border-none text-[#f8fafc] font-sans text-sm sm:text-base w-full focus:outline-none placeholder:text-white/40"
          />

          {isListening && (
            <div className="flex items-center gap-1 px-3 py-1 bg-[#ef4444]/30 border border-[#ef4444]/60 rounded-full text-[#fca5a5] font-mono text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>Listening...</span>
            </div>
          )}

          {searchTerm && (
            <button
              type="submit"
              className="bg-gradient-to-r from-[#bef264] to-[#a3e635] text-[#090d1a] rounded-full px-5 py-2 font-sans text-xs font-bold uppercase transition-all cursor-pointer shadow-lg hover:scale-105"
            >
              Ask
            </button>
          )}

          <button
            type="button"
            onClick={toggleMic}
            title={isListening ? 'Stop listening' : 'Voice search'}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              isListening
                ? 'bg-[#ef4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                : 'bg-white/10 text-white/80 hover:text-white hover:bg-white/20'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Suggested Prompt Chips */}
      <div className="flex gap-2.5 justify-center flex-wrap items-center overflow-visible">
        <span className="font-cursive text-xl sm:text-2xl text-[#c084fc] font-bold overflow-visible">
          try asking:
        </span>
        <button
          type="button"
          onClick={() => handleQuery("What is our current refund policy?")}
          className="font-sans text-xs font-semibold text-white/90 apple-glass-pill rounded-full px-4 py-1.5 hover:border-[#bef264] hover:text-[#bef264] transition-all cursor-pointer"
        >
          "What is our current refund policy?"
        </button>
        <button
          type="button"
          onClick={() => handleQuery("Which warranty terms apply to Enterprise clients?")}
          className="font-sans text-xs font-semibold text-white/90 apple-glass-pill rounded-full px-4 py-1.5 hover:border-[#bef264] hover:text-[#bef264] transition-all cursor-pointer"
        >
          "Which warranty terms apply to Enterprise clients?"
        </button>
        <button
          type="button"
          onClick={() => handleQuery("How many days of paid sabbatical are employees entitled to?")}
          className="font-sans text-xs font-semibold text-white/90 apple-glass-pill rounded-full px-4 py-1.5 hover:border-[#bef264] hover:text-[#bef264] transition-all cursor-pointer hidden md:inline-block"
        >
          "How many days of paid sabbatical are employees entitled to?"
        </button>
      </div>

      {/* Loading Skeleton */}
      {isSearching && (
        <div className="w-full max-w-3xl apple-glass-card rounded-3xl p-8 border border-white/20 animate-pulse flex flex-col gap-4">
          <div className="h-4 bg-white/10 rounded-full w-1/3"></div>
          <div className="h-6 bg-white/15 rounded-full w-full"></div>
          <div className="h-6 bg-white/15 rounded-full w-4/5"></div>
          <div className="h-10 bg-white/5 rounded-2xl w-full mt-2"></div>
        </div>
      )}

      {/* Answer Output Card */}
      {!isSearching && activeResult && (
        <div
          id="search-result-card"
          className="w-full max-w-3xl apple-glass-card rounded-[28px] p-6 sm:p-8 border border-white/20 shadow-2xl flex flex-col gap-5 transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#bef264] animate-pulse" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                SYNTHESIZED INSIGHT
              </span>
              <span className="font-mono text-[10px] bg-[#bef264] text-[#090d1a] font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(190,242,100,0.4)]">
                {(activeResult.confidenceScore * 100).toFixed(0)}% CONFIDENCE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#94a3b8]">
                {activeResult.latencyMs}ms
              </span>
              <button
                onClick={copyAnswer}
                className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                title="Copy Answer Text"
              >
                {copied ? <Check className="w-4 h-4 text-[#bef264]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Answer Text */}
          <div className="space-y-4">
            <p className="font-sans text-base sm:text-lg text-[#f8fafc] leading-relaxed font-medium">
              {activeResult.answerText}
            </p>
          </div>

          {/* Conflict Resolution Detail */}
          {activeResult.conflictDetected && activeResult.conflictDetails && (
            <div className="bg-[#070b18] rounded-2xl p-4 sm:p-5 border border-[#ef4444]/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#f87171] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> AUTO-RESOLVED CONTRADICTION
                </span>
                <span className="text-white/60">
                  Precedence: Signed Policy &gt; Sales Pitch
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-[#ef4444]/20">
                  <span className="font-mono text-[10px] text-[#f87171] block font-bold mb-1">
                    OUTDATED: {activeResult.conflictDetails.outdatedSource} ({activeResult.conflictDetails.outdatedDate})
                  </span>
                  <p className="text-[#94a3b8] line-through">
                    "{activeResult.conflictDetails.outdatedClaim}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-[#bef264]/40 shadow-[0_0_15px_rgba(190,242,100,0.1)]">
                  <span className="font-mono text-[10px] text-[#bef264] block font-bold mb-1">
                    ACTIVE: {activeResult.conflictDetails.activeSource} ({activeResult.conflictDetails.activeDate})
                  </span>
                  <p className="text-[#f8fafc] font-medium">
                    "{activeResult.conflictDetails.activeClaim}"
                  </p>
                </div>
              </div>

              <div className="font-mono text-[11px] text-[#bef264] pt-2 border-t border-white/10">
                ↳ <strong>Verdict:</strong> {activeResult.conflictDetails.verdict}
              </div>
            </div>
          )}

          {/* Inline Citation Chips */}
          <div className="flex flex-col gap-2 pt-2">
            <span className="font-mono text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">
              VERIFIED SOURCES
            </span>
            <div className="flex flex-wrap gap-2">
              {activeResult.citations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    playTactileClick();
                    setSelectedCitation(c.id === selectedCitation ? null : c.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-sans font-semibold transition-all cursor-pointer ${
                    selectedCitation === c.id
                      ? 'bg-[#bef264] text-[#090d1a] border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.5)] font-bold'
                      : 'apple-glass-pill text-white hover:border-[#bef264]/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{c.sourceDoc}</span>
                  <span className="opacity-80 font-mono text-[10px]">[{c.pageOrClause}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
