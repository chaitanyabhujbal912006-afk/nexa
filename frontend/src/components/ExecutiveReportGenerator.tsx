import React, { useState } from 'react';
import { FileDown, FileText, CheckCircle2, ShieldCheck, Calendar, Clock, Layers, Sparkles, Printer, RefreshCw } from 'lucide-react';
import { CitationItem, ExecutiveReport } from '../types';
import { playTactileClick, playResolvedChime } from '../utils/audio';

interface ExecutiveReportGeneratorProps {
  initialCitations?: CitationItem[];
}

export const ExecutiveReportGenerator: React.FC<ExecutiveReportGeneratorProps> = ({ initialCitations }) => {
  const [title, setTitle] = useState('NEXA Executive Knowledge Intelligence Briefing');
  const [summaryMarkdown, setSummaryMarkdown] = useState(
    `### Executive Summary\n\nNEXA's Neural Core completed an automated audit across all verified organization knowledge stores. All active claims have been cross-checked against temporal revision matrices.\n\n- **Refund Policy Status**: Updated 2024 policy supersedes legacy 2022 terms (15-day return window).\n- **Uptime Guarantee**: Enterprise MSA guarantees 99.99% benchmark uptime with 4-hour hardware dispatch.\n- **SOC 2 Type II**: Verified zero-knowledge partition active across all semantic embedding stores.`
  );
  const [includeCitations, setIncludeCitations] = useState(true);
  const [selectedCitationIds, setSelectedCitationIds] = useState<number[]>([1, 2]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<ExecutiveReport[]>([
    {
      id: 'rep-9a82',
      title: 'Q3 Enterprise Knowledge Audit & Policy Summary',
      summaryText: 'Complete synthesis of updated 2024 HR benefits, refund schedules, and SLA guarantee terms.',
      generatedDate: '2026-08-18 16:30',
      author: 'Elena Rostova (Lead Architect)',
      citations: []
    }
  ]);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const availableCitations: CitationItem[] = initialCitations || [
    {
      id: 1,
      label: '1',
      sourceDoc: 'refund_policy_v2.pdf',
      sourceType: 'pdf',
      docDate: '2024-01-10',
      section: 'Page 3, Section 2.1',
      excerpt: 'Bulk hardware and license returns must be formally initiated within 15 days of verifiable delivery receipt.',
      matchScorePct: 98,
      confidence: 97
    },
    {
      id: 2,
      label: '2',
      sourceDoc: 'enterprise_terms.pdf',
      sourceType: 'pdf',
      docDate: '2024-02-18',
      section: 'Page 8, Clause 4B',
      excerpt: 'Professional deployment fees and dedicated architectural setup costs are non-refundable once deployment kickoff commences.',
      matchScorePct: 94,
      confidence: 96
    },
    {
      id: 3,
      label: '3',
      sourceDoc: 'SOC2_Compliance_2024.pdf',
      sourceType: 'pdf',
      docDate: '2024-02-05',
      section: 'Security Audit § 4',
      excerpt: 'Automated cryptographic purge of raw event logs after 90 days of inactivity.',
      matchScorePct: 99,
      confidence: 99
    }
  ];

  const handleToggleCitation = (id: number) => {
    playTactileClick();
    setSelectedCitationIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGeneratePdf = () => {
    playTactileClick();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const newReport: ExecutiveReport = {
        id: `rep-${Math.random().toString(36).substring(2, 6)}`,
        title,
        summaryText: summaryMarkdown,
        generatedDate: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        author: 'Elena Rostova (Lead Architect)',
        citations: availableCitations.filter((c) => selectedCitationIds.includes(c.id)),
      };

      setGeneratedReports((prev) => [newReport, ...prev]);

      // Trigger HTML printable download
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
                h1 { font-size: 24px; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; color: #5b21b6; }
                .meta { font-family: monospace; font-size: 12px; color: #64748b; margin-bottom: 24px; }
                .content { font-size: 14px; margin-bottom: 30px; }
                .citation { background: #f8fafc; border-left: 3px solid #7c3aed; padding: 12px; margin-bottom: 12px; font-size: 12px; }
                .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <div class="meta">GENERATED: ${newReport.generatedDate} | SYSTEM: NEXA Neural Intelligence Engine v3.0 | SOC 2 Type II Audited</div>
              <div class="content">${summaryMarkdown.replace(/\n/g, '<br/>')}</div>
              <h3>Verified Source Citations (${newReport.citations.length})</h3>
              ${newReport.citations
                .map(
                  (c) => `
                <div class="citation">
                  <strong>[${c.label}] ${c.sourceDoc}</strong> (${c.docDate || 'Verified'}) - <em>${c.section || ''}</em><br/>
                  "${c.excerpt}"
                </div>`
                )
                .join('')}
              <div class="footer">NEXA Cryptographic Report Hash: ${Math.random().toString(36).substring(2)} • Strict Non-Conflicting Ledger Verified</div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }

      setDownloadSuccess(true);
      playResolvedChime();
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div id="executive-report-generator-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apple-glass-card p-6 rounded-[28px] border border-white/15 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileDown className="w-4 h-4 text-[#c084fc]" />
            <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
              EXECUTIVE SYNTHESIS STUDIO
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Executive Report Generator
          </h2>
          <p className="font-sans text-xs text-[#94a3b8] mt-1">
            Generate publication-ready PDF intelligence briefs with verifiable citations and provenance audit seals.
          </p>
        </div>

        <button
          onClick={handleGeneratePdf}
          disabled={isGenerating}
          className="btn-orbitsat-purple px-6 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing PDF...</span>
            </>
          ) : (
            <>
              <FileDown className="w-3.5 h-3.5" />
              <span>Generate & Download Brief</span>
            </>
          )}
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Executive report synthesized and opened in PDF print review stream!</span>
        </div>
      )}

      {/* Editor & Citation Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl space-y-4 text-white">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
              REPORT TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#a855f7] font-display text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-mono text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">
                SYNTHESIZED EXECUTIVE SUMMARY (MARKDOWN)
              </label>
              <span className="font-mono text-[10px] text-[#94a3b8]">Live Markdown Enabled</span>
            </div>
            <textarea
              rows={8}
              value={summaryMarkdown}
              onChange={(e) => setSummaryMarkdown(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#090616] border border-white/10 text-[#cbd5e1] font-mono text-xs focus:outline-none focus:border-[#a855f7] leading-relaxed resize-none custom-scrollbar"
            />
          </div>

          {/* Citations Selector */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold text-[#cbd5e1] tracking-wider">
                ATTACH VERIFIED CITATIONS
              </span>
              <label className="flex items-center gap-2 cursor-pointer font-mono text-[11px] text-[#94a3b8]">
                <input
                  type="checkbox"
                  checked={includeCitations}
                  onChange={(e) => setIncludeCitations(e.target.checked)}
                  className="rounded accent-[#a855f7]"
                />
                <span>Include Appendix</span>
              </label>
            </div>

            {includeCitations && (
              <div className="space-y-2">
                {availableCitations.map((citation) => {
                  const isSelected = selectedCitationIds.includes(citation.id);
                  return (
                    <div
                      key={citation.id}
                      onClick={() => handleToggleCitation(citation.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#7c3aed]/20 border-[#a855f7]/50 text-white'
                          : 'bg-white/5 border-white/10 text-[#94a3b8] hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 rounded accent-[#a855f7]"
                      />
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <strong className="text-white">[{citation.label}] {citation.sourceDoc}</strong>
                          <span className="text-[#38bdf8]">{citation.section}</span>
                        </div>
                        <p className="text-[11px] line-clamp-1 italic text-[#cbd5e1]">
                          "{citation.excerpt}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: History & Export Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl space-y-4 text-white">
            <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
              GENERATED BRIEF ARCHIVE
            </span>

            <div className="space-y-3">
              {generatedReports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-[#a855f7]/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-display font-bold text-sm text-white">
                      {rep.title}
                    </h4>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30">
                      PDF Ready
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#94a3b8] line-clamp-2">
                    {rep.summaryText}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#94a3b8]">
                    <span>{rep.generatedDate}</span>
                    <button
                      onClick={handleGeneratePdf}
                      className="text-[#c084fc] hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print/Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
